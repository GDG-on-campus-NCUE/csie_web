<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TeacherLink extends Model
{
    use HasFactory;

    public $timestamps = true;

    protected $fillable = [
        'teacher_profile_id','type','label','url','sort_order',
    ];

    public function teacher()
    {
        return $this->belongsTo(TeacherProfile::class);
    }
}
