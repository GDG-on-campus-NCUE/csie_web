<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactMessage extends Model
{
    use HasFactory;

    /**
     * 狀態對應表。
     *
     * @var array<string, int>
     */
    public const STATUS_MAP = [
        'new' => 1,
        'processing' => 2,
        'resolved' => 3,
        'spam' => 4,
    ];

    /**
     * 可批次設定的欄位。
     *
     * @var list<string>
     */
    protected $fillable = [
        'locale',
        'name',
        'email',
        'subject',
        'message',
        'file_url',
        'status',
        'processed_by',
        'processed_at',
    ];

    /**
     * 欄位轉型設定。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'processed_at' => 'datetime',
    ];

    /**
     * 狀態屬性轉換。
     */
    protected function status(): Attribute
    {
        return Attribute::make(
            get: fn ($value): string => array_flip(self::STATUS_MAP)[$value] ?? 'new',
            set: function ($value) {
                if (is_int($value)) {
                    return $value;
                }

                $key = is_string($value) ? strtolower($value) : 'new';

                return self::STATUS_MAP[$key] ?? self::STATUS_MAP['new'];
            }
        );
    }

    /**
     * 處理訊息的使用者。
     */
    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
