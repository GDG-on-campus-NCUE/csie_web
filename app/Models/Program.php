<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class Program extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * 學制對應表。
     *
     * @var array<string, string>
     */
    public const LEVEL_LABELS = [
        'bachelor' => '學士班',
        'master' => '碩士班',
        'ai_inservice' => 'AI 在職專班',
        'dual' => '雙聯學制',
    ];

    /**
     * 關聯公告類型。
     *
     * @var array<string, string>
     */
    public const POST_TYPE_LABELS = [
        'curriculum' => '課程資訊',
        'regulation' => '修業規定',
        'course_map' => '課程地圖',
        'other' => '其他',
    ];

    /**
     * 可批次指定的欄位。
     *
     * @var list<string>
     */
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

    /**
     * 欄位轉型設定。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'visible' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * 學程關聯的公告。
     */
    public function posts(): BelongsToMany
    {
        $pivot = self::pivotTableName();

        return $this->belongsToMany(Post::class, $pivot)
            ->withPivot(['post_type', 'sort_order'])
            ->orderBy($pivot . '.sort_order');
    }

    /**
     * 取得課程資訊公告。
     */
    public function getCurriculumPosts(): Collection
    {
        return $this->posts()->wherePivot('post_type', 'curriculum')->get();
    }

    /**
     * 取得修業規定公告。
     */
    public function getRegulationPosts(): Collection
    {
        return $this->posts()->wherePivot('post_type', 'regulation')->get();
    }

    /**
     * 取得課程地圖公告。
     */
    public function getCourseMapPosts(): Collection
    {
        return $this->posts()->wherePivot('post_type', 'course_map')->get();
    }

    /**
     * 查詢範圍：僅顯示可見學程。
     */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('visible', true);
    }

    /**
     * 查詢範圍：依學制篩選。
     */
    public function scopeByLevel(Builder $query, string $level): Builder
    {
        return $query->where('level', $level);
    }

    /**
     * 查詢範圍：依排序設定排序。
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * 取得學制顯示名稱。
     */
    public function getLevelNameAttribute(): ?string
    {
        return self::LEVEL_LABELS[$this->level] ?? null;
    }

    /**
     * 取得學制選項。
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function getLevelOptions(): array
    {
        return collect(self::LEVEL_LABELS)
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values()
            ->all();
    }

    /**
     * 取得公告類型選項。
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function getPostTypeOptions(): array
    {
        return collect(self::POST_TYPE_LABELS)
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values()
            ->all();
    }

    /**
     * 判斷實際使用的樞紐表名稱。
     */
    protected static function pivotTableName(): string
    {
        return Schema::hasTable('program_posts') ? 'program_posts' : 'program_post';
    }
}
