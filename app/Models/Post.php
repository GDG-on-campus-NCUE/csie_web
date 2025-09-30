<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Schema;

class Post extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * 公告狀態對應表。
     *
     * @var array<string, int>
     */
    public const STATUS_MAP = [
        'draft' => 0,
        'published' => 1,
        'hidden' => 2,
        'scheduled' => 3,
    ];

    /**
     * 內容來源類型對應表。
     *
     * @var array<string, int>
     */
    public const SOURCE_TYPE_MAP = [
        'manual' => 1,
        'import' => 2,
        'external' => 3,
    ];

    /**
     * 欄位可批次填充設定。
     *
     * @var list<string>
     */
    protected $fillable = [
        'category_id',
        'slug',
        'status',
        'source_type',
        'source_url',
        'publish_at',
        'expire_at',
        'pinned',
        'cover_image_url',
        'title',
        'title_en',
        'summary',
        'summary_en',
        'content',
        'content_en',
        'views',
        'created_by',
        'updated_by',
    ];

    /**
     * 自動轉型設定。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'publish_at' => 'datetime',
        'expire_at' => 'datetime',
        'pinned' => 'boolean',
        'views' => 'integer',
    ];

    /**
     * 暫存待同步的標籤名稱。
     *
     * @var array<int, string>|null
     */
    protected ?array $pendingTagNames = null;

    /**
     * 設定公告狀態。
     */
    protected function status(): Attribute
    {
        return Attribute::make(
            get: fn ($value): string => array_flip(self::STATUS_MAP)[$value] ?? 'draft',
            set: function ($value) {
                if (is_int($value)) {
                    return $value;
                }

                $key = is_string($value) ? strtolower($value) : 'draft';

                return self::STATUS_MAP[$key] ?? self::STATUS_MAP['draft'];
            }
        );
    }

    /**
     * 設定公告來源類型。
     */
    protected function sourceType(): Attribute
    {
        return Attribute::make(
            get: fn ($value): string => array_flip(self::SOURCE_TYPE_MAP)[$value] ?? 'manual',
            set: function ($value) {
                if (is_int($value)) {
                    return $value;
                }

                $key = is_string($value) ? strtolower($value) : 'manual';

                return self::SOURCE_TYPE_MAP[$key] ?? self::SOURCE_TYPE_MAP['manual'];
            }
        );
    }

    /**
     * 多型附件關聯。
     */
    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable', 'attached_to_type', 'attached_to_id');
    }

    /**
     * 公告分類。
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(PostCategory::class, 'category_id');
    }

    /**
     * 建立者。
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * 最後更新者。
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * 公告標籤關聯。
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'post_tag');
    }

    /**
     * 學程關聯。
     */
    public function programs(): BelongsToMany
    {
        return $this->belongsToMany(Program::class, 'program_post')
            ->withPivot(['relation_type', 'sort_order']);
    }

    /**
     * 取得公告的標籤名稱陣列。
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
     * 攔截自訂屬性設定。
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
     * 儲存模型時一併同步標籤。
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
     * 查詢範圍：取得已發布的公告。
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where(function (Builder $builder) {
            $builder->where('status', self::STATUS_MAP['published'])
                ->orWhere(function (Builder $scheduled) {
                    $scheduled->where('status', self::STATUS_MAP['scheduled'])
                        ->whereNotNull('publish_at')
                        ->where('publish_at', '<=', now());
                });
        });
    }

    /**
     * 查詢範圍：依置頂與發布時間排序。
     */
    public function scopeOrderedForListing(Builder $query): Builder
    {
        return $query
            ->orderByDesc('pinned')
            ->orderByDesc('publish_at')
            ->orderByDesc('created_at');
    }

    /**
     * 同步標籤資料。
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
            $tag = Tag::findOrCreateForContext('posts', $name);

            return $tag?->id;
        })->filter()->values();

        $this->tags()->sync($tagIds->all());
    }

    /**
     * 標準化標籤輸入。
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
