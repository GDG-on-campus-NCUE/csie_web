<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'notification_type',
        'channels',
        'is_enabled',
    ];

    protected $casts = [
        'channels' => 'array',
        'is_enabled' => 'boolean',
    ];

    // 通知類型常數
    const TYPE_POST_PUBLISHED = 'post_published';
    const TYPE_POST_UPDATED = 'post_updated';
    const TYPE_SPACE_SYNC_FAILED = 'space_sync_failed';
    const TYPE_PERMISSION_CHANGED = 'permission_changed';
    const TYPE_SUPPORT_TICKET_REPLY = 'support_ticket_reply';
    const TYPE_SUPPORT_TICKET_RESOLVED = 'support_ticket_resolved';
    const TYPE_LAB_MEMBER_ADDED = 'lab_member_added';
    const TYPE_PROJECT_MILESTONE = 'project_milestone';

    // 頻道常數
    const CHANNEL_EMAIL = 'email';
    const CHANNEL_APP = 'app';
    const CHANNEL_LINE = 'line';

    /**
     * 關聯：使用者
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 檢查是否啟用特定頻道
     */
    public function hasChannel(string $channel): bool
    {
        return in_array($channel, $this->channels ?? []);
    }

    /**
     * 取得使用者的通知偏好
     */
    public static function getPreference(int $userId, string $notificationType): ?self
    {
        return static::where('user_id', $userId)
            ->where('notification_type', $notificationType)
            ->first();
    }

    /**
     * 檢查使用者是否啟用特定通知
     */
    public static function isEnabled(int $userId, string $notificationType, string $channel): bool
    {
        $preference = static::getPreference($userId, $notificationType);

        if (!$preference) {
            // 預設啟用 app 和 email
            return in_array($channel, [self::CHANNEL_APP, self::CHANNEL_EMAIL]);
        }

        return $preference->is_enabled && $preference->hasChannel($channel);
    }
}
