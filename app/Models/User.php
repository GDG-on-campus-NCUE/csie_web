<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'teacher_id',
        'locale',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => 'string',
            'status' => 'string',
        ];
    }

    // 角色相關方法
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    public function isUser(): bool
    {
        return $this->role === 'user';
    }

    public function hasRoleOrHigher(string $role): bool
    {
        $hierarchy = ['user' => 1, 'teacher' => 2, 'admin' => 3];
        $userLevel = $hierarchy[$this->role] ?? 0;
        $requiredLevel = $hierarchy[$role] ?? 0;

        return $userLevel >= $requiredLevel;
    }

    /**
     * 範圍：取得指定使用者可管理的帳號
     */
    public function scopeCanBeManagedBy($query, $user)
    {
        if ($user->role === 'admin') {
            // 管理員可管理所有非管理員帳號，且不得處理自己
            return $query->where('role', '!=', 'admin')
                        ->where('id', '!=', $user->id);
        } elseif ($user->role === 'teacher') {
            // 教師僅能管理一般會員
            return $query->where('role', 'user');
        } else {
            // 一般會員無法管理任何帳號，透過永遠為假的條件避免取得資料
            return $query->whereRaw('1 = 0');
        }
    }

    // Relationships
    public function teacher()
    {
        return $this->hasOne(Teacher::class, 'user_id');
    }

    public function settings()
    {
        return $this->hasMany(Settings::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class, 'actor_id');
    }

    public function createdPosts()
    {
        return $this->hasMany(Post::class, 'created_by');
    }

    public function updatedPosts()
    {
        return $this->hasMany(Post::class, 'updated_by');
    }
}
