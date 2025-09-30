<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Publication extends Model
{
    use HasFactory;

    /**
     * 期刊類型對應表。
     *
     * @var array<string, int>
     */
    public const TYPE_MAP = [
        'journal' => 1,
        'conference' => 2,
    ];

    /**
     * 使用新的論文資料表。
     *
     * @var string
     */
    protected $table = 'papers';

    /**
     * 可批次指定的欄位。
     *
     * @var list<string>
     */
    protected $fillable = [
        'type',
        'published_date',
        'title',
        'venue_name',
        'authors',
        'summary',
        'doi',
        'location',
    ];

    /**
     * 欄位轉型設定。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'published_date' => 'date',
    ];

    /**
     * 類型屬性轉換。
     */
    protected function type(): Attribute
    {
        return Attribute::make(
            get: fn ($value): string => array_flip(self::TYPE_MAP)[$value] ?? 'journal',
            set: function ($value) {
                if (is_int($value)) {
                    return $value;
                }

                $key = is_string($value) ? strtolower($value) : 'journal';

                return self::TYPE_MAP[$key] ?? self::TYPE_MAP['journal'];
            }
        );
    }

    /**
     * 論文所屬的標籤。
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'paper_tag');
    }
}
