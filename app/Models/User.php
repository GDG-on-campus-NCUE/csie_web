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
     * 可大量指定的欄位。
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
     * 附加屬性。
     *
     * @var list<string>
     */
    protected $appends = [
        'roles',
        'primary_role',
    ];

    /**
     * 隱藏欄位。
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => 'string',
        ];
    }

    // ----- 角色相關工具 -----

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isTeacher(): bool
    {
        return $this->hasRole('teacher');
    }

    public function isUser(): bool
    {
        return $this->hasRole('user');
    }

    public function hasRole(string $roleName): bool
    {
        return $this->userRoles()
            ->whereHas('role', fn ($q) => $q->where('name', $roleName))
            ->where('status', 'active')
            ->exists();
    }

    public function hasRoleOrHigher(string $roleName): bool
    {
        $roleHierarchy = Role::getHierarchy();
        $requiredPriority = array_search($roleName, $roleHierarchy, true);

        if ($requiredPriority === false) {
            return false;
        }

        foreach ($this->getActiveRoles() as $role) {
            $userPriority = array_search($role, $roleHierarchy, true);
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
            ->all();
    }

    public function getPrimaryRole(): ?string
    {
        $roles = $this->getActiveRoles();
        if (empty($roles)) {
            return null;
        }

        $hierarchy = Role::getHierarchy();
        foreach ($hierarchy as $roleName) {
            if (in_array($roleName, $roles, true)) {
                return $roleName;
            }
        }

        return $roles[0];
    }

    public function getRoleAttribute(): string
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

    public function scopeCanBeManagedBy($query, $user)
    {
        if ($user->isAdmin()) {
            return $query->whereDoesntHave('userRoles', function ($q) {
                $q->whereHas('role', fn ($roleQuery) => $roleQuery->where('name', 'admin'))
                    ->where('status', 'active');
            })->where('id', '!=', $user->id);
        }

        if ($user->isTeacher()) {
            return $query->whereHas('userRoles', function ($q) {
                $q->whereHas('role', fn ($roleQuery) => $roleQuery->where('name', 'user'))
                    ->where('status', 'active');
            });
        }

        return $query->whereRaw('1 = 0');
    }

    // ----- 關聯設定 -----

    public function userRoles()
    {
        return $this->hasMany(UserRole::class);
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles')->wherePivot('status', 'active');
    }

    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    public function labs()
    {
        return $this->belongsToMany(Lab::class, 'lab_user');
    }

    public function classrooms()
    {
        return $this->belongsToMany(Classroom::class, 'classroom_user');
    }

    public function researchRecords()
    {
        return $this->hasMany(ResearchRecord::class);
    }
}
