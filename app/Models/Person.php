<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Person extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'name_en', 'email', 'phone', 'photo_url',
        'bio', 'bio_en', 'status', 'sort_order', 'visible'
    ];

    protected $casts = [
        'visible' => 'boolean',
        'status' => 'string',
    ];

    protected $attributes = [
        'status' => 'active',
        'sort_order' => 0,
        'visible' => true,
    ];

    /**
     * Accessor: Get name as localized JSON object
     */
    public function getNameAttribute($value)
    {
        return [
            'zh-TW' => $this->attributes['name'] ?? '',
            'en' => $this->attributes['name_en'] ?? '',
        ];
    }

    /**
     * Mutator: Set name from JSON object to separate fields
     */
    public function setNameAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['name'] = $value['zh-TW'] ?? '';
            $this->attributes['name_en'] = $value['en'] ?? '';
        } else {
            $this->attributes['name'] = $value;
        }
    }

    /**
     * Accessor: Get bio as localized JSON object
     */
    public function getBioAttribute($value)
    {
        if (empty($this->attributes['bio']) && empty($this->attributes['bio_en'])) {
            return null;
        }

        return [
            'zh-TW' => $this->attributes['bio'] ?? '',
            'en' => $this->attributes['bio_en'] ?? '',
        ];
    }

    /**
     * Mutator: Set bio from JSON object to separate fields
     */
    public function setBioAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['bio'] = $value['zh-TW'] ?? '';
            $this->attributes['bio_en'] = $value['en'] ?? '';
        } else {
            $this->attributes['bio'] = $value;
        }
    }

    /**
     * Accessor: Get avatar URL
     */
    public function getAvatarAttribute()
    {
        return $this->attributes['photo_url'] ?? null;
    }

    /**
     * Mutator: Set avatar URL
     */
    public function setAvatarAttribute($value)
    {
        $this->attributes['photo_url'] = $value;
    }

    // Relationships
    public function userRoles()
    {
        return $this->hasMany(UserRole::class);
    }

    public function teacherProfile()
    {
        return $this->hasOne(TeacherProfile::class);
    }

    public function staffProfile()
    {
        return $this->hasOne(StaffProfile::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles')->wherePivot('status', 'active');
    }

    // Scopes
    public function scopeVisible($query)
    {
        return $query->where('visible', true);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('name_en', 'like', "%{$term}%")
              ->orWhere('email', 'like', "%{$term}%");
        });
    }

    // Helper methods
    public function hasRole($roleName)
    {
        return $this->userRoles()
            ->whereHas('role', function ($q) use ($roleName) {
                $q->where('name', $roleName);
            })
            ->where('status', 'active')
            ->exists();
    }

    public function isTeacher()
    {
        return $this->hasRole('teacher');
    }

    public function isStaff()
    {
        return $this->hasRole('staff');
    }

    public function getActiveRoles()
    {
        return $this->userRoles()
            ->with('role')
            ->where('status', 'active')
            ->get()
            ->pluck('role.name')
            ->toArray();
    }
}
