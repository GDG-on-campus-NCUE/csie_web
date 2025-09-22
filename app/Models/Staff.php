<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Staff extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'email','phone','photo_url','name','name_en','position','position_en','bio','bio_en','sort_order','visible',
    ];

    protected $casts = [
        'visible' => 'boolean',
    ];

    protected $attributes = [
        'visible' => true,
        'sort_order' => 0,
    ];

    /**
     * Accessor: Get name as localized JSON object
     */
    public function getNameAttribute($value)
    {
        // If the stored value is already JSON, return it
        if (is_array($value)) {
            return $value;
        }

        // Build JSON from separate language fields
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
     * Accessor: Get position as localized JSON object
     */
    public function getPositionAttribute($value)
    {
        // If the stored value is already JSON, return it
        if (is_array($value)) {
            return $value;
        }

        // Build JSON from separate language fields
        return [
            'zh-TW' => $this->attributes['position'] ?? '',
            'en' => $this->attributes['position_en'] ?? '',
        ];
    }

    /**
     * Mutator: Set position from JSON object to separate fields
     */
    public function setPositionAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['position'] = $value['zh-TW'] ?? '';
            $this->attributes['position_en'] = $value['en'] ?? '';
        } else {
            $this->attributes['position'] = $value;
        }
    }

    /**
     * Accessor: Get bio as localized JSON object
     */
    public function getBioAttribute($value)
    {
        // If no bio data, return null
        if (empty($this->attributes['bio']) && empty($this->attributes['bio_en'])) {
            return null;
        }

        // If the stored value is already JSON, return it
        if (is_array($value)) {
            return $value;
        }

        // Build JSON from separate language fields
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

    /**
     * Scope: Get visible staff
     */
    public function scopeVisible($query)
    {
        return $query->where('visible', true);
    }

    /**
     * Scope: Search staff by name or position
     */
    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('name_en', 'like', "%{$term}%")
              ->orWhere('position', 'like', "%{$term}%")
              ->orWhere('position_en', 'like', "%{$term}%")
              ->orWhere('email', 'like', "%{$term}%");
        });
    }
}

