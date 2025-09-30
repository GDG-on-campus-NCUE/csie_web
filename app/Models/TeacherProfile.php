<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TeacherProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'person_id', 'office', 'job_title', 'title', 'title_en',
        'expertise', 'expertise_en', 'education', 'education_en'
    ];

    // Relationships
    public function person()
    {
        return $this->belongsTo(Person::class);
    }

    public function links()
    {
        return $this->hasMany(TeacherLink::class, 'teacher_profile_id');
   }

    public function publications()
    {
        return $this->hasMany(Publication::class, 'teacher_id');
    }

    public function projects()
    {
        return $this->hasMany(Project::class, 'teacher_id');
    }

    public function labs()
    {
        return $this->belongsToMany(Lab::class, 'lab_teachers', 'teacher_id');
    }

    /**
     * Accessor: Get title as localized JSON object
     */
    public function getTitleAttribute($value)
    {
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
     * Accessor: Get expertise as localized JSON array
     */
    public function getExpertiseAttribute($value)
    {
        $zhTW = $this->attributes['expertise'] ?? '';
        $en = $this->attributes['expertise_en'] ?? '';

        $zhTWArray = json_decode($zhTW, true);
        $enArray = json_decode($en, true);

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
        $zhTW = $this->attributes['education'] ?? '';
        $en = $this->attributes['education_en'] ?? '';

        $zhTWArray = json_decode($zhTW, true);
        $enArray = json_decode($en, true);

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
}
