<?php

namespace App\Http\Controllers\Manage\User;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * 一般使用者儀表板控制器
 *
 * 負責顯示使用者個人儀表板頁面，包含：
 * - 個人資料完整度檢核
 * - 最近的公告列表
 * - 書籤功能
 * - 待辦事項提醒
 */
class DashboardController extends Controller
{
    /**
     * 顯示使用者儀表板頁面
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        // 計算個人資料完整度
        $profileCompleteness = $this->calculateProfileCompleteness($user);

        // 取得最近的公告（只顯示使用者自己建立的）
        $recentPosts = Post::query()
            ->where('created_by', $user->id)
            ->whereNotNull('published_at')
            ->with(['category:id,name', 'tags:id,name,slug'])
            ->orderByDesc('published_at')
            ->limit(5)
            ->get()
            ->map(fn ($post) => [
                'id' => $post->id,
                'title' => $post->title,
                'summary' => $post->summary,
                'category' => $post->category?->name,
                'published_at' => $post->published_at?->format('Y-m-d'),
                'tags' => $post->tags->pluck('name')->toArray(),
            ]);

        // 統計資料
        $stats = [
            'profile_completeness' => $profileCompleteness,
            'unread_messages' => 0, // TODO: 實作訊息功能後更新
            'space_bindings' => $user->spaces()->count(),
        ];

        return Inertia::render('manage/user/dashboard', [
            'stats' => $stats,
            'recentPosts' => $recentPosts,
            'quickLinks' => $this->getQuickLinks(),
        ]);
    }

    /**
     * 計算個人資料完整度（百分比）
     */
    private function calculateProfileCompleteness($user): int
    {
        $fields = [
            'name' => ! empty($user->name),
            'email' => ! empty($user->email),
            'profile_photo' => ! empty($user->profile_photo_path),
        ];

        if ($user->profile) {
            $fields['phone'] = ! empty($user->profile->phone);
            $fields['title'] = ! empty($user->profile->title);
            $fields['bio'] = ! empty($user->profile->bio);
        }

        $completed = count(array_filter($fields));
        $total = count($fields);

        return (int) round(($completed / $total) * 100);
    }

    /**
     * 取得快速連結清單
     */
    private function getQuickLinks(): array
    {
        return [
            [
                'title' => '編輯個人資料',
                'description' => '更新您的個人資訊',
                'href' => route('manage.settings.profile.edit'),
                'icon' => 'user',
            ],
            [
                'title' => '安全設定',
                'description' => '管理密碼和安全選項',
                'href' => route('manage.settings.password.edit'),
                'icon' => 'shield',
            ],
            [
                'title' => '外觀設定',
                'description' => '自訂介面主題與字體',
                'href' => route('manage.settings.appearance.edit'),
                'icon' => 'palette',
            ],
            [
                'title' => '空間綁定',
                'description' => '管理您的空間資源',
                'href' => route('manage.user.spaces.index'),
                'icon' => 'link',
            ],
        ];
    }
}
