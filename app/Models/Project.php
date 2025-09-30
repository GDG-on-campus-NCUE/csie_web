<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    use HasFactory;

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
        'sponsor',
        'total_budget',
        'principal_investigator',
        'summary',
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
}
