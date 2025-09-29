<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;

/**
 * 學程模型
 *
 * 管理不同學制的學程資訊，可關聯多個公告作為學程相關文件
 */
class Program extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'level',
        'name',
        'name_en',
        'description',
        'description_en',
        'website_url',
        'visible',
        'sort_order',
    ];

    protected $casts = [
        'visible' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * 學制類別選項
     */
    public static function getLevelOptions(): array
    {
        return [
            'bachelor' => '學士班',
            'master' => '碩士班',
            'ai_inservice' => 'AI在職專班',
            'dual' => '雙聯學制',
        ];
    }

    /**
     * 公告類型選項
     */
    public static function getPostTypeOptions(): array
    {
        return [
            'curriculum' => '課程資訊',
            'regulation' => '修業規定',
            'course_map' => '課程地圖',
            'other' => '其他',
        ];
    }

    /**
     * 關聯公告（透過樞紐表包含額外欄位）
     */
    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'program_posts')
                    ->withPivot(['post_type', 'sort_order'])
                    ->withTimestamps()
                    ->orderBy('pivot_sort_order');
    }

    /**
     * 取得特定類型的公告
     */
    public function getPostsByType(string $type): BelongsToMany
    {
        return $this->posts()->wherePivot('post_type', $type);
    }

    /**
     * 取得課程資訊公告
     */
    public function getCurriculumPosts(): BelongsToMany
    {
        return $this->getPostsByType('curriculum');
    }

    /**
     * 取得修業規定公告
     */
    public function getRegulationPosts(): BelongsToMany
    {
        return $this->getPostsByType('regulation');
    }

    /**
     * 取得課程地圖公告
     */
    public function getCourseMapPosts(): BelongsToMany
    {
        return $this->getPostsByType('course_map');
    }

    /**
     * Scope: 只顯示可見的學程
     */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('visible', true);
    }

    /**
     * Scope: 依學制篩選
     */
    public function scopeByLevel(Builder $query, string $level): Builder
    {
        return $query->where('level', $level);
    }

    /**
     * Scope: 依排序順序
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * 取得學制中文名稱
     */
    public function getLevelNameAttribute(): string
    {
        return self::getLevelOptions()[$this->level] ?? $this->level;
    }
}

