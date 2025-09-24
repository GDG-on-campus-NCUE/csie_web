<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Program extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code','level','website_url','name','name_en','description','description_en','visible','sort_order',
    ];

    protected $casts = [
        'visible' => 'boolean',
    ];

    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'program_courses');
    }

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_program')->withTimestamps();
    }
}

