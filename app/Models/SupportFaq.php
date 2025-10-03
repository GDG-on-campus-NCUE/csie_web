<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportFaq extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'question',
        'answer',
        'status',
        'sort_order',
        'views',
        'is_helpful',
    ];

    protected $casts = [
        'is_helpful' => 'boolean',
        'views' => 'integer',
        'sort_order' => 'integer',
    ];

    // 狀態常數
    const STATUS_DRAFT = 'draft';
    const STATUS_PUBLISHED = 'published';
    const STATUS_ARCHIVED = 'archived';

    /**
     * Scope: 已發布的 FAQ
     */
    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED);
    }

    /**
     * Scope: 按排序順序
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Scope: 按分類
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * 增加瀏覽次數
     */
    public function incrementViews(): void
    {
        $this->increment('views');
    }
}
