<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'start_date',
        'end_date',
        'sponsor',
        'budget',
        'website_url',
        'title',
        'title_en',
        'abstract',
        'abstract_en',
        'visible',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'visible' => 'boolean',
    ];

    public function members()
    {
        return $this->belongsToMany(User::class, 'project_user', 'project_id', 'user_id');
    }

    public function teachers()
    {
        return $this->members();
    }
}
