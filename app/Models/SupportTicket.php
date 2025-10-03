<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SupportTicket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'ticket_number',
        'subject',
        'category',
        'priority',
        'message',
        'status',
        'assigned_to',
        'resolved_at',
        'closed_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    // 狀態常數
    const STATUS_OPEN = 'open';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_RESOLVED = 'resolved';
    const STATUS_CLOSED = 'closed';

    // 優先級常數
    const PRIORITY_LOW = 'low';
    const PRIORITY_MEDIUM = 'medium';
    const PRIORITY_HIGH = 'high';
    const PRIORITY_URGENT = 'urgent';

    // 分類常數
    const CATEGORY_TECHNICAL = 'technical';
    const CATEGORY_ACCOUNT = 'account';
    const CATEGORY_FEATURE = 'feature';
    const CATEGORY_OTHER = 'other';

    /**
     * 關聯：工單建立者
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 關聯：指派的處理人員
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * 關聯：工單回覆
     */
    public function replies(): HasMany
    {
        return $this->hasMany(SupportTicketReply::class, 'ticket_id');
    }

    /**
     * 關聯：附件
     */
    public function attachments(): MorphToMany
    {
        return $this->morphToMany(Attachment::class, 'attachable')
            ->withTimestamps();
    }

    /**
     * 關聯：標籤
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable')
            ->withTimestamps();
    }

    /**
     * 生成工單編號
     */
    public static function generateTicketNumber(): string
    {
        $date = now()->format('Ymd');
        $lastTicket = static::whereDate('created_at', today())
            ->orderByDesc('id')
            ->first();

        $sequence = $lastTicket ? (intval(substr($lastTicket->ticket_number, -4)) + 1) : 1;

        return sprintf('ST-%s-%04d', $date, $sequence);
    }

    /**
     * Scope: 開啟中的工單
     */
    public function scopeOpen($query)
    {
        return $query->where('status', self::STATUS_OPEN);
    }

    /**
     * Scope: 處理中的工單
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    /**
     * Scope: 已解決的工單
     */
    public function scopeResolved($query)
    {
        return $query->where('status', self::STATUS_RESOLVED);
    }

    /**
     * Scope: 已關閉的工單
     */
    public function scopeClosed($query)
    {
        return $query->where('status', self::STATUS_CLOSED);
    }

    /**
     * Scope: 高優先級
     */
    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', [self::PRIORITY_HIGH, self::PRIORITY_URGENT]);
    }

    /**
     * 檢查是否可以回覆
     */
    public function canReply(): bool
    {
        return !in_array($this->status, [self::STATUS_CLOSED]);
    }

    /**
     * 標記為處理中
     */
    public function markInProgress(?int $assignedTo = null): void
    {
        $this->update([
            'status' => self::STATUS_IN_PROGRESS,
            'assigned_to' => $assignedTo ?? $this->assigned_to,
        ]);
    }

    /**
     * 標記為已解決
     */
    public function markResolved(): void
    {
        $this->update([
            'status' => self::STATUS_RESOLVED,
            'resolved_at' => now(),
        ]);
    }

    /**
     * 關閉工單
     */
    public function close(): void
    {
        $this->update([
            'status' => self::STATUS_CLOSED,
            'closed_at' => now(),
        ]);
    }
}
