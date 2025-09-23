<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id','email','phone','office','job_title','photo_url',
        'name','name_en','title','title_en','bio','bio_en',
        'expertise','expertise_en','education','education_en',
        'sort_order','visible',
    ];

    protected $casts = [
        'visible' => 'boolean',
    ];

    protected $attributes = [
        'name' => '',
        'name_en' => '',
        'title' => '',
        'title_en' => '',
        'sort_order' => 0,
        'visible' => true,
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
     * Accessor: Get title as localized JSON object
     */
    public function getTitleAttribute($value)
    {
        // If the stored value is already JSON, return it
        if (is_array($value)) {
            return $value;
        }

        // Build JSON from separate language fields
        return [
            'zh-TW' => $this->attributes['title'] ?? '',
            'en' => $this->attributes['title_en'] ?? '',
        ];
    }

    /**
     * Mutator: Set title from JSON object to separate fields
     */
    public function setTitleAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['title'] = $value['zh-TW'] ?? '';
            $this->attributes['title_en'] = $value['en'] ?? '';
        } else {
            $this->attributes['title'] = $value;
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
     * Accessor: Get expertise as localized JSON array
     */
    public function getExpertiseAttribute($value)
    {
        // If the stored value is already JSON, return it
        if (is_array($value)) {
            return $value;
        }

        // Parse JSON if stored as string
        $zhTW = $this->attributes['expertise'] ?? '';
        $en = $this->attributes['expertise_en'] ?? '';

        // Try to decode as JSON arrays first
        $zhTWArray = json_decode($zhTW, true);
        $enArray = json_decode($en, true);

        // If JSON decoding failed, treat as comma-separated string
        if (!is_array($zhTWArray)) {
            $zhTWArray = $zhTW ? array_map('trim', explode(',', $zhTW)) : [];
        }
        if (!is_array($enArray)) {
            $enArray = $en ? array_map('trim', explode(',', $en)) : [];
        }

        return [
            'zh-TW' => $zhTWArray,
            'en' => $enArray,
        ];
    }

    /**
     * Mutator: Set expertise from JSON object to separate fields
     */
    public function setExpertiseAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['expertise'] = json_encode($value['zh-TW'] ?? []);
            $this->attributes['expertise_en'] = json_encode($value['en'] ?? []);
        } else {
            $this->attributes['expertise'] = $value;
        }
    }

    /**
     * Accessor: Get education as localized JSON array
     */
    public function getEducationAttribute($value)
    {
        // If the stored value is already JSON, return it
        if (is_array($value)) {
            return $value;
        }

        // Parse JSON if stored as string
        $zhTW = $this->attributes['education'] ?? '';
        $en = $this->attributes['education_en'] ?? '';

        // Try to decode as JSON arrays first
        $zhTWArray = json_decode($zhTW, true);
        $enArray = json_decode($en, true);

        // If JSON decoding failed, treat as comma-separated string
        if (!is_array($zhTWArray)) {
            $zhTWArray = $zhTW ? array_map('trim', explode(',', $zhTW)) : [];
        }
        if (!is_array($enArray)) {
            $enArray = $en ? array_map('trim', explode(',', $en)) : [];
        }

        return [
            'zh-TW' => $zhTWArray,
            'en' => $enArray,
        ];
    }

    /**
     * Mutator: Set education from JSON object to separate fields
     */
    public function setEducationAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['education'] = json_encode($value['zh-TW'] ?? []);
            $this->attributes['education_en'] = json_encode($value['en'] ?? []);
        } else {
            $this->attributes['education'] = $value;
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
     * Relationship: Teacher belongs to a user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: Teacher has many links
     */
    public function links()
    {
        return $this->hasMany(TeacherLink::class);
    }

    /**
     * Relationship: Teacher has many publications
     */
    public function publications()
    {
        return $this->hasMany(Publication::class);
    }

    /**
     * Relationship: Teacher has many projects
     */
    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Relationship: Teacher belongs to many labs
     */
    public function labs()
    {
        return $this->belongsToMany(Lab::class, 'lab_teachers');
    }

    /**
     * Scope: Get visible teachers
     */
    public function scopeVisible($query)
    {
        return $query->where('visible', true);
    }

    /**
     * Scope: Search teachers by name, title, or expertise
     */
    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('name_en', 'like', "%{$term}%")
              ->orWhere('title', 'like', "%{$term}%")
              ->orWhere('title_en', 'like', "%{$term}%")
              ->orWhere('expertise', 'like', "%{$term}%")
              ->orWhere('expertise_en', 'like', "%{$term}%")
              ->orWhere('email', 'like', "%{$term}%");
        });
    }
}

