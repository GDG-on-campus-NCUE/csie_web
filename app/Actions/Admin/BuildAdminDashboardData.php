<?php

namespace App\Actions\Admin;

use App\Models\Attachment;
use App\Models\ContactMessage;
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Carbon;

class BuildAdminDashboardData
{
    public function __invoke(): array
    {
        $totalPosts = Post::query()->count();
        $publishedPosts = Post::query()->published()->count();
        $draftPosts = Post::query()->where('status', 'draft')->count();
        $archivedPosts = Post::query()->where('status', 'archived')->count();
        $pinnedPosts = Post::query()->where('pinned', true)->count();

        $attachmentsQuery = Attachment::query();
        $totalAttachments = (clone $attachmentsQuery)->count();
        $imageAttachments = (clone $attachmentsQuery)->where('type', 'image')->count();
        $documentAttachments = (clone $attachmentsQuery)->where('type', 'document')->count();
        $linkAttachments = (clone $attachmentsQuery)->where('type', 'link')->count();
        $trashedAttachments = Attachment::onlyTrashed()->count();
        $totalAttachmentSize = (int) Attachment::query()->sum('size');

        $recentPosts = Post::query()
            ->with(['category:id,name,name_en'])
            ->withCount('attachments')
            ->orderByDesc('publish_at')
            ->orderByDesc('created_at')
            ->limit(6)
            ->get()
            ->map(function (Post $post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'title_en' => $post->title_en,
                    'status' => $post->status,
                    'publish_at' => optional($post->publish_at)->toIso8601String(),
                    'attachments_count' => $post->attachments_count,
                    'pinned' => (bool) $post->pinned,
                    'category' => $post->category ? [
                        'id' => $post->category->id,
                        'name' => $post->category->name,
                        'name_en' => $post->category->name_en,
                    ] : null,
                ];
            })
            ->values()
            ->all();

        $recentAttachments = Attachment::query()
            ->with(['attachedTo'])
            ->orderByDesc('created_at')
            ->limit(6)
            ->get()
            ->map(function (Attachment $attachment) {
                $attachable = $attachment->attachedTo;

                return [
                    'id' => $attachment->id,
                    'title' => $attachment->title,
                    'type' => $attachment->type,
                    'filename' => $attachment->filename,
                    'disk_path' => $attachment->disk_path,
                    'download_url' => route('public.attachments.download', $attachment),
                    'external_url' => $attachment->external_url,
                    'size' => $attachment->size,
                    'created_at' => optional($attachment->created_at)->toIso8601String(),
                    'attachable' => $attachable ? [
                        'type' => $attachment->attached_to_type ? class_basename($attachment->attached_to_type) : null,
                        'id' => method_exists($attachable, 'getKey') ? $attachable->getKey() : null,
                        'label' => $attachable->title
                            ?? $attachable->name
                            ?? $attachable->slug
                            ?? ($attachable->getKey() !== null ? '#' . $attachable->getKey() : null),
                    ] : null,
                ];
            })
            ->values()
            ->all();

        $contactMessages = ContactMessage::query();
        $newMessages = (clone $contactMessages)->where('status', 'new')->count();
        $inProgressMessages = (clone $contactMessages)->where('status', 'in_progress')->count();
        $resolvedMessages = (clone $contactMessages)->where('status', 'resolved')->count();
        $spamMessages = (clone $contactMessages)->where('status', 'spam')->count();

        return [
            'metrics' => [
                'totalPosts' => $totalPosts,
                'publishedPosts' => $publishedPosts,
                'draftPosts' => $draftPosts,
                'archivedPosts' => $archivedPosts,
                'pinnedPosts' => $pinnedPosts,
                'totalUsers' => User::query()->count(),
            ],
            'attachments' => [
                'total' => $totalAttachments,
                'images' => $imageAttachments,
                'documents' => $documentAttachments,
                'links' => $linkAttachments,
                'trashed' => $trashedAttachments,
                'totalSize' => $totalAttachmentSize,
            ],
            'contactMessages' => [
                'new' => $newMessages,
                'in_progress' => $inProgressMessages,
                'resolved' => $resolvedMessages,
                'spam' => $spamMessages,
            ],
            'recentPosts' => $recentPosts,
            'recentAttachments' => $recentAttachments,
            'generatedAt' => Carbon::now()->toIso8601String(),
        ];
    }
}

