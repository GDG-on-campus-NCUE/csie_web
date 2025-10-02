<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Model as EloquentModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ManageActivity extends Model
{
    use HasFactory;

    /**
     * 可批次指定欄位。
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'action',
        'subject_type',
        'subject_id',
        'description',
        'properties',
    ];

    /**
     * 屬性轉型設定。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'properties' => AsArrayObject::class,
    ];

    /**
     * 建立者。
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 記錄後台操作活動。
     *
     * @param  array<string, mixed>  $properties
     */
    public static function log(?User $actor, string $action, ?EloquentModel $subject = null, array $properties = [], ?string $description = null): self
    {
        return static::query()->create([
            'user_id' => $actor?->getKey(),
            'action' => $action,
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject?->getKey(),
            'description' => $description ?? static::defaultDescription($action, $subject, $properties),
            'properties' => $properties,
        ]);
    }

    /**
     * 產生預設描述。
     *
     * @param  array<string, mixed>  $properties
     */
    protected static function defaultDescription(string $action, ?EloquentModel $subject, array $properties): ?string
    {
        $subjectLabel = $subject instanceof Tag
            ? $subject->name
            : ($subject?->getAttribute('name') ?? $subject?->getKey());

        return Str::of($action)
            ->replace('_', ' ')
            ->title()
            ->append($subjectLabel ? ' · '.$subjectLabel : '')
            ->value();
    }
}
