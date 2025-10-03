<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebhookLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_type',
        'url',
        'method',
        'payload',
        'response_code',
        'response_body',
        'status',
        'retry_count',
        'sent_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'sent_at' => 'datetime',
    ];

    // 狀態常數
    const STATUS_PENDING = 'pending';
    const STATUS_SUCCESS = 'success';
    const STATUS_FAILED = 'failed';

    /**
     * Scope: 待處理
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope: 失敗
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * 標記為成功
     */
    public function markSuccess(int $responseCode, ?string $responseBody = null): void
    {
        $this->update([
            'status' => self::STATUS_SUCCESS,
            'response_code' => $responseCode,
            'response_body' => $responseBody,
            'sent_at' => now(),
        ]);
    }

    /**
     * 標記為失敗
     */
    public function markFailed(int $responseCode, ?string $responseBody = null): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'response_code' => $responseCode,
            'response_body' => $responseBody,
            'sent_at' => now(),
        ]);
    }

    /**
     * 增加重試次數
     */
    public function incrementRetry(): void
    {
        $this->increment('retry_count');
    }
}
