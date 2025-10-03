<?php

namespace App\Http\Controllers\Manage\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * 顯示通知列表
     */
    public function index(Request $request): Response
    {
        $notifications = $request->user()
            ->notifications()
            ->paginate(20);

        $unreadCount = $request->user()->unreadNotifications()->count();

        return Inertia::render('manage/user/notifications/index', [
            'notifications' => [
                'data' => $notifications->items(),
                'pagination' => [
                    'current_page' => $notifications->currentPage(),
                    'last_page' => $notifications->lastPage(),
                    'per_page' => $notifications->perPage(),
                    'total' => $notifications->total(),
                ],
            ],
            'unreadCount' => $unreadCount,
        ]);
    }

    /**
     * 標記通知為已讀
     */
    public function markAsRead(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        // 如果有 action_url，重定向到該頁面
        $actionUrl = $notification->data['action_url'] ?? null;

        if ($actionUrl) {
            return redirect($actionUrl);
        }

        return back()->with('success', '通知已標記為已讀');
    }

    /**
     * 標記所有通知為已讀
     */
    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back()->with('success', '所有通知已標記為已讀');
    }

    /**
     * 刪除通知
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->delete();

        return back()->with('success', '通知已刪除');
    }

    /**
     * 清除所有已讀通知
     */
    public function clearRead(Request $request): RedirectResponse
    {
        $request->user()
            ->readNotifications()
            ->delete();

        return back()->with('success', '已讀通知已清除');
    }
}
