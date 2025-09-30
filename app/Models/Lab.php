<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lab extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'website_url',
        'email',
        'phone',
        'cover_image_url',
        'name',
        'name_en',
        'description',
        'description_en',
        'tags',
        'sort_order',
        'visible',
    ];

    protected $casts = [
        'visible' => 'boolean',
        'tags' => 'array',
    ];

    /**
     * 關聯：實驗室成員（使用者）。
     */
    public function members()
    {
        return $this->belongsToMany(User::class, 'lab_user');
    }

    /**
     * 為向後相容提供 teachers 別名。
     */
    public function teachers()
    {
        return $this->members();
    }
}
