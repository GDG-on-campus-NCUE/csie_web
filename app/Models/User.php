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
     * 傳統以 users.role enum 欄位保存使用者角色，保留 userRoles relation 不再使用。
     * 若未來要支援多重角色，可再恢復 relations 與對應 migration。
     */
    // ...existing code...

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
        return in_array($role, $this->getActiveRoles(), true);
    }

    /**
     * 判斷是否擁有指定角色或更高權限。
     */
    public function hasRoleOrHigher(string $role): bool
    {
        // 不使用 roles 資料表時，無法比較 priority；退回為簡單的 hasRole 檢查
        return $this->hasRole($role);
    }

    /**
     * 主要角色存取器。
     */
    public function getRoleAttribute(): ?string
    {
        // 直接回傳 enum 欄位
        return $this->attributes['role'] ?? null;
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
        if ($this->role === null) {
            return collect();
        }

        $obj = (object) [
            'name' => $this->role,
            'priority' => 0,
            'pivot' => (object) ['status' => $this->status === self::STATUS_MAP['active'] ? 'active' : 'inactive'],
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
