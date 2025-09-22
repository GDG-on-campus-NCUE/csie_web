<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Attachment;
use App\Models\PostCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BulletinController extends Controller
{
    /**
     * 公告列表
     */
    public function index(Request $request)
    {
        // 取得公告列表，支援分類與搜尋
        $posts = Post::with('category')
            ->where('status', 'published')
            ->where('publish_at', '<=', now())
            ->where(function ($q) {
                $q->whereNull('expire_at')->orWhere('expire_at', '>', now());
            })
            ->when($request->query('cat'), function ($query, $cat) {
                $query->whereHas('category', function ($q) use ($cat) {
                    $q->where('slug', $cat);
                });
            })
            ->when($request->query('q'), function ($query, $search) {
                $query->where(function ($qq) use ($search) {
                    $qq->where('title', 'like', "%{$search}%")
                       ->orWhere('summary', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('pinned')
            ->orderByDesc('publish_at')
            ->paginate(10)
            ->withQueryString();

        // 取得可見的公告分類
        $categories = PostCategory::where('visible', true)->orderBy('sort_order')->get();

        return Inertia::render('bulletins/index', [
            'posts' => $posts,
            'categories' => $categories,
            'filters' => $request->only(['cat', 'q']),
        ]);
    }

    /**
     * 公告詳細
     */
    public function show(string $slug)
    {
        // 依據 slug 取得公告內容
        $post = Post::with(['category:id,name,name_en,slug', 'attachments' => fn ($query) => $query->orderBy('sort_order')])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return Inertia::render('bulletins/show', [
            'post' => [
                'id' => $post->id,
                'slug' => $post->slug,
                'title' => $post->title,
                'title_en' => $post->title_en,
                'summary' => $post->summary,
                'summary_en' => $post->summary_en,
                'content' => $post->content,
                'content_en' => $post->content_en,
                'publish_at' => optional($post->publish_at)?->toIso8601String(),
                'cover_image_url' => $post->cover_image_url,
                'source_type' => $post->source_type,
                'source_url' => $post->source_url,
                'category' => $post->category ? [
                    'name' => $post->category->name,
                    'name_en' => $post->category->name_en,
                    'slug' => $post->category->slug,
                ] : null,
                'attachments' => $post->attachments->map(fn (Attachment $attachment) => [
                    'id' => $attachment->id,
                    'type' => $attachment->type,
                    'title' => $attachment->title,
                    'filename' => $attachment->filename,
                    'download_url' => route('public.attachments.download', $attachment),
                    'external_url' => $attachment->external_url,
                    'mime_type' => $attachment->mime_type,
                    'size' => $attachment->size,
                ]),
            ],
        ]);
    }
}

