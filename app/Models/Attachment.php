<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Attachment extends Model
{
    use HasFactory, SoftDeletes;

    public const VISIBILITY_PUBLIC = 'public';
    public const VISIBILITY_AUTHORIZED = 'authorized';
    public const VISIBILITY_PRIVATE = 'private';

    protected $fillable = [
        'attached_to_type',
        'attached_to_id',
        'type',
        'title',
        'filename',
        'disk_path',
        'external_url',
        'mime_type',
        'size',
        'visibility',
        'alt_text',
        'alt_text_en',
        'sort_order',
        'uploaded_by',
    ];

    protected $casts = [
        'size' => 'integer',
        'sort_order' => 'integer',
    ];

    public function attachedTo(): MorphTo
    {
        return $this->morphTo(__FUNCTION__, 'attached_to_type', 'attached_to_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by')->withTrashed();
    }
}

