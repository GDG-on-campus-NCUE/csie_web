<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manage\Admin\StorePostRequest;
use App\Http\Requests\Manage\Admin\UpdatePostRequest;
use App\Http\Resources\Manage\PostDetailResource;
use App\Http\Resources\Manage\PostResource;
use App\Models\Attachment;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    /**
     * 顯示公告列表頁面。
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Post::class);

        $filters = [
            'keyword' => $request->string('keyword')->trim()->toString() ?: null,
            'status' => $request->string('status')->trim()->toString() ?: null,
            'category' => $request->integer('category') ?: null,
            'tag' => $request->string('tag')->trim()->toString() ?: null,
            'publisher' => $request->integer('publisher') ?: null,
            'published_from' => $request->string('published_from')->trim()->toString() ?: null,
            'published_to' => $request->string('published_to')->trim()->toString() ?: null,
            'per_page' => $request->integer('per_page') ?: null,
        ];

        $perPage = $filters['per_page'] ?? 10;
        $perPage = max(5, min(100, $perPage));

        $query = Post::query()
            ->with([
                'category:id,name',
                'space:id,name',
                'creator:id,name',
                'tags:id,name,slug',
            ])
            ->withCount('attachments');

        if ($filters['keyword']) {
            $keyword = '%' . Str::lower($filters['keyword']) . '%';
            $query->where(function ($builder) use ($keyword) {
                $builder->whereRaw('LOWER(title) LIKE ?', [$keyword])
                    ->orWhereRaw('LOWER(title_en) LIKE ?', [$keyword])
                    ->orWhereRaw('LOWER(slug) LIKE ?', [$keyword]);
            });
        }

        if ($filters['status'] && isset(Post::STATUS_MAP[$filters['status']])) {
            $query->where('status', Post::STATUS_MAP[$filters['status']]);
        }

        if ($filters['category']) {
            $query->where('category_id', $filters['category']);
        }

        if ($filters['publisher']) {
            $query->where('created_by', $filters['publisher']);
        }

        if ($filters['tag'] && Tag::tableExists()) {
            $tagValue = $filters['tag'];
            $query->whereHas('tags', function ($tagQuery) use ($tagValue) {
                $tagQuery->where('tags.slug', $tagValue)
                    ->orWhere('tags.id', $tagValue)
                    ->orWhereRaw('LOWER(tags.name) = ?', [Str::lower($tagValue)]);
            });
        }

        if ($filters['published_from']) {
            try {
                $from = Carbon::parse($filters['published_from'])->startOfDay();
                $query->where('published_at', '>=', $from);
            } catch (\Throwable $exception) {
                // ignore invalid date
            }
        }

        if ($filters['published_to']) {
            try {
                $to = Carbon::parse($filters['published_to'])->endOfDay();
                $query->where('published_at', '<=', $to);
            } catch (\Throwable $exception) {
                // ignore invalid date
            }
        }

        $posts = $query
            ->orderedForListing()
            ->paginate($perPage)
            ->withQueryString();

        $postData = [
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

        $statusCounts = Post::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->mapWithKeys(fn ($count, $status) => [array_flip(Post::STATUS_MAP)[$status] ?? $status => (int) $count])
            ->all();

        $filterOptions = [
            'statuses' => collect(Post::STATUS_MAP)
                ->keys()
                ->map(fn (string $status) => [
                    'value' => $status,
                    'label' => __('manage.posts.status.' . $status),
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
                        'value' => $tag->slug,
                        'label' => $tag->name,
                        'id' => $tag->id,
                    ])->all()
                : [],
        ];

        return Inertia::render('manage/admin/posts/index', [
            'posts' => $postData,
            'filters' => $filters,
            'filterOptions' => $filterOptions,
            'statusSummary' => $statusCounts,
            'abilities' => [
                'canCreate' => $request->user()?->can('create', Post::class) ?? false,
                'canBulkUpdate' => $request->user()?->can('bulkOperations', Post::class) ?? false,
            ],
        ]);
    }

    /**
     * 顯示新增公告頁面。
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Post::class);

        return Inertia::render('manage/posts/create', [
            'availableTags' => $this->getAvailableTags(),
            'formOptions' => $this->getPostFormOptions(),
        ]);
    }

    /**
     * 儲存新公告。
     */
    public function store(StorePostRequest $request): RedirectResponse
    {
        $this->authorize('create', Post::class);

        $validated = $request->validated();
        $user = $request->user();

        $status = $validated['status'];
        $publishedAt = $validated['published_at'] ?? null;

        if ($publishedAt) {
            $publishedAt = Carbon::parse($publishedAt);
        }

        if ($status === 'published' && ! $publishedAt) {
            $publishedAt = now();
        }

        if (! in_array($status, ['published', 'scheduled'], true)) {
            $publishedAt = null;
        }

        $slug = Post::generateUniqueSlug($validated['title'], $validated['slug'] ?? null);
        $coverImageUrl = null;

    // 建立多語欄位的預設值，避免資料庫 NOT NULL 約束發生例外
    $titleEn = $validated['title_en'] ?? $validated['title'];
    $excerpt = $validated['excerpt'] ?? null;
    $excerptEn = $validated['excerpt_en'] ?? $excerpt;
    $summary = $validated['summary'] ?? null;
    $summaryEn = $validated['summary_en'] ?? $summary;
    $content = $this->sanitizeRichText($validated['content']);
    $contentEn = $this->sanitizeRichText($validated['content_en'] ?? $validated['content']);

        if ($content === null) {
            $content = '';
        }

        if ($contentEn === null) {
            $contentEn = $content;
        }

        if ($request->hasFile('featured_image')) {
            $coverPath = $request->file('featured_image')
                ->store('posts/covers/' . now()->format('Y/m'), 'public');
            $coverImageUrl = Storage::disk('public')->url($coverPath);
        }

        $fileAttachments = Arr::wrap(data_get($request->allFiles(), 'attachments.files', []));
        $linkAttachments = data_get($validated, 'attachments.links', []);
        if (! is_array($linkAttachments)) {
            $linkAttachments = [];
        }

        DB::transaction(function () use ($validated, $status, $publishedAt, $slug, $coverImageUrl, $fileAttachments, $linkAttachments, $user, $titleEn, $excerpt, $excerptEn, $summary, $summaryEn, $content, $contentEn) {
            $post = new Post();
            $post->fill([
                'category_id' => $validated['category_id'],
                'space_id' => $validated['space_id'] ?? null,
                'status' => $status,
                'visibility' => $validated['visibility'] ?? 'public',
                'source_type' => 'manual',
                'published_at' => $publishedAt,
                'expire_at' => $validated['expire_at'] ?? null,
                'pinned' => (bool) ($validated['pinned'] ?? false),
                'title' => $validated['title'],
                'title_en' => $titleEn,
                'excerpt' => $excerpt,
                'excerpt_en' => $excerptEn,
                'summary' => $summary,
                'summary_en' => $summaryEn,
                'content' => $content,
                'content_en' => $contentEn,
                'cover_image_url' => $coverImageUrl,
                'views' => 0,
                'created_by' => $user?->id,
                'updated_by' => $user?->id,
            ]);

            $post->slug = $slug;
            $post->tags = $validated['tags'] ?? [];
            $post->save();

            $this->storeAttachments($post, $fileAttachments, $linkAttachments, $user?->id, 0);
        });

        return redirect()->route('manage.posts.index');
    }

    /**
     * 批次更新公告狀態。
     */
    public function bulk(Request $request): RedirectResponse
    {
        $this->authorize('bulkOperations', Post::class);

        $data = $request->validate([
            'action' => ['required', Rule::in(['publish', 'unpublish', 'archive', 'delete'])],
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:posts,id'],
        ]);

        $ids = $data['ids'];
        $action = $data['action'];
        $userId = $request->user()?->id;
        $timestamp = now();

        DB::transaction(function () use ($ids, $action, $userId, $timestamp) {
            $posts = Post::query()->whereIn('id', $ids)->get();

            foreach ($posts as $post) {
                switch ($action) {
                    case 'publish':
                        $post->status = 'published';
                        if (! $post->published_at) {
                            $post->published_at = $timestamp;
                        }
                        break;
                    case 'unpublish':
                        $post->status = 'draft';
                        $post->published_at = null;
                        break;
                    case 'archive':
                        $post->status = 'archived';
                        $post->published_at = null;
                        break;
                    case 'delete':
                        $this->removeCoverImage($post->cover_image_url);
                        $this->removeStaleAttachments($post, []);
                        $post->cover_image_url = null;
                        if ($userId) {
                            $post->updated_by = $userId;
                        }
                        $post->save();
                        $post->delete();
                        continue 2;
                }

                if ($userId) {
                    $post->updated_by = $userId;
                }

                $post->save();
            }
        });

        return redirect()->route('manage.posts.index');
    }

    /**
     * 顯示公告詳細內容（暫以基本資訊呈現）。
     */
    public function show(Request $request, Post $post): Response
    {
        $this->authorize('view', $post);

        $post->load([
            'category:id,name',
            'space:id,name',
            'creator:id,name',
            'updater:id,name',
            'tags:id,name,slug,color,is_active',
            'attachments' => fn ($query) => $query
                ->with('uploader:id,name')
                ->orderBy('sort_order')
                ->orderBy('id'),
        ]);

        $postPayload = PostDetailResource::make($post)->resolve();
        $timeline = $this->buildPostTimeline($post);

        return Inertia::render('manage/admin/posts/show', [
            'post' => [
                ...$postPayload,
                'timeline' => $timeline,
            ],
            'abilities' => [
                'canUpdate' => $request->user()?->can('update', $post) ?? false,
                'canArchive' => $request->user()?->can('update', $post) ?? false,
                'canRestore' => $request->user()?->can('restore', $post) ?? false,
            ],
        ]);
    }

    /**
     * 建立公告歷程時間線。
     *
     * @return array<int, array<string, mixed>>
     */
    protected function buildPostTimeline(Post $post): array
    {
        $events = collect();

        if ($post->created_at) {
            $events->push([
                'type' => 'created',
                'title' => __('manage.posts.timeline.created'),
                'description' => __('manage.posts.timeline.created_description'),
                'actor' => $post->creator?->name ?? __('manage.posts.timeline.system'),
                'timestamp' => $post->created_at->toIso8601String(),
            ]);
        }

        if ($post->published_at) {
            $events->push([
                'type' => 'published',
                'title' => __('manage.posts.timeline.published'),
                'description' => __('manage.posts.timeline.published_description'),
                'actor' => $post->creator?->name ?? __('manage.posts.timeline.system'),
                'timestamp' => $post->published_at->toIso8601String(),
            ]);
        }

        if ($post->updated_at && (! $post->created_at || ! $post->updated_at->equalTo($post->created_at))) {
            $events->push([
                'type' => 'updated',
                'title' => __('manage.posts.timeline.updated'),
                'description' => __('manage.posts.timeline.updated_description'),
                'actor' => $post->updater?->name ?? $post->creator?->name ?? __('manage.posts.timeline.system'),
                'timestamp' => $post->updated_at->toIso8601String(),
            ]);
        }

        if ($post->status === 'archived' && $post->updated_at) {
            $events->push([
                'type' => 'archived',
                'title' => __('manage.posts.timeline.archived'),
                'description' => __('manage.posts.timeline.archived_description'),
                'actor' => $post->updater?->name ?? __('manage.posts.timeline.system'),
                'timestamp' => $post->updated_at->toIso8601String(),
            ]);
        }

        if ($post->attachments?->count()) {
            $latestAttachment = $post->attachments->sortByDesc('created_at')->first();
            if ($latestAttachment?->created_at) {
                $events->push([
                    'type' => 'attachment',
                    'title' => __('manage.posts.timeline.attachment_added'),
                    'description' => __('manage.posts.timeline.attachment_added_description', ['name' => $latestAttachment->title ?: $latestAttachment->filename]),
                    'actor' => $latestAttachment->uploader?->name ?? __('manage.posts.timeline.system'),
                    'timestamp' => $latestAttachment->created_at->toIso8601String(),
                ]);
            }
        }

        return $events
            ->filter(fn ($event) => ! empty($event['timestamp']))
            ->sortByDesc('timestamp')
            ->take(5)
            ->values()
            ->all();
    }

    /**
     * 顯示編輯公告頁面。
     */
    public function edit(Request $request, Post $post): Response
    {
        $this->authorize('update', $post);

        $post->load([
            'tags:id,name,slug',
            'attachments' => function ($query) {
                $query->orderBy('sort_order')->orderBy('id');
            },
        ]);

        return Inertia::render('manage/posts/edit', [
            'availableTags' => $this->getAvailableTags(),
            'formOptions' => $this->getPostFormOptions(),
            'post' => $this->formatPostForForm($post),
        ]);
    }

    /**
     * 更新指定公告。
     */
    public function update(UpdatePostRequest $request, Post $post): RedirectResponse
    {
        $this->authorize('update', $post);

        $validated = $request->validated();
        $user = $request->user();

        $status = $validated['status'];
        $publishedAt = $validated['published_at'] ?? null;

        if ($publishedAt) {
            $publishedAt = Carbon::parse($publishedAt);
        }

        if ($status === 'published' && ! $publishedAt) {
            $publishedAt = now();
        }

        if (! in_array($status, ['published', 'scheduled'], true)) {
            $publishedAt = null;
        }

        $slug = Post::generateUniqueSlug($validated['title'], $validated['slug'] ?? null, $post->id);

        // 建立多語欄位的預設值，確保資料齊全
        $titleEn = $validated['title_en'] ?? $validated['title'];
        $excerpt = $validated['excerpt'] ?? null;
        $excerptEn = $validated['excerpt_en'] ?? $excerpt;
        $summary = $validated['summary'] ?? null;
        $summaryEn = $validated['summary_en'] ?? $summary;
        $content = $this->sanitizeRichText($validated['content']);
        $contentEn = $this->sanitizeRichText($validated['content_en'] ?? $validated['content']);

        if ($content === null) {
            $content = '';
        }

        if ($contentEn === null) {
            $contentEn = $content;
        }

        $fileAttachments = Arr::wrap(data_get($request->allFiles(), 'attachments.files', []));
        $linkAttachments = data_get($validated, 'attachments.links', []);
        if (! is_array($linkAttachments)) {
            $linkAttachments = [];
        }

        $keepAttachmentIds = collect(data_get($validated, 'attachments.keep', []))
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();

        DB::transaction(function () use ($post, $validated, $status, $publishedAt, $slug, $user, $titleEn, $excerpt, $excerptEn, $summary, $summaryEn, $content, $contentEn, $fileAttachments, $linkAttachments, $keepAttachmentIds, $request) {
            if ($request->hasFile('featured_image')) {
                // 若上傳新的主視覺，先移除舊檔案並儲存新路徑
                $this->removeCoverImage($post->cover_image_url);

                $coverPath = $request->file('featured_image')
                    ->store('posts/covers/' . now()->format('Y/m'), 'public');
                $post->cover_image_url = Storage::disk('public')->url($coverPath);
            }

            $post->fill([
                'category_id' => $validated['category_id'],
                'space_id' => $validated['space_id'] ?? null,
                'status' => $status,
                'visibility' => $validated['visibility'] ?? 'public',
                'published_at' => $publishedAt,
                'expire_at' => $validated['expire_at'] ?? null,
                'pinned' => (bool) ($validated['pinned'] ?? false),
                'title' => $validated['title'],
                'title_en' => $titleEn,
                'excerpt' => $excerpt,
                'excerpt_en' => $excerptEn,
                'summary' => $summary,
                'summary_en' => $summaryEn,
                'content' => $content,
                'content_en' => $contentEn,
                'updated_by' => $user?->id,
            ]);

            $post->slug = $slug;
            $post->tags = $validated['tags'] ?? [];
            $post->save();

            $this->removeStaleAttachments($post, $keepAttachmentIds);

            $nextOrder = ($post->attachments()->max('sort_order') ?? -1) + 1;
            $this->storeAttachments($post, $fileAttachments, $linkAttachments, $user?->id, $nextOrder);
        });

        return redirect()->route('manage.posts.index');
    }

    /**
     * 刪除指定公告。
     */
    public function destroy(Request $request, Post $post): RedirectResponse
    {
        $this->authorize('delete', $post);

        DB::transaction(function () use ($post) {
            $this->removeCoverImage($post->cover_image_url);
            $this->removeStaleAttachments($post, []);
            // 清空主圖連結，避免復原後指向已不存在的檔案。
            $post->cover_image_url = null;
            $post->save();
            $post->delete();
        });

        return redirect()->route('manage.posts.index');
    }

    /**
     * 復原已軟刪除的公告。
     */
    public function restore(Request $request, int $postId): RedirectResponse
    {
        $post = Post::withTrashed()->findOrFail($postId);

        $this->authorize('restore', $post);

        DB::transaction(function () use ($post) {
            // 僅復原公告本身；附件與主圖已於刪除時清掉實體檔案，維持軟刪除狀態避免壞連結。
            $post->restore();
        });

        return redirect()->route('manage.posts.index');
    }

    /**
     * 儲存附件。
     *
     * @param  array<int, UploadedFile>  $files
     * @param  array<int, array<string, mixed>>  $links
     */
    private function storeAttachments(Post $post, array $files, array $links, ?int $userId = null, int $startingOrder = 0): void
    {
        // 根據既有附件數量決定排序初始值，避免覆蓋先前順序
        $order = $startingOrder;
        $directory = 'posts/attachments/' . now()->format('Y/m');

        foreach ($files as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $path = $file->store($directory, 'public');
            $originalName = $file->getClientOriginalName();
            $title = pathinfo($originalName, PATHINFO_FILENAME) ?: $originalName;

            $post->attachments()->create([
                'type' => 'document',
                'title' => $title,
                'filename' => $originalName,
                'disk' => 'public',
                'disk_path' => $path,
                'file_url' => Storage::disk('public')->url($path),
                'mime_type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
                'uploaded_by' => $userId,
                'visibility' => 'public',
                'sort_order' => $order++,
            ]);
        }

        foreach ($links as $link) {
            if (! is_array($link)) {
                continue;
            }

            $title = trim((string) ($link['title'] ?? ''));
            $url = $link['url'] ?? null;

            if ($title === '' || ! $url) {
                continue;
            }

            $post->attachments()->create([
                'type' => 'link',
                'title' => $title,
                'external_url' => $url,
                'uploaded_by' => $userId,
                'visibility' => 'public',
                'sort_order' => $order++,
            ]);
        }
    }

    /**
     * 取得標籤清單供前端表單使用。
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
     * 取得公告建立/編輯表單所需的選項資料。
     */
    private function getPostFormOptions(): array
    {
        $statusDescriptions = (array) __('manage.posts.form.status_description');
        $statusLabels = (array) __('manage.posts.status');

        $statuses = collect(Post::STATUS_MAP)
            ->keys()
            ->map(function (string $status) use ($statusLabels, $statusDescriptions) {
                return [
                    'value' => $status,
                    'label' => $statusLabels[$status] ?? ucfirst($status),
                    'description' => $statusDescriptions[$status] ?? null,
                ];
            })->values()->all();

        $visibilityLabels = [
            'public' => __('manage.posts.visibility.public'),
            'internal' => __('manage.posts.visibility.internal'),
            'private' => __('manage.posts.visibility.private'),
        ];

        $visibilities = collect(Post::VISIBILITY_MAP)
            ->keys()
            ->map(fn (string $visibility) => [
                'value' => $visibility,
                'label' => $visibilityLabels[$visibility] ?? ucfirst($visibility),
            ])->values()->all();

        $categories = PostCategory::query()
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
            'statuses' => $statuses,
            'visibilities' => $visibilities,
            'categories' => $categories,
            'spaces' => $spaces,
        ];
    }

    /**
     * 將公告資料整理成前端表單可直接使用的格式。
     */
    private function formatPostForForm(Post $post): array
    {
        return [
            'id' => $post->id,
            'title' => $post->title,
            'title_en' => $post->title_en,
            'slug' => $post->slug,
            'status' => $post->status,
            'visibility' => $post->visibility,
            'published_at' => optional($post->published_at)->toIso8601String(),
            'expire_at' => optional($post->expire_at)->toIso8601String(),
            'category_id' => $post->category_id,
            'space_id' => $post->space_id,
            'excerpt' => $post->excerpt,
            'excerpt_en' => $post->excerpt_en,
            'summary' => $post->summary,
            'summary_en' => $post->summary_en,
            'content' => $post->content,
            'content_en' => $post->content_en,
            'pinned' => (bool) $post->pinned,
            'cover_image_url' => $post->cover_image_url,
            'tags' => $post->tags->map(fn (Tag $tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ])->all(),
            'attachments' => $post->attachments->map(fn (Attachment $attachment) => [
                'id' => $attachment->id,
                'type' => $attachment->type,
                'title' => $attachment->title,
                'filename' => $attachment->filename,
                'file_url' => $attachment->file_url,
                'external_url' => $attachment->external_url,
                'visibility' => $attachment->visibility,
                'sort_order' => $attachment->sort_order,
            ])->all(),
        ];
    }

    /**
     * 移除未保留的附件並刪除實體檔案。
     */
    private function removeStaleAttachments(Post $post, array $keepIds): void
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
     * 刪除公告主圖，確保檔案不殘留於磁碟。
     */
    private function removeCoverImage(?string $coverImageUrl): void
    {
        if (! $coverImageUrl) {
            return;
        }

        $publicPrefix = rtrim(Storage::disk('public')->url('/'), '/');
        $path = null;

        if (str_starts_with($coverImageUrl, $publicPrefix)) {
            $path = ltrim(substr($coverImageUrl, strlen($publicPrefix)), '/');
        } elseif (str_starts_with($coverImageUrl, '/storage/')) {
            $path = substr($coverImageUrl, strlen('/storage/'));
        }

        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
