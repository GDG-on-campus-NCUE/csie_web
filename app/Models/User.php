<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
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
     * 狀態別名，提供與前端既有欄位的相容性。
     *
     * @var array<string, string>
     */
    public const STATUS_ALIASES = [
        'suspended' => 'inactive',
    ];

    /**
     * 角色階層設定，數值越大代表權限越高。
     *
     * @var array<string, int>
     */
    public const ROLE_HIERARCHY = [
        'user' => 0,
        'teacher' => 1,
        'admin' => 2,
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
        'role',
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
                    return in_array($value, self::STATUS_MAP, true)
                        ? $value
                        : self::STATUS_MAP['active'];
                }

                $key = is_string($value) ? strtolower($value) : 'active';
                $key = self::STATUS_ALIASES[$key] ?? $key;

                return self::STATUS_MAP[$key] ?? self::STATUS_MAP['active'];
            }
        );
    }

    /**
     * 取得系統支援的角色清單。
     *
     * @return array<int, string>
     */
    public static function availableRoles(): array
    {
        return array_keys(self::ROLE_HIERARCHY);
    }

    /**
     * 取得允許輸入的角色名稱，配合前端傳入陣列格式使用。
     *
     * @return array<int, string>
     */
    public static function allowedRoleInputs(): array
    {
        return self::availableRoles();
    }

    /**
     * 取得允許輸入的狀態名稱，含前端舊有別名。
     *
     * @return array<int, string>
     */
    public static function allowedStatusInputs(): array
    {
        return array_values(array_unique([
            ...array_keys(self::STATUS_MAP),
            ...array_keys(self::STATUS_ALIASES),
        ]));
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
        // 使用者現在只會有一個角色（enum 欄位），回傳為字串陣列以符合既有前端介面
        if ($this->role === null) {
            return [];
        }

        return [(string) $this->role];
    }

    /**
     * 判斷是否擁有指定角色。
     */
    public function hasRole(string $role): bool
    {
        $role = strtolower($role);

        return in_array($role, $this->getActiveRoles(), true);
    }

    /**
     * 判斷是否擁有指定角色或更高權限。
     */
    public function hasRoleOrHigher(string $role): bool
    {
        $currentRole = $this->role;
        if ($currentRole === null) {
            return false;
        }

        $role = strtolower($role);

        if (! array_key_exists($role, self::ROLE_HIERARCHY)) {
            return false;
        }

        $currentPriority = self::ROLE_HIERARCHY[$currentRole] ?? null;

        if ($currentPriority === null) {
            return false;
        }

        return $currentPriority >= self::ROLE_HIERARCHY[$role];
    }

    /**
     * 主要角色存取器。
     */
    protected function role(): Attribute
    {
        return Attribute::make(
            get: fn ($value): ?string => $value !== null ? strtolower((string) $value) : null,
            set: function ($value) {
                if ($value === null) {
                    return null;
                }

                $role = strtolower((string) $value);

                return in_array($role, self::availableRoles(), true)
                    ? $role
                    : 'user';
            }
        );
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
        // 當系統僅使用 users.role 欄位時，模擬一個最小的 role 物件集合，
        // 以符合程式中期待的介面（name, priority, pivot->status）
        $role = $this->role;

        if ($role === null) {
            return collect();
        }

        $obj = (object) [
            'name' => $role,
            'priority' => self::ROLE_HIERARCHY[$role] ?? 0,
            'pivot' => (object) [
                'status' => $this->status === 'active' ? 'active' : 'inactive',
            ],
        ];

        return collect([$obj]);
    }

    /**
     * 取得主要角色（相當於 enum 欄位的值）。
     */
    public function getPrimaryRole(): ?string
    {
        return $this->role ?? null;
    }
}
