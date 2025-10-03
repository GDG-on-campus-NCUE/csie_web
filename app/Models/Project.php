<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * 使用新的研究計畫資料表。
     *
     * @var string
     */
    protected $table = 'research_projects';

    /**
     * 可批次設定的欄位。
     *
     * @var list<string>
     */
    protected $fillable = [
        'start_date',
        'end_date',
        'title',
        'title_en',
        'sponsor',
        'total_budget',
        'principal_investigator',
        'summary',
        'space_id',
    ];

    /**
     * 欄位轉型。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_budget' => 'integer',
    ];

    /**
     * 計畫所使用的標籤。
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'research_project_tag');
    }

    /**
     * 計畫關聯的 Space 資源。
     */
    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    /**
     * 計畫的附件。
     */
    public function attachments(): MorphToMany
    {
        return $this->morphToMany(Attachment::class, 'attachable');
    }

    /**
     * 取得計畫狀態。
     */
    public function getStatusAttribute(): string
    {
        if (! $this->start_date) {
            return 'planning';
        }

        $now = now();

        if ($now->lt($this->start_date)) {
            return 'upcoming';
        }

        if (! $this->end_date || $now->lte($this->end_date)) {
            return 'ongoing';
        }

        return 'completed';
    }

    /**
     * 檢查計畫是否正在進行中。
     */
    public function isOngoing(): bool
    {
        return $this->status === 'ongoing';
    }

    /**
     * 檢查計畫是否已完成。
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Scope：僅查詢進行中的計畫。
     */
    public function scopeOngoing($query)
    {
        $now = now();

        return $query->where('start_date', '<=', $now)
            ->where(function ($q) use ($now) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', $now);
            });
    }

    /**
     * Scope：僅查詢已完成的計畫。
     */
    public function scopeCompleted($query)
    {
        return $query->where('end_date', '<', now());
    }

    /**
     * Scope：僅查詢即將開始的計畫。
     */
    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>', now());
    }
}
