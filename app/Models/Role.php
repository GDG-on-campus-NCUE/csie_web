<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    /**
     * 可批次設定的欄位。
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'display_name',
        'priority',
    ];

    /**
     * 欄位轉型設定。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'priority' => 'integer',
    ];

    /**
     * 角色擁有的使用者。
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles')
            ->withPivot(['status', 'assigned_at']);
    }
}
