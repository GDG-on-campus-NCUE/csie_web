<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfileLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_profile_id',
        'type',
        'label',
        'url',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    /**
     * 關聯：所屬的使用者個人檔案。
     */
    public function profile()
    {
        return $this->belongsTo(UserProfile::class, 'user_profile_id');
    }
}
