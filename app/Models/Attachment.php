<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Attachment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'attached_to_type',
        'attached_to_id',
        'type',
        'title',
        'filename',
        'disk',
        'disk_path',
        'file_url',
        'external_url',
        'mime_type',
        'size',
        'uploaded_by',
        'visibility',
        'alt_text',
        'alt_text_en',
        'sort_order',
    ];

    protected $casts = [
        'size' => 'integer',
    ];

    public function attachable(): MorphTo
    {
        return $this->morphTo('attachable', 'attached_to_type', 'attached_to_id')->withTrashed();
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by')->withTrashed();
    }

    public function isPrivate(): bool
    {
        return $this->visibility === 'private';
    }

    public function deleteFileFromDisk(): void
    {
        if ($this->disk_path && $this->disk) {
            if (Storage::disk($this->disk)->exists($this->disk_path)) {
                Storage::disk($this->disk)->delete($this->disk_path);
            }

            return;
        }

        if ($this->file_url && str_starts_with($this->file_url, '/storage/')) {
            $path = ltrim($this->file_url, '/');
            $path = preg_replace('#^storage/#', '', $path);

            if ($path && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }
}

