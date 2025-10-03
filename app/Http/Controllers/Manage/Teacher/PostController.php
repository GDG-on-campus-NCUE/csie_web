<?php

namespace App\Http\Controllers\Manage\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manage\Teacher\StorePostRequest;
use App\Http\Requests\Manage\Teacher\UpdatePostRequest;
use App\Http\Resources\Manage\PostDetailResource;
use App\Http\Resources\Manage\PostResource;
use App\Models\Attachment;
use App\Models\ManageActivity;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    /**
     * Teacher 模組允許的公告狀態。
     */
    private const STATUS_LABELS = [
        'draft' => '草稿',
        'scheduled' => '排程發佈',
        'published' => '已發佈',
        'archived' => '已封存',
    ];

    /**
     * 顯示教師公告管理頁面。
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Post::class);

        $user = $request->user();

        $filters = [
            'keyword' => $request->string('keyword')->trim()->toString() ?: null,
            'status' => $request->string('status')->trim()->toString() ?: null,
            'tag' => $request->string('tag')->trim()->toString() ?: null,
            'category' => $request->integer('category') ?: null,
            'per_page' => $request->integer('per_page') ?: 10,
        ];

        $perPage = max(5, min(50, $filters['per_page'] ?? 10));

        // 建立基礎查詢：教師僅能看到自己建立的公告，管理員則限定查看教師建立的公告。
        $baseQuery = Post::query()
            ->with(['category:id,name', 'creator:id,name', 'tags:id,name,slug', 'attachments' => function ($query) {
                $query->select(['id', 'attached_to_id', 'title', 'filename', 'file_url', 'external_url', 'mime_type', 'size', 'sort_order']);
            }])
            ->withCount('attachments');

        if (! $user->isAdmin()) {
            $baseQuery->where('created_by', $user->id);
        } else {
            $baseQuery->whereHas('creator', function ($builder) {
                $builder->where('role', 'teacher');
            });
        }

        // 套用關鍵字搜尋。
        if ($filters['keyword']) {
            $keyword = '%' . Str::lower($filters['keyword']) . '%';
            $baseQuery->where(function ($builder) use ($keyword) {
                $builder->whereRaw('LOWER(title) LIKE ?', [$keyword])
                    ->orWhereRaw('LOWER(summary) LIKE ?', [$keyword])
                    ->orWhereRaw('LOWER(target_audience) LIKE ?', [$keyword]);
            });
        }

        // 套用狀態篩選。
        if ($filters['status'] && array_key_exists($filters['status'], self::STATUS_LABELS)) {
            $statusValue = Post::STATUS_MAP[$filters['status']] ?? null;
            if ($statusValue !== null) {
                $baseQuery->where('status', $statusValue);
            }
        }

        // 套用分類篩選。
        if ($filters['category']) {
            $baseQuery->where('category_id', $filters['category']);
        }

        // 套用標籤篩選。
        if ($filters['tag'] && Tag::tableExists()) {
            $tagValue = Str::lower($filters['tag']);
            $tagId = is_numeric($filters['tag']) ? (int) $filters['tag'] : null;

            $baseQuery->whereHas('tags', function ($tagQuery) use ($tagValue, $tagId) {
                $tagQuery->whereRaw('LOWER(tags.slug) = ?', [$tagValue])
                    ->orWhereRaw('LOWER(tags.name) = ?', [$tagValue]);

                if ($tagId !== null) {
                    $tagQuery->orWhere('tags.id', $tagId);
                }
            });
        }

        $posts = $baseQuery
            ->orderByDesc('pinned')
            ->orderByDesc('published_at')
            ->orderByDesc('updated_at')
            ->paginate($perPage)
            ->withQueryString();

        $statusCounts = (clone $baseQuery)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->mapWithKeys(fn ($count, $statusValue) => [array_flip(Post::STATUS_MAP)[$statusValue] ?? $statusValue => (int) $count])
            ->all();

        $postsData = [
            'data' => PostResource::collection($posts->items())->resolve(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'from' => $posts->firstItem(),
                'last_page' => $posts->lastPage(),
                'path' => $posts->path(),
                'per_page' => $posts->perPage(),
                'to' => $posts->lastItem(),
                'total' => $posts->total(),
            ],
            'links' => [
                'first' => $posts->url(1),
                'last' => $posts->url($posts->lastPage()),
                'prev' => $posts->previousPageUrl(),
                'next' => $posts->nextPageUrl(),
            ],
        ];

        $filterOptions = [
            'statuses' => collect(self::STATUS_LABELS)
                ->map(fn ($label, $status) => [
                    'value' => $status,
                    'label' => $label,
                    'count' => $statusCounts[$status] ?? 0,
                ])->values()->all(),
            'categories' => PostCategory::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get()
                ->map(fn (PostCategory $category) => [
                    'value' => $category->id,
                    'label' => $category->name,
                ])->all(),
            'tags' => Tag::tableExists()
                ? Tag::query()
                    ->forContext('posts')
                    ->select(['id', 'name', 'slug'])
                    ->orderBy('name')
                    ->limit(30)
                    ->get()
                    ->map(fn (Tag $tag) => [
                        'value' => $tag->slug ?? (string) $tag->id,
                        'label' => $tag->name,
                        'id' => $tag->id,
                    ])->all()
                : [],
        ];

        return Inertia::render('manage/teacher/posts/index', [
            'posts' => $postsData,
            'filters' => $filters,
            'filterOptions' => $filterOptions,
            'statusSummary' => $statusCounts,
            'abilities' => [
                'canCreate' => $user?->can('create', Post::class) ?? false,
                'canQuickPublish' => true,
                'canDuplicate' => true,
            ],
        ]);
    }

    /**
     * 顯示新增教師公告頁面。
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Post::class);

        return Inertia::render('manage/teacher/posts/create', [
            'availableTags' => $this->getAvailableTags(),
            'formOptions' => $this->getFormOptions(),
        ]);
    }

    /**
     * 儲存新的教師公告。
     */
    public function store(StorePostRequest $request): RedirectResponse
    {
        $this->authorize('create', Post::class);

        $validated = $request->validated();
        $user = $request->user();

        $status = $validated['status'];
        $publishedAt = $validated['published_at'] ? Carbon::parse($validated['published_at']) : null;
        if ($status === 'published' && ! $publishedAt) {
            $publishedAt = now();
        }
        if (! in_array($status, ['published', 'scheduled'], true)) {
            $publishedAt = null;
        }

        $courseStart = $validated['course_start_at'] ? Carbon::parse($validated['course_start_at']) : null;
        $courseEnd = $validated['course_end_at'] ? Carbon::parse($validated['course_end_at']) : null;
        $tagNames = $this->explodeTags($validated['tags'] ?? null);
        $slug = Post::generateUniqueSlug($validated['title'], $validated['slug'] ?? null);

        $post = DB::transaction(function () use ($validated, $user, $status, $publishedAt, $courseStart, $courseEnd, $tagNames, $slug, $request) {
            /** @var \App\Models\Post $post */
            $post = new Post();
            $post->fill([
                'category_id' => $validated['category_id'],
                'space_id' => $validated['space_id'] ?? null,
                'status' => $status,
                'summary' => $validated['summary'] ?? null,
                'content' => $validated['content'],
                'target_audience' => $validated['target_audience'] ?? null,
                'course_start_at' => $courseStart,
                'course_end_at' => $courseEnd,
                'published_at' => $publishedAt,
                'title' => $validated['title'],
                'title_en' => $validated['title'],
                'excerpt' => $validated['summary'] ?? null,
                'excerpt_en' => $validated['summary'] ?? null,
                'summary_en' => $validated['summary'] ?? null,
                'content_en' => $validated['content'],
                'visibility' => 'internal',
                'pinned' => false,
                'source_type' => 'manual',
                'views' => 0,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            $post->slug = $slug;
            $post->tags = $tagNames;
            $post->save();

            $uploadedFiles = $request->file('attachments', []);
            $this->storeUploadedAttachments($post, $uploadedFiles, $user->id);
            $this->syncAttachmentMetadata($post);

            return $post->fresh(['tags']);
        });

        ManageActivity::log(
            $user,
            'teacher.post.created',
            $post,
            [
                'status' => $post->status,
                'course_start_at' => optional($post->course_start_at)->toIso8601String(),
                'course_end_at' => optional($post->course_end_at)->toIso8601String(),
            ],
            '教師建立公告：' . $post->title
        );

        return redirect()
            ->route('manage.teacher.posts.index')
            ->with('success', '公告建立成功。');
    }

    /**
     * 顯示教師公告內容。
     */
    public function show(Request $request, Post $post): Response
    {
        $this->authorize('view', $post);
        $this->ensureTeacherCanManage($request->user(), $post);

        $post->load([
            'category:id,name',
            'tags:id,name,slug',
            'attachments' => fn ($query) => $query
                ->with('uploader:id,name')
                ->orderBy('sort_order')
                ->orderBy('id'),
        ]);

        return Inertia::render('manage/teacher/posts/show', [
            'post' => PostDetailResource::make($post)->resolve(),
            'abilities' => [
                'canUpdate' => $request->user()?->can('update', $post) ?? false,
                'canDelete' => $request->user()?->can('delete', $post) ?? false,
            ],
        ]);
    }

    /**
     * 顯示編輯教師公告頁面。
     */
    public function edit(Request $request, Post $post): Response
    {
        $this->authorize('update', $post);
        $this->ensureTeacherCanManage($request->user(), $post);

        $post->load(['tags:id,name,slug', 'attachments']);

        return Inertia::render('manage/teacher/posts/edit', [
            'availableTags' => $this->getAvailableTags(),
            'formOptions' => $this->getFormOptions(),
            'post' => $this->formatPostForForm($post),
        ]);
    }

    /**
     * 更新教師公告。
     */
    public function update(UpdatePostRequest $request, Post $post): RedirectResponse
    {
        $this->authorize('update', $post);
        $this->ensureTeacherCanManage($request->user(), $post);

        $validated = $request->validated();
        $user = $request->user();

        $status = $validated['status'];
        $publishedAt = $validated['published_at'] ? Carbon::parse($validated['published_at']) : null;
        if ($status === 'published' && ! $publishedAt) {
            $publishedAt = now();
        }
        if (! in_array($status, ['published', 'scheduled'], true)) {
            $publishedAt = null;
        }

        $courseStart = $validated['course_start_at'] ? Carbon::parse($validated['course_start_at']) : null;
        $courseEnd = $validated['course_end_at'] ? Carbon::parse($validated['course_end_at']) : null;
        $tagNames = $this->explodeTags($validated['tags'] ?? null);
        $keepIds = $validated['keep_attachment_ids'] ?? [];
        $slug = Post::generateUniqueSlug($validated['title'], $validated['slug'] ?? null, $post->id);

        $originalStatus = $post->status;

        $post = DB::transaction(function () use ($post, $validated, $status, $publishedAt, $courseStart, $courseEnd, $tagNames, $keepIds, $slug, $request, $user) {
            $post->fill([
                'category_id' => $validated['category_id'],
                'space_id' => $validated['space_id'] ?? null,
                'status' => $status,
                'summary' => $validated['summary'] ?? null,
                'content' => $validated['content'],
                'target_audience' => $validated['target_audience'] ?? null,
                'course_start_at' => $courseStart,
                'course_end_at' => $courseEnd,
                'published_at' => $publishedAt,
                'title' => $validated['title'],
                'title_en' => $validated['title'],
                'excerpt' => $validated['summary'] ?? null,
                'excerpt_en' => $validated['summary'] ?? null,
                'summary_en' => $validated['summary'] ?? null,
                'content_en' => $validated['content'],
                'visibility' => $post->visibility,
                'updated_by' => $user->id,
            ]);

            $post->slug = $slug;
            $post->tags = $tagNames;
            $post->save();

            $this->removeUnkeptAttachments($post, $keepIds);
            $uploadedFiles = $request->file('attachments', []);
            $this->storeUploadedAttachments($post, $uploadedFiles, $user->id);
            $this->syncAttachmentMetadata($post);

            return $post->fresh(['tags']);
        });

        ManageActivity::log(
            $user,
            'teacher.post.updated',
            $post,
            [
                'status_changed' => $originalStatus !== $post->status,
                'course_start_at' => optional($post->course_start_at)->toIso8601String(),
                'course_end_at' => optional($post->course_end_at)->toIso8601String(),
            ],
            '教師更新公告：' . $post->title
        );

        return redirect()
            ->route('manage.teacher.posts.index')
            ->with('success', '公告已更新。');
    }

    /**
     * 刪除教師公告。
     */
    public function destroy(Request $request, Post $post): RedirectResponse
    {
        $this->authorize('delete', $post);
        $this->ensureTeacherCanManage($request->user(), $post);

        DB::transaction(function () use ($post) {
            $this->removeUnkeptAttachments($post, []);
            $post->delete();
        });

        ManageActivity::log(
            $request->user(),
            'teacher.post.deleted',
            $post,
            [],
            '教師刪除公告：' . $post->title
        );

        return redirect()
            ->route('manage.teacher.posts.index')
            ->with('success', '公告已刪除。');
    }

    /**
     * 複製教師公告，產生草稿版本。
     */
    public function duplicate(Request $request, Post $post): RedirectResponse
    {
        $this->authorize('view', $post);
        $this->ensureTeacherCanManage($request->user(), $post);

        $user = $request->user();

        $copy = DB::transaction(function () use ($post, $user) {
            $post->loadMissing(['tags:id,name,slug', 'attachments']);

            $duplicated = $post->replicate([
                'status',
                'published_at',
                'slug',
                'views',
                'pinned',
                'created_by',
                'updated_by',
            ]);

            $duplicated->status = 'draft';
            $duplicated->published_at = null;
            $duplicated->views = 0;
            $duplicated->created_by = $user->id;
            $duplicated->updated_by = $user->id;
            $duplicated->title = $post->title . '（複製）';
            $duplicated->slug = Post::generateUniqueSlug($duplicated->title, $post->slug . '-copy');
            $duplicated->save();

            $duplicated->tags = $post->tags->pluck('name')->all();
            $duplicated->save();

            foreach ($post->attachments as $attachment) {
                $this->cloneAttachment($duplicated, $attachment, $user->id);
            }

            $this->syncAttachmentMetadata($duplicated);

            return $duplicated;
        });

        ManageActivity::log(
            $user,
            'teacher.post.duplicated',
            $copy,
            [
                'source_id' => $post->id,
            ],
            '教師複製公告：' . $copy->title
        );

        return redirect()
            ->route('manage.teacher.posts.edit', $copy)
            ->with('success', '已建立公告副本，請繼續編輯。');
    }

    /**
     * 將公告快速發佈。
     */
    public function quickPublish(Request $request, Post $post): RedirectResponse
    {
        $this->authorize('update', $post);
        $this->ensureTeacherCanManage($request->user(), $post);

        $post->status = 'published';
        $post->published_at = now();
        $post->updated_by = $request->user()->id;
        $post->save();

        ManageActivity::log(
            $request->user(),
            'teacher.post.quick_published',
            $post,
            [],
            '教師快速發佈公告：' . $post->title
        );

        return redirect()
            ->route('manage.teacher.posts.index')
            ->with('success', '公告已快速發佈。');
    }

    /**
     * 取得表單選項資料。
     *
     * @return array<string, mixed>
     */
    private function getFormOptions(): array
    {
        $statusOptions = collect(self::STATUS_LABELS)
            ->map(fn ($label, $value) => [
                'value' => $value,
                'label' => $label,
            ])->values()->all();

        $categoryOptions = PostCategory::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get()
            ->map(fn (PostCategory $category) => [
                'value' => $category->id,
                'label' => $category->name,
            ])->all();

        $spaces = [];
        if (class_exists(\App\Models\Space::class)) {
            /** @var class-string<\App\Models\Space> $spaceModel */
            $spaceModel = \App\Models\Space::class;
            $spaces = $spaceModel::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get()
                ->map(fn ($space) => [
                    'value' => $space->id,
                    'label' => $space->name,
                ])->all();
        }

        return [
            'statuses' => $statusOptions,
            'categories' => $categoryOptions,
            'spaces' => $spaces,
        ];
    }

    /**
     * 取得可供選擇的標籤列表。
     *
     * @return array<int, array<string, mixed>>
     */
    private function getAvailableTags(): array
    {
        if (! Tag::tableExists()) {
            return [];
        }

        return Tag::query()
            ->forContext('posts')
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (Tag $tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ])->all();
    }

    /**
     * 將逗號分隔的標籤字串轉為陣列。
     *
     * @return array<int, string>
     */
    private function explodeTags(?string $tags): array
    {
        if (! $tags) {
            return [];
        }

        return collect(explode(',', $tags))
            ->map(fn (string $tag) => trim($tag))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    /**
     * 將公告資料整理成前端表單可使用的格式。
     *
     * @return array<string, mixed>
     */
    private function formatPostForForm(Post $post): array
    {
        return [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'status' => $post->status,
            'category_id' => $post->category_id,
            'space_id' => $post->space_id,
            'summary' => $post->summary,
            'content' => $post->content,
            'target_audience' => $post->target_audience,
            'course_start_at' => optional($post->course_start_at)->toIso8601String(),
            'course_end_at' => optional($post->course_end_at)->toIso8601String(),
            'published_at' => optional($post->published_at)->toIso8601String(),
            'tags' => $post->tags->map(fn (Tag $tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ])->all(),
            'attachments' => $post->attachments->map(fn (Attachment $attachment) => [
                'id' => $attachment->id,
                'title' => $attachment->title,
                'filename' => $attachment->filename,
                'file_url' => $attachment->file_url,
                'mime_type' => $attachment->mime_type,
                'size' => $attachment->size,
            ])->all(),
        ];
    }

    /**
     * 儲存上傳的附件。
     *
     * @param  array<int, UploadedFile|null>  $files
     */
    private function storeUploadedAttachments(Post $post, array $files, ?int $userId = null): void
    {
        if ($files === []) {
            return;
        }

        $nextOrder = (int) ($post->attachments()->max('sort_order') ?? -1) + 1;
        $directory = 'posts/teacher/' . now()->format('Y/m');

        foreach ($files as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $path = $file->store($directory, 'public');
            $originalName = $file->getClientOriginalName();
            $title = pathinfo($originalName, PATHINFO_FILENAME) ?: $originalName;

            $post->attachments()->create([
                'type' => str_starts_with((string) $file->getMimeType(), 'image/') ? 'image' : 'document',
                'title' => $title,
                'filename' => $originalName,
                'disk' => 'public',
                'disk_path' => $path,
                'file_url' => Storage::disk('public')->url($path),
                'mime_type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
                'uploaded_by' => $userId,
                'space_id' => $post->space_id,
                'visibility' => 'public',
                'sort_order' => $nextOrder++,
            ]);
        }
    }

    /**
     * 移除未勾選保留的附件，並一併刪除實體檔案。
     */
    private function removeUnkeptAttachments(Post $post, array $keepIds): void
    {
        $post->attachments()
            ->when(! empty($keepIds), fn ($query) => $query->whereNotIn('id', $keepIds))
            ->get()
            ->each(function (Attachment $attachment) {
                $attachment->deleteFileFromDisk();
                $attachment->delete();
            });
    }

    /**
     * 將附件複製到新的公告。
     */
    private function cloneAttachment(Post $post, Attachment $attachment, ?int $userId = null): void
    {
        $cloned = $attachment->replicate([
            'attached_to_id',
            'attached_to_type',
            'uploaded_by',
            'created_at',
            'updated_at',
        ]);

        $cloned->attached_to_id = $post->id;
        $cloned->attached_to_type = $post->getMorphClass();
        $cloned->uploaded_by = $userId;
        $cloned->save();
    }

    /**
     * 同步附件的 Space 與標籤資訊。
     */
    private function syncAttachmentMetadata(Post $post): void
    {
        $post->loadMissing('attachments', 'tags');
        $tagSlugs = $this->resolvePostTagSlugs($post);

        $post->attachments->each(function (Attachment $attachment) use ($post, $tagSlugs) {
            $attachment->fill([
                'space_id' => $post->space_id,
                'tags' => $tagSlugs,
            ]);

            if ($attachment->isDirty(['space_id', 'tags'])) {
                $attachment->save();
            }
        });
    }

    /**
     * 取得公告標籤的 slug 陣列。
     *
     * @return array<int, string>
     */
    private function resolvePostTagSlugs(Post $post): array
    {
        if ($post->relationLoaded('tags')) {
            return $post->getRelation('tags')
                ->pluck('slug')
                ->filter()
                ->map(fn ($slug) => Str::lower((string) $slug))
                ->values()
                ->all();
        }

        return $post->tags()
            ->pluck('tags.slug')
            ->filter()
            ->map(fn ($slug) => Str::lower((string) $slug))
            ->values()
            ->all();
    }

    /**
     * 確保教師僅能管理自己建立的公告。
     */
    private function ensureTeacherCanManage(User $user, Post $post): void
    {
        if ($user->isAdmin()) {
            return;
        }

        if (! $user->isTeacher() || $post->created_by !== $user->id) {
            abort(403, '您沒有權限管理這則公告。');
        }
    }
}
