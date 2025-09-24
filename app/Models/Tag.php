<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;

    public const CONTEXTS = [
        'posts' => '公告管理',
        'staff' => '職員管理',
        'teachers' => '教師管理',
        'labs' => '研究室管理',
        'projects' => '計畫專區管理',
        'publications' => '學術成果管理',
        'programs' => '學程管理',
        'courses' => '課程管理',
        'attachments' => '附件管理',
    ];

    protected $fillable = [
        'context',
        'name',
        'slug',
        'description',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function scopeForContext($query, string $context)
    {
        return $query->where('context', $context);
    }
}
