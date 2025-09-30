<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\TeacherProfile;

class Lab extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code','website_url','email','phone','cover_image_url','name','name_en','description','description_en','tags','sort_order','visible',
    ];

    protected $casts = [
        'visible' => 'boolean',
        'tags' => 'array',
    ];

    public function teacherProfiles()
    {
        return $this->belongsToMany(TeacherProfile::class, 'lab_teachers', 'lab_id', 'teacher_profile_id');
    }

    public function teachers()
    {
        return $this->teacherProfiles();
    }
}
