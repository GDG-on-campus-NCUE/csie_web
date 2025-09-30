<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserProfile extends Model
{
    use HasFactory;

    /**
     * 允許批次指定的欄位。
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'avatar_url',
        'bio',
        'experience',
        'education',
    ];

    /**
     * 欄位轉型設定。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'experience' => 'array',
        'education' => 'array',
    ];

    /**
     * 關聯的使用者。
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 個人檔案的外部連結。
     */
    public function links(): HasMany
    {
        return $this->hasMany(UserProfileLink::class);
    }
}
