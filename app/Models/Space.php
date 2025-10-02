<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Space extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * 允許批次指定的欄位。
     *
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'space_type',
        'name',
        'name_en',
        'location',
        'capacity',
        'website_url',
        'contact_email',
        'contact_phone',
        'cover_image_url',
        'equipment_summary',
        'description',
        'description_en',
        'sort_order',
        'visible',
    ];

    /**
     * 自動轉型設定。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'capacity' => 'integer',
        'sort_order' => 'integer',
        'visible' => 'boolean',
    ];

    /**
     * 空間的標籤。
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'space_tag');
    }

    /**
     * 空間成員。
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'space_user');
    }

    /**
     * 與空間關聯的公告。
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'space_id');
    }

}
