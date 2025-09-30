<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfileLink extends Model
{
    use HasFactory;

    /**
     * 可批次指定的欄位。
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_profile_id',
        'type',
        'label',
        'url',
        'sort_order',
    ];

    /**
     * 欄位轉型設定。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'sort_order' => 'integer',
    ];

    /**
     * 所屬的個人檔案。
     */
    public function profile(): BelongsTo
    {
        return $this->belongsTo(UserProfile::class, 'user_profile_id');
    }
}
