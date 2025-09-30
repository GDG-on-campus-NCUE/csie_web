<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRole extends Model
{
    use HasFactory;

    /**
     * 允許批次填充的欄位。
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'role_id',
        'status',
        'assigned_at',
    ];

    /**
     * 欄位轉型設定。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    /**
     * 關聯的使用者。
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 關聯的角色。
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }
}
