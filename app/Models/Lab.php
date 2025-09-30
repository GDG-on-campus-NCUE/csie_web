<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Schema;

class Lab extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * 空間類型代碼：實驗室。
     */
    public const TYPE_LAB = 2;

    /**
     * 允許批次指定的欄位。
     *
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'name_en',
        'location',
        'capacity',
        'website_url',
        'contact_email',
        'contact_phone',
        'email',
        'phone',
        'tags',
        'cover_image_url',
        'equipment_summary',
        'description',
        'description_en',
        'sort_order',
        'visible',
    ];

    /**
     * 欄位轉型設定。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'capacity' => 'integer',
        'visible' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * 暫存待同步的標籤。
     *
     * @var array<int, string>|null
     */
    protected ?array $pendingTagNames = null;

    /**
     * 使用共用的空間資料表。
     *
     * @var string
     */
    protected $table = 'spaces';

    protected static function booted(): void
    {
        static::addGlobalScope('lab', function (Builder $builder) {
            $builder->where('space_type', self::TYPE_LAB);
        });

        static::creating(function (Lab $lab) {
            $lab->setAttribute('space_type', self::TYPE_LAB);
        });
    }

    /**
     * 教師成員。
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'space_user', 'space_id', 'user_id');
    }

    /**
     * 電子郵件欄位映射。
     */
    protected function email(): Attribute
    {
        return Attribute::make(
            get: fn ($value, array $attributes) => $attributes['contact_email'] ?? null,
            set: fn ($value) => ['contact_email' => $value],
        );
    }

    /**
     * 聯絡電話欄位映射。
     */
    protected function phone(): Attribute
    {
        return Attribute::make(
            get: fn ($value, array $attributes) => $attributes['contact_phone'] ?? null,
            set: fn ($value) => ['contact_phone' => $value],
        );
    }

    /**
     * 標籤關聯。
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'space_tag', 'space_id', 'tag_id');
    }

    /**
     * 取得標籤名稱陣列。
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

        if ($key === 'email') {
            return parent::setAttribute('contact_email', $value);
        }

        if ($key === 'phone') {
            return parent::setAttribute('contact_phone', $value);
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
     * 同步實驗室標籤。
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
            $tag = Tag::findOrCreateForContext('labs', $name);

            return $tag?->id;
        })->filter()->values();

        $this->tags()->sync($tagIds->all());
    }

    /**
     * 標準化標籤陣列。
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
