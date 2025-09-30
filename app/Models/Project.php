<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\TeacherProfile;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code','start_date','end_date','sponsor','budget','website_url','title','title_en','abstract','abstract_en','visible',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'visible' => 'boolean',
    ];

    public function teacherProfiles()
    {
        return $this->belongsToMany(TeacherProfile::class, 'project_teachers', 'project_id', 'teacher_profile_id');
    }

    public function teachers()
    {
        return $this->teacherProfiles();
    }
}
