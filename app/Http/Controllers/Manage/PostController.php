<?php

namespace App\Http\Controllers\Manage;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Tag;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Post::class, 'post');
    }

    public function index(Request $request): Response
    {
        $query = Post::query()
            ->with([
                'category:id,name,name_en,slug',
                'creator:id,name,email',
            ])
            ->withCount('attachments');

        $search = trim((string) $request->input('search'));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category_id', (int) $request->input('category'));
        }

        $statusFilter = $request->input('status');
        if (in_array($statusFilter, ['draft', 'published', 'scheduled'], true)) {
            $query->where('status', $statusFilter);
        }

        if ($request->filled('author')) {
            $query->where('created_by', (int) $request->input('author'));
        }

        if ($request->filled('date_from')) {
            try {
                $from = Carbon::parse($request->input('date_from'))->startOfDay();
                $query->whereDate('publish_at', '>=', $from);
            } catch (\Exception) {
                // 忽略無效日期
            }
        }

        if ($request->filled('date_to')) {
            try {
                $to = Carbon::parse($request->input('date_to'))->endOfDay();
                $query->whereDate('publish_at', '<=', $to);
            } catch (\Exception) {
                // 忽略無效日期
            }
        }

        $perPage = (int) $request->input('per_page', 15);
        if ($perPage < 1) {
            $perPage = 15;
        }

        if ($perPage > 200) {
            $perPage = 200;
        }

        $posts = $query
            ->orderByDesc(DB::raw("CASE WHEN status = 'scheduled' THEN publish_at END"))
            ->orderByDesc('publish_at')
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Post $post) => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'status' => $post->status,
                'publish_at' => optional($post->publish_at)?->toIso8601String(),
                'category' => $post->category?->only(['id', 'name', 'name_en', 'slug']),
                'author' => $post->creator?->only(['id', 'name', 'email']),
                'views' => $post->views,
                'attachments_count' => $post->attachments_count,
                'created_at' => optional($post->created_at)?->toIso8601String(),
                'updated_at' => optional($post->updated_at)?->toIso8601String(),
            ]);

        $authors = Post::query()
            ->join('users', 'users.id', '=', 'posts.created_by')
            ->select('users.id', 'users.name')
            ->distinct()
            ->orderBy('users.name')
            ->get()
            ->map(fn ($author) => [
                'id' => $author->id,
                'name' => $author->name,
            ])
            ->values();

        return Inertia::render('manage/posts/index', [
            'posts' => $posts,
            'categories' => PostCategory::query()
                ->select('id', 'name', 'name_en', 'slug', 'sort_order')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(),
            'authors' => $authors,
            'filters' => $request->only(['search', 'category', 'status', 'author', 'date_from', 'date_to', 'per_page']),
            'statusOptions' => ['draft', 'published', 'scheduled'],
            'perPageOptions' => [15, 30, 50, 100, 200],
            'can' => [
                'create' => $request->user()?->can('create', Post::class) ?? false,
                'bulk' => $request->user()?->can('bulkOperations', Post::class) ?? false,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $statusOptions = $this->statusOptions($request->user());

        return Inertia::render('manage/posts/create', [
            'categories' => PostCategory::query()
                ->select('id', 'name', 'name_en', 'slug', 'sort_order')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(),
            'statusOptions' => $statusOptions,
            'availableTags' => $this->availableTagsForPosts(),
        ]);
    }

    public function store(Request $request)
    {
        $statusOptions = $this->statusOptions($request->user());

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'category_id' => ['required', 'exists:post_categories,id'],
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'status' => ['required', Rule::in($statusOptions)],
            'publish_at' => [Rule::requiredIf(fn () => $request->input('status') === 'scheduled'), 'nullable', 'date'],
            'tags' => 'nullable',
            'featured_image' => ['nullable', 'image', 'max:5120'],
            'attachments.files' => 'array',
            'attachments.files.*' => 'file|max:20480',
            'attachments.links' => 'array',
            'attachments.links.*.title' => 'nullable|string|max:255',
            'attachments.links.*.url' => 'nullable|url',
        ]);

        [$resolvedStatus, $publishAt] = $this->resolvePublishState($validated['status'], $validated['publish_at'] ?? null);

        $content = $this->sanitizeRichText($validated['content']);
        if ($content === null) {
            return back()->withErrors(['content' => '公告內容不得為空'])->withInput();
        }

        $excerpt = $this->sanitizePlainText($validated['excerpt'] ?? null);

        $post = new Post([
            'category_id' => (int) $validated['category_id'],
            'title' => $validated['title'],
            'title_en' => $validated['title'],
            'slug' => $this->prepareSlug($validated['slug'] ?? '', $validated['title']),
            'summary' => $excerpt,
            'summary_en' => $excerpt,
            'content' => $content,
            'content_en' => $content,
            'status' => $resolvedStatus,
            'publish_at' => $publishAt,
            'pinned' => false,
            'tags' => $this->prepareTags($request->input('tags')),
            'source_type' => 'manual',
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        if ($request->hasFile('featured_image')) {
            $post->cover_image_url = $this->storeFeaturedImage($request->file('featured_image'));
        }

        $post->save();

        $this->syncAttachments($post, $request);

        return redirect()->route('manage.posts.index')->with('success', '公告建立成功');
    }

    public function show(Post $post): Response
    {
        $post->load([
            'category:id,name,name_en,slug',
            'creator:id,name,email',
            'attachments' => fn ($query) => $query->orderBy('sort_order'),
        ]);

        return Inertia::render('manage/posts/show', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'status' => $post->status,
                'publish_at' => optional($post->publish_at)?->toIso8601String(),
                'category' => $post->category?->only(['id', 'name', 'name_en', 'slug']),
                'author' => $post->creator?->only(['id', 'name', 'email']),
                'excerpt' => $post->summary,
                'content' => $post->content,
                'tags' => $post->tags ?? [],
                'views' => $post->views,
                'featured_image_url' => $post->cover_image_url,
                'attachments' => $post->attachments->map(fn (Attachment $attachment) => [
                    'id' => $attachment->id,
                    'type' => $attachment->type,
                    'title' => $attachment->title,
                    'file_url' => $attachment->file_url,
                    'external_url' => $attachment->external_url,
                    'mime_type' => $attachment->mime_type,
                ]),
                'created_at' => optional($post->created_at)?->toIso8601String(),
                'updated_at' => optional($post->updated_at)?->toIso8601String(),
            ],
        ]);
    }

    public function edit(Request $request, Post $post): Response
    {
        $post->load(['attachments' => fn ($query) => $query->orderBy('sort_order')]);

        $statusOptions = $this->statusOptions($request->user());

        return Inertia::render('manage/posts/edit', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'category_id' => $post->category_id,
                'excerpt' => $post->summary,
                'content' => $post->content,
                'status' => $post->status,
                'publish_at' => optional($post->publish_at)?->toIso8601String(),
                'tags' => $post->tags ?? [],
                'featured_image_url' => $post->cover_image_url,
                'attachments' => $post->attachments->map(fn (Attachment $attachment) => [
                    'id' => $attachment->id,
                    'type' => $attachment->type,
                    'title' => $attachment->title,
                    'file_url' => $attachment->file_url,
                    'external_url' => $attachment->external_url,
                    'mime_type' => $attachment->mime_type,
                ]),
            ],
            'categories' => PostCategory::query()
                ->select('id', 'name', 'name_en', 'slug', 'sort_order')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(),
            'statusOptions' => $statusOptions,
            'availableTags' => $this->availableTagsForPosts(),
        ]);
    }

    /**
     * 取得公告表單可用的標籤列表，若資料表不存在則回傳空陣列。
     */
    private function availableTagsForPosts(): array
    {
        if (! Tag::tableExists()) {
            return [];
        }

        return Tag::forContext('posts')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Tag $tag) => [[
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
                'description' => $tag->description,
            ]])
            ->values()
            ->all();
    }

    public function update(Request $request, Post $post)
    {
        $statusOptions = $this->statusOptions($request->user(), $post);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'category_id' => ['required', 'exists:post_categories,id'],
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'status' => ['required', Rule::in($statusOptions)],
            'publish_at' => [Rule::requiredIf(fn () => $request->input('status') === 'scheduled'), 'nullable', 'date'],
            'tags' => 'nullable',
            'featured_image' => ['nullable', 'image', 'max:5120'],
            'remove_featured_image' => 'sometimes|boolean',
            'attachments.files' => 'array',
            'attachments.files.*' => 'file|max:20480',
            'attachments.links' => 'array',
            'attachments.links.*.title' => 'nullable|string|max:255',
            'attachments.links.*.url' => 'nullable|url',
            'attachments.remove' => 'array',
            'attachments.remove.*' => 'integer|exists:attachments,id',
        ]);

        [$resolvedStatus, $publishAt] = $this->resolvePublishState($validated['status'], $validated['publish_at'] ?? null);

        $content = $this->sanitizeRichText($validated['content']);
        if ($content === null) {
            return back()->withErrors(['content' => '公告內容不得為空'])->withInput();
        }

        $excerpt = $this->sanitizePlainText($validated['excerpt'] ?? null);

        $post->fill([
            'category_id' => (int) $validated['category_id'],
            'title' => $validated['title'],
            'title_en' => $validated['title'],
            'slug' => $this->prepareSlug($validated['slug'] ?? '', $validated['title'], $post->id),
            'summary' => $excerpt,
            'summary_en' => $excerpt,
            'content' => $content,
            'content_en' => $content,
            'status' => $resolvedStatus,
            'publish_at' => $publishAt,
            'tags' => $this->prepareTags($request->input('tags')),
            'updated_by' => $request->user()->id,
        ]);

        if ($request->boolean('remove_featured_image')) {
            $this->deleteFeaturedImage($post->cover_image_url);
            $post->cover_image_url = null;
        }

        if ($request->hasFile('featured_image')) {
            $this->deleteFeaturedImage($post->cover_image_url);
            $post->cover_image_url = $this->storeFeaturedImage($request->file('featured_image'));
        }

        $post->save();

        $this->syncAttachments($post, $request);

        return redirect()->route('manage.posts.index')->with('success', '公告更新成功');
    }

    public function destroy(Post $post)
    {
        $this->deleteFeaturedImage($post->cover_image_url);
        $this->removeAttachments($post->attachments()->get());
        $post->delete();

        return redirect()->route('manage.posts.index')->with('success', '公告已刪除');
    }

    public function bulk(Request $request)
    {
        $this->authorize('bulkOperations', Post::class);

        $validated = $request->validate([
            'action' => ['required', Rule::in(['publish', 'unpublish', 'delete'])],
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:posts,id'],
        ]);

        $posts = Post::whereIn('id', $validated['ids'])->get();

        if ($validated['action'] === 'delete') {
            foreach ($posts as $post) {
                $this->deleteFeaturedImage($post->cover_image_url);
                $this->removeAttachments($post->attachments()->get());
                $post->delete();
            }

            return redirect()->route('manage.posts.index')->with('success', '已刪除所選公告');
        }

        if ($validated['action'] === 'publish') {
            foreach ($posts as $post) {
                $post->status = 'published';
                $post->publish_at = $post->publish_at && $post->publish_at->isFuture()
                    ? $post->publish_at
                    : now();
                $post->updated_by = $request->user()->id;
                $post->save();
            }

            return redirect()->route('manage.posts.index')->with('success', '已發布所選公告');
        }

        foreach ($posts as $post) {
            $post->status = 'draft';
            $post->publish_at = null;
            $post->updated_by = $request->user()->id;
            $post->save();
        }

        return redirect()->route('manage.posts.index')->with('success', '已將所選公告設為草稿');
    }

    private function statusOptions(?\Illuminate\Contracts\Auth\Authenticatable $user, ?Post $post = null): array
    {
        if ($user && $user->can('publish', $post ?? new Post(['created_by' => $user->id]))) {
            return ['draft', 'published', 'scheduled'];
        }

        $options = ['draft'];

        if ($post && in_array($post->status, ['published', 'scheduled'], true)) {
            $options[] = $post->status;
        }

        return array_values(array_unique($options));
    }

    private function resolvePublishState(string $status, ?string $publishAtInput): array
    {
        if ($status === 'draft') {
            return ['draft', null];
        }

        $publishAt = $publishAtInput ? Carbon::parse($publishAtInput) : now();

        if ($status === 'scheduled' && $publishAt->isFuture()) {
            return ['scheduled', $publishAt];
        }

        return ['published', $publishAt->isPast() ? $publishAt : now()];
    }

    private function prepareSlug(string $slug, string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug !== '' ? $slug : $title);
        if ($base === '') {
            $base = Str::slug(Str::random(8));
        }

        $candidate = $base;
        $suffix = 1;

        while (Post::withTrashed()
            ->when($ignoreId, fn ($query) => $query->where('id', '<>', $ignoreId))
            ->where('slug', $candidate)
            ->exists()) {
            $candidate = $base . '-' . $suffix;
            $suffix++;
        }

        return $candidate;
    }

    private function prepareTags($tags): array
    {
        if (is_string($tags)) {
            $items = collect(explode(',', $tags));
        } elseif (is_array($tags)) {
            $items = collect($tags);
        } else {
            return [];
        }

        return $items
            ->map(fn ($value) => trim((string) $value))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    private function sanitizePlainText(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $clean = trim(strip_tags($value));

        return $clean === '' ? null : $clean;
    }

    private function storeFeaturedImage($file): string
    {
        $path = $file->store('posts/featured', 'public');

        return '/storage/' . $path;
    }

    private function deleteFeaturedImage(?string $url): void
    {
        if (! $url) {
            return;
        }

        if (str_starts_with($url, '/storage/')) {
            $path = Str::after($url, '/storage/');
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }

    private function syncAttachments(Post $post, Request $request): void
    {
        $files = $request->file('attachments.files', []);
        $links = (array) $request->input('attachments.links', []);
        $remove = (array) $request->input('attachments.remove', []);

        if (! empty($remove)) {
            $this->removeAttachments($post->attachments()->whereIn('id', $remove)->get());
        }

        if (! empty($files)) {
            $currentSort = (int) $post->attachments()->max('sort_order');
            foreach ($files as $file) {
                if (! $file) {
                    continue;
                }

                $path = $file->store('attachments', 'public');
                $mime = $file->getMimeType();
                $type = str_starts_with((string) $mime, 'image/') ? 'image' : 'document';
                $originalName = $file->getClientOriginalName();

                $post->attachments()->create([
                    'type' => $type,
                    'title' => $originalName,
                    'filename' => $originalName,
                    'disk' => 'public',
                    'disk_path' => $path,
                    'file_url' => Storage::disk('public')->url($path),
                    'mime_type' => $mime,
                    'size' => $file->getSize(),
                    'uploaded_by' => $request->user()->id,
                    'visibility' => 'public',
                    'sort_order' => ++$currentSort,
                ]);
            }
        }

        if (! empty($links)) {
            $currentSort = (int) $post->attachments()->max('sort_order');
            foreach ($links as $link) {
                $url = trim((string) ($link['url'] ?? ''));
                if ($url === '') {
                    continue;
                }

                $title = trim((string) ($link['title'] ?? ''));

                $post->attachments()->create([
                    'type' => 'link',
                    'title' => $title !== '' ? $title : null,
                    'external_url' => $url,
                    'uploaded_by' => $request->user()->id,
                    'visibility' => 'public',
                    'sort_order' => ++$currentSort,
                ]);
            }
        }
    }

    private function removeAttachments(EloquentCollection $attachments): void
    {
        foreach ($attachments as $attachment) {
            $attachment->deleteFileFromDisk();
            $attachment->delete();
        }
    }
}
