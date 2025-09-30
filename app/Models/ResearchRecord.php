<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'type',
        'description',
        'published_at',
        'metadata',
    ];

    protected $casts = [
        'published_at' => 'date',
        'metadata' => 'array',
    ];

    /**
     * 關聯：紀錄所屬的使用者（通常為教師）。
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 關聯：紀錄相關的標籤集合。
     */
    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'research_record_tag');
    }
}
