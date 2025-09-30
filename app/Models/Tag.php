<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class Tag extends Model
{
    use HasFactory;

    public const CONTEXTS = [
        'posts' => '公告管理',
        'labs' => '研究室管理',
        'classrooms' => '教室管理',
        'projects' => '計畫專區管理',
        'publications' => '學術成果管理',
        'programs' => '學程管理',
        'courses' => '課程管理',
        'attachments' => '附件管理',
        'research' => '研究紀錄',
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

    /**
     * 判斷標籤資料表是否已建立。
     */
    public static function tableExists(): bool
    {
        return Schema::hasTable((new static())->getTable());
    }

    public function scopeForContext($query, string $context)
    {
        return $query->where('context', $context);
    }
}
