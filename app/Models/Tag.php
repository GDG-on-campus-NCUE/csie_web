<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class Tag extends Model
{
    use HasFactory;

    /**
     * 支援的標籤範疇。
     *
     * @var array<string, string>
     */
    public const CONTEXTS = [
        'posts' => '公告',
        'attachments' => '附件',
        'labs' => '研究實驗室',
        'classrooms' => '教室',
        'programs' => '學程',
        'projects' => '研究計畫',
    ];

    /**
     * 可批次指定的欄位。
     *
     * @var list<string>
     */
    protected $fillable = [
        'context',
        'name',
        'slug',
        'description',
        'sort_order',
    ];

    /**
     * 欄位轉型設定。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'sort_order' => 'integer',
    ];

    /**
     * 取得 slug 時統一為小寫。
     */
    protected function slug(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => is_string($value) ? strtolower($value) : $value,
            set: fn ($value) => is_string($value) ? strtolower($value) : $value,
        );
    }

    /**
     * 判斷資料表是否存在。
     */
    public static function tableExists(): bool
    {
        return Schema::hasTable((new static())->getTable());
    }

    /**
     * 依範疇篩選。
     */
    public function scopeForContext(Builder $query, string $context): Builder
    {
        return $query->where('context', $context);
    }

    /**
     * 產生唯一 slug。
     */
    public static function generateUniqueSlug(string $name, string $context, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        if ($base === '') {
            $base = Str::slug(Str::random(8));
        }

        $candidate = strtolower($base);
        $suffix = 1;

        $exists = static::query()
            ->where('context', $context)
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->where('slug', $candidate)
            ->exists();

        while ($exists) {
            $candidate = $base . '-' . $suffix;
            $suffix++;

            $exists = static::query()
                ->where('context', $context)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->where('slug', $candidate)
                ->exists();
        }

        return strtolower($candidate);
    }

    /**
     * 取得或建立特定範疇的標籤。
     */
    public static function findOrCreateForContext(string $context, string $name): ?self
    {
        if ($name === '' || ! static::tableExists()) {
            return null;
        }

        $normalized = mb_strtolower($name);

        $existing = static::query()
            ->where('context', $context)
            ->whereRaw('LOWER(name) = ?', [$normalized])
            ->first();

        if ($existing) {
            return $existing;
        }

        $slug = static::generateUniqueSlug($name, $context);

        return static::create([
            'context' => $context,
            'name' => $name,
            'slug' => $slug,
            'description' => null,
            'sort_order' => 0,
        ]);
    }
}
