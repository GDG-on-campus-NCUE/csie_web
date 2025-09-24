<?php

namespace App\Models;

use App\Models\Attachment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'slug',
        'status',
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
        'source_type',
        'source_url',
        'views',
        'tags',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'publish_at' => 'datetime',
            'expire_at' => 'datetime',
            'pinned' => 'boolean',
            'source_type' => 'string',
            'source_url' => 'string',
            'views' => 'integer',
            'tags' => 'array',
        ];
    }

    // 關聯
    public function category()
    {
        return $this->belongsTo(PostCategory::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by')->withTrashed();
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by')->withTrashed();
    }

    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachable', 'attached_to_type', 'attached_to_id');
    }

    public function programs(): BelongsToMany
    {
        return $this->belongsToMany(Program::class, 'post_program')->withTimestamps();
    }

    /**
     * 只取得已發布且仍在有效期間內的公告。
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', 'published')
            ->where(function (Builder $subQuery) {
                $subQuery
                    ->whereNull('publish_at')
                    ->orWhere('publish_at', '<=', now());
            })
            ->where(function (Builder $subQuery) {
                $subQuery
                    ->whereNull('expire_at')
                    ->orWhere('expire_at', '>', now());
            });
    }
}
