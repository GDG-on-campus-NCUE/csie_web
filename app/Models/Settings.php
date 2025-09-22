<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Settings extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'key',
        'value',
        'category',
        'is_public',
        'metadata'
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Relationship: Settings belongs to a User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: Get public settings
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope: Get settings by category
     */
    public function scopeInCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope: Get settings for specific user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Get settings accessible by user (considering role hierarchy)
     */
    public function scopeAccessibleBy($query, $user)
    {
        if (in_array($user->role, ['admin', 'manager'], true)) {
            // 管理角色可以檢視所有設定
            return $query;
        } elseif ($user->role === 'teacher') {
            // Teacher can access own settings and public user settings only
            return $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere(function ($subQ) use ($user) {
                      $subQ->where('is_public', true)
                           ->whereHas('user', function ($userQ) {
                               $userQ->where('role', 'user');
                           });
                  });
            });
        } else {
            // Regular user can only access own settings and other public user settings
            return $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere(function ($subQ) use ($user) {
                      $subQ->where('is_public', true)
                           ->whereHas('user', function ($userQ) {
                               $userQ->where('role', 'user');
                           });
                  });
            });
        }
    }

    /**
     * Helper: Get user setting value with default
     */
    public static function getUserSetting($userId, $key, $default = null)
    {
        $setting = static::where('user_id', $userId)
                         ->where('key', $key)
                         ->first();

        return $setting ? $setting->value : $default;
    }

    /**
     * Helper: Set user setting
     */
    public static function setUserSetting($userId, $key, $value, $category = 'general')
    {
        try {
            static::updateOrCreate(
                ['user_id' => $userId, 'key' => $key],
                ['value' => $value, 'category' => $category]
            );
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Helper: Set multiple user settings at once
     */
    public static function setBulkUserSettings($userId, $settings, $category = 'general')
    {
        try {
            foreach ($settings as $key => $value) {
                static::updateOrCreate(
                    ['user_id' => $userId, 'key' => $key],
                    ['value' => $value, 'category' => $category]
                );
            }
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Helper: Export user settings
     */
    public static function exportUserSettings($userId)
    {
        return static::where('user_id', $userId)
                    ->get(['key', 'value', 'category', 'is_public', 'metadata'])
                    ->toArray();
    }

    /**
     * Helper: Import user settings
     */
    public static function importUserSettings($userId, $settings)
    {
        try {
            foreach ($settings as $setting) {
                static::updateOrCreate(
                    ['user_id' => $userId, 'key' => $setting['key']],
                    [
                        'value' => $setting['value'],
                        'category' => $setting['category'],
                        'is_public' => $setting['is_public'] ?? false,
                        'metadata' => $setting['metadata'] ?? null
                    ]
                );
            }
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
