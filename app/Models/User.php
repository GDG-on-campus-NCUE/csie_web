<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    /**
     * 使用者狀態與儲存數值對應。
     *
     * @var array<string, int>
     */
    public const STATUS_MAP = [
        'active' => 1,
        'inactive' => 2,
    ];

    /**
     * 可批次指定的欄位。
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'locale',
        'status',
        'email_verified_at',
    ];

    /**
     * 隱藏欄位設定。
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * 轉型設定。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * 狀態屬性轉換。
     */
    protected function status(): Attribute
    {
        return Attribute::make(
            get: fn ($value): string => array_flip(self::STATUS_MAP)[$value] ?? 'inactive',
            set: function ($value) {
                if (is_int($value)) {
                    return $value;
                }

                $key = is_string($value) ? strtolower($value) : 'active';

                return self::STATUS_MAP[$key] ?? self::STATUS_MAP['active'];
            }
        );
    }

    /**
     * 使用者角色的關聯資料。
     */
    public function userRoles(): HasMany
    {
        return $this->hasMany(UserRole::class);
    }

    /**
     * 直接取得角色資料。
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withPivot(['status', 'assigned_at']);
    }

    /**
     * 使用者個人檔案。
     */
    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    /**
     * 取得啟用中的角色列表。
     *
     * @return array<int, string>
     */
    public function getActiveRoles(): array
    {
        return $this->activeRoleCollection()
            ->sortByDesc(fn (Role $role) => $role->priority ?? 0)
            ->pluck('name')
            ->values()
            ->all();
    }

    /**
     * 判斷是否擁有指定角色。
     */
    public function hasRole(string $role): bool
    {
        return in_array($role, $this->getActiveRoles(), true);
    }

    /**
     * 判斷是否擁有指定角色或更高權限。
     */
    public function hasRoleOrHigher(string $role): bool
    {
        $targetPriority = Role::query()->where('name', $role)->value('priority');
        if ($targetPriority === null) {
            return $this->hasRole($role);
        }

        return $this->activeRoleCollection()
            ->contains(fn (Role $roleModel) => ($roleModel->priority ?? 0) >= $targetPriority);
    }

    /**
     * 主要角色存取器。
     */
    public function getRoleAttribute(): ?string
    {
        return $this->activeRoleCollection()
            ->sortByDesc(fn (Role $role) => $role->priority ?? 0)
            ->pluck('name')
            ->first();
    }

    /**
     * 是否為管理員。
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * 是否為教師。
     */
    public function isTeacher(): bool
    {
        return $this->hasRole('teacher');
    }

    /**
     * 查詢範圍：僅啟用的使用者。
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_MAP['active']);
    }

    /**
     * 取得目前啟用中的角色集合。
     */
    protected function activeRoleCollection(): Collection
    {
        $roles = $this->relationLoaded('roles')
            ? $this->getRelation('roles')
            : $this->roles()->get();

        return $roles->filter(function (Role $role) {
            $status = $role->pivot->status ?? 'active';

            return strtolower((string) $status) === 'active';
        });
    }
}
