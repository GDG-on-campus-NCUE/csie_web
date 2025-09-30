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
        'locale',
        'status',
    ];

    /**
     * Additional attributes that should be appended to array casts.
     *
     * @var list<string>
     */
    protected $appends = [
        'roles',
        'primary_role',
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
            'status' => 'string',
        ];
    }

    // 角色相關方法 - 新系統
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isTeacher(): bool
    {
        return $this->hasRole('teacher');
    }

    public function isStaff(): bool
    {
        return $this->hasRole('staff');
    }

    public function isUser(): bool
    {
        return $this->hasRole('user');
    }

    public function hasRole(string $roleName): bool
    {
        return $this->userRoles()
            ->whereHas('role', function ($q) use ($roleName) {
                $q->where('name', $roleName);
            })
            ->where('status', 'active')
            ->exists();
    }

    public function hasRoleOrHigher(string $roleName): bool
    {
        $roleHierarchy = Role::getHierarchy();
        $requiredPriority = array_search($roleName, $roleHierarchy);

        if ($requiredPriority === false) {
            return false;
        }

        $userRoles = $this->getActiveRoles();
        foreach ($userRoles as $userRole) {
            $userPriority = array_search($userRole, $roleHierarchy);
            if ($userPriority !== false && $userPriority >= $requiredPriority) {
                return true;
            }
        }

        return false;
    }

    public function getActiveRoles(): array
    {
        return $this->userRoles()
            ->with('role')
            ->where('status', 'active')
            ->get()
            ->pluck('role.name')
            ->unique()
            ->values()
            ->toArray();
    }

    public function getPrimaryRole(): ?string
    {
        $roles = $this->getActiveRoles();
        if (empty($roles)) {
            return null;
        }

        // 返回權限最高的角色
        $hierarchy = Role::getHierarchy();
        foreach ($hierarchy as $priority => $roleName) {
            if (in_array($roleName, $roles)) {
                return $roleName;
            }
        }

        return $roles[0];
    }

    // 向後相容性：保留舊的 role 屬性取得器
    public function getRoleAttribute()
    {
        return $this->getPrimaryRole() ?? 'user';
    }

    public function getRolesAttribute(): array
    {
        return $this->getActiveRoles();
    }

    public function getPrimaryRoleAttribute(): ?string
    {
        return $this->getPrimaryRole();
    }

    /**
     * 範圍：取得指定使用者可管理的帳號
     */
    public function scopeCanBeManagedBy($query, $user)
    {
        if ($user->isAdmin()) {
            // 管理員可管理所有非管理員帳號，且不得處理自己
            return $query->whereDoesntHave('userRoles', function ($q) {
                $q->whereHas('role', function ($roleQuery) {
                    $roleQuery->where('name', 'admin');
                })->where('status', 'active');
            })->where('id', '!=', $user->id);
        } elseif ($user->isTeacher()) {
            // 教師僅能管理一般會員
            return $query->whereHas('userRoles', function ($q) {
                $q->whereHas('role', function ($roleQuery) {
                    $roleQuery->where('name', 'user');
                })->where('status', 'active');
            });
        } else {
            // 一般會員無法管理任何帳號
            return $query->whereRaw('1 = 0');
        }
    }

    // Relationships - 新系統
    public function userRoles()
    {
        return $this->hasMany(UserRole::class);
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles')->wherePivot('status', 'active');
    }

    public function people()
    {
        return $this->belongsToMany(Person::class, 'user_roles')->wherePivot('status', 'active');
    }

    // 向後相容性
    public function teacher()
    {
        return $this->hasOne(Teacher::class, 'user_id');
    }

    // 新的關聯方法
    public function teacherProfile()
    {
        return $this->hasOneThrough(
            TeacherProfile::class,
            UserRole::class,
            'user_id',
            'person_id',
            'id',
            'person_id'
        )->whereHas('userRole', function ($q) {
            $q->whereHas('role', function ($roleQuery) {
                $roleQuery->where('name', 'teacher');
            })->where('status', 'active');
        });
    }

    public function staffProfile()
    {
        return $this->hasOneThrough(
            StaffProfile::class,
            UserRole::class,
            'user_id',
            'person_id',
            'id',
            'person_id'
        )->whereHas('userRole', function ($q) {
            $q->whereHas('role', function ($roleQuery) {
                $roleQuery->where('name', 'staff');
            })->where('status', 'active');
        });
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
