<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Schema;

class Classroom extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * 空間類型代碼：教室。
     */
    public const TYPE_CLASSROOM = 3;

    /**
     * 使用共用的空間資料表。
     *
     * @var string
     */
    protected $table = 'spaces';

    /**
     * 可批次指定的欄位。
     *
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'name_en',
        'location',
        'capacity',
        'equipment_summary',
        'description',
        'description_en',
        'sort_order',
        'visible',
        'tags',
    ];

    /**
     * 欄位轉型設定。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'capacity' => 'integer',
        'sort_order' => 'integer',
        'visible' => 'boolean',
    ];

    /**
     * 暫存待同步的標籤。
     *
     * @var array<int, string>|null
     */
    protected ?array $pendingTagNames = null;

    protected static function booted(): void
    {
        static::addGlobalScope('classroom', function (Builder $builder) {
            $builder->where('space_type', self::TYPE_CLASSROOM);
        });

        static::creating(function (Classroom $classroom) {
            $classroom->setAttribute('space_type', self::TYPE_CLASSROOM);
        });
    }

    /**
     * 服務人員。
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'space_user', 'space_id', 'user_id');
    }

    /**
     * 標籤關聯。
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'space_tag', 'space_id', 'tag_id');
    }

    /**
     * 取得標籤名稱。
     *
     * @return array<int, string>
     */
    public function getTagsAttribute(): array
    {
        if (! Schema::hasTable('tags')) {
            return [];
        }

        if ($this->relationLoaded('tags')) {
            return $this->getRelation('tags')->pluck('name')->all();
        }

        return $this->tags()->pluck('tags.name')->all();
    }

    /**
     * 攔截標籤設定。
     */
    public function setAttribute($key, $value)
    {
        if ($key === 'tags') {
            $this->pendingTagNames = $this->normalizeTags($value);

            return $this;
        }

        return parent::setAttribute($key, $value);
    }

    /**
     * 儲存後同步標籤。
     */
    public function save(array $options = [])
    {
        $saved = parent::save($options);

        if ($saved && $this->pendingTagNames !== null) {
            $this->syncTags($this->pendingTagNames);
            $this->pendingTagNames = null;
        }

        return $saved;
    }

    /**
     * 同步標籤。
     */
    public function syncTags(array $tags): void
    {
        if (! Schema::hasTable('tags')) {
            return;
        }

        $tags = collect($tags)
            ->map(fn ($value) => trim((string) $value))
            ->filter()
            ->unique()
            ->values();

        if ($tags->isEmpty()) {
            $this->tags()->sync([]);

            return;
        }

        $tagIds = $tags->map(function (string $name): ?int {
            $tag = Tag::findOrCreateForContext('classrooms', $name);

            return $tag?->id;
        })->filter()->values();

        $this->tags()->sync($tagIds->all());
    }

    /**
     * 標準化標籤資料。
     *
     * @param  mixed  $value
     * @return array<int, string>
     */
    protected function normalizeTags($value): array
    {
        if (is_string($value)) {
            $items = explode(',', $value);
        } elseif (is_array($value)) {
            $items = $value;
        } elseif ($value instanceof \Traversable) {
            $items = iterator_to_array($value);
        } else {
            return [];
        }

        return collect($items)
            ->map(fn ($item) => trim((string) $item))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }
}
