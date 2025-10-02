<?php

namespace App\Services;

use App\Models\Attachment;
use App\Models\ContactMessage;
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

class DashboardMetricService
{
    private const STORAGE_CAPACITY_BYTES = 21474836480; // 20 GiB default quota.

    /**
     * 建立管理員儀表板所需的整體資料。
     */
    public function getAdminDashboardData(?User $user = null): array
    {
        $postMetrics = $this->gatherPostMetrics();
        $userMetrics = $this->gatherUserMetrics();
        $attachmentMetrics = $this->gatherAttachmentMetrics();
        $contactSummary = $this->gatherContactSummary();

        return [
            'metrics' => $this->formatMetrics($postMetrics, $userMetrics, $attachmentMetrics),
            'activities' => $this->buildActivityFeed(),
            'quickLinks' => $this->buildQuickLinks(),
            'personalTodos' => $this->buildPersonalTodos($postMetrics, $contactSummary),
            'generatedAt' => now()->toIso8601String(),
        ];
    }

    private function gatherPostMetrics(): array
    {
        if (! Schema::hasTable('posts')) {
            return [
                'total' => 0,
                'draft' => 0,
                'scheduled' => 0,
                'published' => 0,
                'pinned' => 0,
                'created_recent' => 0,
                'created_previous' => 0,
            ];
        }

        $now = now();
        $recentWindowStart = $now->copy()->subDays(7);
        $previousWindowStart = $now->copy()->subDays(14);

        return [
            'total' => Post::query()->count(),
            'draft' => Post::query()->where('status', Post::STATUS_MAP['draft'])->count(),
            'scheduled' => Post::query()->where('status', Post::STATUS_MAP['scheduled'])->count(),
            'published' => Post::query()->published()->count(),
            'pinned' => Post::query()->where('pinned', true)->count(),
            'created_recent' => Post::query()->where('created_at', '>=', $recentWindowStart)->count(),
            'created_previous' => Post::query()->whereBetween('created_at', [$previousWindowStart, $recentWindowStart])->count(),
        ];
    }

    private function gatherUserMetrics(): array
    {
        if (! Schema::hasTable('users')) {
            return [
                'total' => 0,
                'created_recent' => 0,
                'created_previous' => 0,
            ];
        }

        $now = now();
        $recentWindowStart = $now->copy()->subDays(7);
        $previousWindowStart = $now->copy()->subDays(14);

        return [
            'total' => User::query()->count(),
            'created_recent' => User::query()->where('created_at', '>=', $recentWindowStart)->count(),
            'created_previous' => User::query()->whereBetween('created_at', [$previousWindowStart, $recentWindowStart])->count(),
        ];
    }

    private function gatherAttachmentMetrics(): array
    {
        if (! Schema::hasTable('attachments')) {
            return [
                'used_bytes' => 0,
                'capacity_bytes' => self::STORAGE_CAPACITY_BYTES,
            ];
        }

        $usedBytes = (int) Attachment::query()->whereNotNull('size')->sum('size');

        return [
            'used_bytes' => $usedBytes,
            'capacity_bytes' => self::STORAGE_CAPACITY_BYTES,
        ];
    }

    private function gatherContactSummary(): array
    {
        if (! Schema::hasTable('contact_messages')) {
            return [
                'new' => 0,
                'in_progress' => 0,
                'resolved' => 0,
                'spam' => 0,
            ];
        }

        $baseQuery = ContactMessage::query();

        return [
            'new' => (clone $baseQuery)->where('status', ContactMessage::STATUS_MAP['new'])->count(),
            'in_progress' => (clone $baseQuery)->where('status', ContactMessage::STATUS_MAP['processing'])->count(),
            'resolved' => (clone $baseQuery)->where('status', ContactMessage::STATUS_MAP['resolved'])->count(),
            'spam' => (clone $baseQuery)->where('status', ContactMessage::STATUS_MAP['spam'])->count(),
        ];
    }

    private function formatMetrics(array $postMetrics, array $userMetrics, array $attachmentMetrics): array
    {
        $storageUsage = $this->calculateStorageUsage($attachmentMetrics['used_bytes'], $attachmentMetrics['capacity_bytes']);

        return [
            [
                'key' => 'total_posts',
                'label' => 'Total posts',
                'value' => $postMetrics['total'],
                'delta' => $postMetrics['created_recent'],
                'trend' => $this->resolveTrend($postMetrics['created_recent'], $postMetrics['created_previous']),
            ],
            [
                'key' => 'draft_posts',
                'label' => 'Draft posts',
                'value' => $postMetrics['draft'],
            ],
            [
                'key' => 'scheduled_posts',
                'label' => 'Scheduled posts',
                'value' => $postMetrics['scheduled'],
            ],
            [
                'key' => 'total_users',
                'label' => 'Users',
                'value' => $userMetrics['total'],
                'delta' => $userMetrics['created_recent'],
                'trend' => $this->resolveTrend($userMetrics['created_recent'], $userMetrics['created_previous']),
            ],
            [
                'key' => 'storage_usage',
                'label' => 'Storage usage',
                'value' => round($storageUsage['percentage'], 1),
                'unit' => '%',
                'meta' => [
                    'usedBytes' => $storageUsage['used_bytes'],
                    'capacityBytes' => $storageUsage['capacity_bytes'],
                ],
            ],
        ];
    }

    private function calculateStorageUsage(int $usedBytes, int $capacityBytes): array
    {
        $capacityBytes = max($capacityBytes, 1);
        $percentage = min(100, ($usedBytes / $capacityBytes) * 100);

        return [
            'used_bytes' => $usedBytes,
            'capacity_bytes' => $capacityBytes,
            'percentage' => $percentage,
        ];
    }

    private function resolveTrend(int $recent, int $previous): string
    {
        if ($recent === $previous) {
            return 'flat';
        }

        return $recent >= $previous ? 'up' : 'down';
    }

    private function buildActivityFeed(): array
    {
        $activities = collect();

        if (Schema::hasTable('posts')) {
            $recentPosts = Post::query()
                ->with(['creator:id,name', 'category:id,name'])
                ->withCount('attachments')
                ->orderByDesc('updated_at')
                ->limit(6)
                ->get();

            $activities = $activities->merge(
                $recentPosts->map(function (Post $post): array {
                    $timestamp = $post->published_at ?? $post->updated_at ?? $post->created_at;

                    return [
                        'id' => 'post:'.$post->id,
                        'type' => 'post',
                        'title' => $post->title ?? $post->title_en ?? __('manage.dashboard.admin.posts.empty'),
                        'status' => $post->status,
                        'timestamp' => optional($timestamp)->toIso8601String(),
                        'actor' => optional($post->creator)->name,
                        'href' => Route::has('manage.admin.posts.edit') ? route('manage.admin.posts.edit', $post->id) : null,
                        'meta' => [
                            'category' => optional($post->category)->name,
                            'attachments' => $post->attachments_count,
                            'pinned' => (bool) $post->pinned,
                        ],
                    ];
                })
            );
        }

        if (Schema::hasTable('contact_messages')) {
            $recentMessages = ContactMessage::query()
                ->orderByDesc('created_at')
                ->limit(4)
                ->get();

            $activities = $activities->merge(
                $recentMessages->map(function (ContactMessage $message): array {
                    return [
                        'id' => 'contact:'.$message->id,
                        'type' => 'contact',
                        'title' => $message->subject ?: ($message->name ?: __('Contact message')),
                        'status' => $this->normalizeContactStatus($message->status),
                        'timestamp' => optional($message->created_at)->toIso8601String(),
                        'actor' => $message->name,
                        'href' => Route::has('manage.admin.messages.show') ? route('manage.admin.messages.show', $message->id) : null,
                        'meta' => [
                            'email' => $message->email,
                        ],
                    ];
                })
            );
        }

        return $activities
            ->sortByDesc('timestamp')
            ->values()
            ->all();
    }

    private function normalizeContactStatus(string $status): string
    {
        return match ($status) {
            'processing' => 'in_progress',
            default => $status,
        };
    }

    private function buildQuickLinks(): array
    {
        return array_values(array_filter([
            [
                'key' => 'create_post',
                'label' => 'Create announcement',
                'description' => 'Draft and publish a new announcement.',
                'href' => Route::has('manage.admin.posts.create') ? route('manage.admin.posts.create') : '/manage/admin/posts/create',
                'icon' => 'Megaphone',
                'ability' => 'manage.posts.create',
            ],
            [
                'key' => 'view_posts',
                'label' => 'Review announcements',
                'description' => 'Open the announcement list for administering records.',
                'href' => Route::has('manage.admin.posts.index') ? route('manage.admin.posts.index') : '/manage/admin/posts',
                'icon' => 'Newspaper',
                'ability' => 'manage.posts.view',
            ],
            [
                'key' => 'invite_teacher',
                'label' => 'Invite teacher',
                'description' => 'Create a new teacher account and assign roles.',
                'href' => Route::has('manage.admin.users.create') ? route('manage.admin.users.create') : '/manage/admin/users/create',
                'icon' => 'UserPlus',
                'ability' => 'manage.users.create',
            ],
            [
                'key' => 'upload_attachment',
                'label' => 'Upload attachment',
                'description' => 'Organise files inside the shared resource library.',
                'href' => Route::has('manage.admin.attachments.create') ? route('manage.admin.attachments.create') : '/manage/admin/attachments/create',
                'icon' => 'UploadCloud',
                'ability' => 'manage.attachments.create',
            ],
        ]));
    }

    private function buildPersonalTodos(array $postMetrics, array $contactSummary): array
    {
        $todos = [];

        $draftCount = $postMetrics['draft'] ?? 0;
        $scheduledCount = $postMetrics['scheduled'] ?? 0;
        $newMessages = $contactSummary['new'] ?? 0;

        $todos[] = [
            'key' => 'review_drafts',
            'label' => 'Review drafts',
            'description' => $draftCount === 0
                ? 'No drafts pending review.'
                : sprintf('%d draft(s) pending review.', $draftCount),
            'count' => $draftCount,
            'completed' => $draftCount === 0,
            'href' => Route::has('manage.admin.posts.index') ? route('manage.admin.posts.index', ['status' => 'draft']) : '/manage/admin/posts?status=draft',
        ];

        $todos[] = [
            'key' => 'review_scheduled',
            'label' => 'Review scheduled posts',
            'description' => $scheduledCount === 0
                ? 'All scheduled announcements are confirmed.'
                : sprintf('%d scheduled announcement(s) awaiting review.', $scheduledCount),
            'count' => $scheduledCount,
            'completed' => $scheduledCount === 0,
            'href' => Route::has('manage.admin.posts.index') ? route('manage.admin.posts.index', ['status' => 'scheduled']) : '/manage/admin/posts?status=scheduled',
        ];

        $todos[] = [
            'key' => 'reply_contact',
            'label' => 'Reply to contact messages',
            'description' => $newMessages === 0
                ? 'All contact messages have been answered.'
                : sprintf('%d new message(s) awaiting reply.', $newMessages),
            'count' => $newMessages,
            'completed' => $newMessages === 0,
            'href' => Route::has('manage.admin.messages.index') ? route('manage.admin.messages.index', ['status' => 'new']) : '/manage/admin/messages?status=new',
        ];

        return $todos;
    }
}
