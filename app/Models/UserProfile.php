<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    /**
     * 可大量指定的欄位。
     */
    protected $fillable = [
        'user_id',
        'avatar_url',
        'bio',
        'experience',
        'education',
    ];

    /**
     * 需要轉換的欄位型別。
     */
    protected $casts = [
        'experience' => 'array',
        'education' => 'array',
    ];

    /**
     * 關聯：對應的使用者。
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 關聯：外部連結集合。
     */
    public function links()
    {
        return $this->hasMany(UserProfileLink::class);
    }
}
