<?php

namespace App\Http\Controllers\Manage\User;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationPreferenceController extends Controller
{
    /**
     * 顯示通知偏好設定
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        // 取得所有通知類型的偏好設定
        $preferences = $this->getPreferences($user->id);

        return Inertia::render('manage/settings/notifications', [
            'preferences' => $preferences,
        ]);
    }

    /**
     * 更新通知偏好設定
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        // 遍歷所有通知類型
        $types = [
            NotificationPreference::TYPE_POST_PUBLISHED,
            NotificationPreference::TYPE_POST_UPDATED,
            NotificationPreference::TYPE_SPACE_SYNC_FAILED,
            NotificationPreference::TYPE_PERMISSION_CHANGED,
            NotificationPreference::TYPE_SUPPORT_TICKET_REPLY,
            NotificationPreference::TYPE_SUPPORT_TICKET_RESOLVED,
            NotificationPreference::TYPE_LAB_MEMBER_ADDED,
            NotificationPreference::TYPE_PROJECT_MILESTONE,
        ];

        foreach ($types as $type) {
            $typeData = $request->input($type);

            if ($typeData) {
                NotificationPreference::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'notification_type' => $type,
                    ],
                    [
                        'channels' => $typeData['channels'] ?? [],
                        'is_enabled' => $typeData['enabled'] ?? false,
                    ]
                );
            }
        }

        return back()->with('success', '通知偏好已更新');
    }

    /**
     * 取得使用者的通知偏好
     */
    private function getPreferences(int $userId): array
    {
        $types = [
            NotificationPreference::TYPE_POST_PUBLISHED,
            NotificationPreference::TYPE_POST_UPDATED,
            NotificationPreference::TYPE_SPACE_SYNC_FAILED,
            NotificationPreference::TYPE_PERMISSION_CHANGED,
            NotificationPreference::TYPE_SUPPORT_TICKET_REPLY,
            NotificationPreference::TYPE_SUPPORT_TICKET_RESOLVED,
            NotificationPreference::TYPE_LAB_MEMBER_ADDED,
            NotificationPreference::TYPE_PROJECT_MILESTONE,
        ];

        $preferences = [];

        foreach ($types as $type) {
            $pref = NotificationPreference::getPreference($userId, $type);

            $preferences[] = [
                'notification_type' => $type,
                'channels' => $pref?->channels ?? ['email', 'app'],
                'is_enabled' => $pref?->is_enabled ?? true,
            ];
        }

        return $preferences;
    }

    /**
     * 取得通知類型選項
     */
    private function getNotificationTypes(): array
    {
        return [
            ['value' => NotificationPreference::TYPE_POST_PUBLISHED, 'label' => '公告發布'],
            ['value' => NotificationPreference::TYPE_POST_UPDATED, 'label' => '公告更新'],
            ['value' => NotificationPreference::TYPE_SPACE_SYNC_FAILED, 'label' => '空間同步失敗'],
            ['value' => NotificationPreference::TYPE_PERMISSION_CHANGED, 'label' => '權限變更'],
            ['value' => NotificationPreference::TYPE_SUPPORT_TICKET_REPLY, 'label' => '工單回覆'],
            ['value' => NotificationPreference::TYPE_SUPPORT_TICKET_RESOLVED, 'label' => '工單已解決'],
            ['value' => NotificationPreference::TYPE_LAB_MEMBER_ADDED, 'label' => '實驗室成員新增'],
            ['value' => NotificationPreference::TYPE_PROJECT_MILESTONE, 'label' => '計畫里程碑'],
        ];
    }

    /**
     * 取得頻道選項
     */
    private function getChannelOptions(): array
    {
        return [
            ['value' => NotificationPreference::CHANNEL_EMAIL, 'label' => 'Email'],
            ['value' => NotificationPreference::CHANNEL_APP, 'label' => '系統通知'],
            ['value' => NotificationPreference::CHANNEL_LINE, 'label' => 'LINE Bot'],
        ];
    }
}
