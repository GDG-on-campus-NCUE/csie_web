<?php

namespace App\Models;

use App\Models\Builders\AttachmentBuilder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Attachment extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * 附件類型常數。
     */
    public const TYPE_IMAGE = 1;
    public const TYPE_DOCUMENT = 2;
    public const TYPE_LINK = 3;
    public const TYPE_VIDEO = 4;
    public const TYPE_AUDIO = 5;
    public const TYPE_ARCHIVE = 6;
    public const TYPE_FILE = 7;

    /**
     * 附件可見性常數。
     */
    public const VISIBILITY_PUBLIC = 1;
    public const VISIBILITY_PRIVATE = 2;

    /**
     * 附件類型與數值的對應表。
     *
     * @var array<string, int>
     */
    public const TYPE_MAP = [
        'image' => self::TYPE_IMAGE,
        'document' => self::TYPE_DOCUMENT,
        'link' => self::TYPE_LINK,
        'video' => self::TYPE_VIDEO,
        'audio' => self::TYPE_AUDIO,
        'archive' => self::TYPE_ARCHIVE,
        'file' => self::TYPE_FILE,
    ];

    /**
     * 附件可見性與數值的對應表。
     *
     * @var array<string, int>
     */
    public const VISIBILITY_MAP = [
        'public' => self::VISIBILITY_PUBLIC,
        'private' => self::VISIBILITY_PRIVATE,
    ];

    /**
     * 允許批次指定的欄位。
     *
     * @var list<string>
     */
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
        'space_id',
        'visibility',
        'alt_text',
        'alt_text_en',
        'description',
        'tags',
        'sort_order',
    ];

    /**
     * 自動轉型設定。
     *
     * @var array<string, string>
     */
    protected $casts = [
        'size' => 'integer',
        'sort_order' => 'integer',
        'tags' => 'array',
    ];

    /**
     * 取得或設定附件類型。
     */
    protected function type(): Attribute
    {
        return Attribute::make(
            get: fn ($value): string => array_flip(self::TYPE_MAP)[$value] ?? 'document',
            set: function ($value): int {
                if (is_int($value)) {
                    return $value;
                }

                $key = is_string($value) ? strtolower($value) : 'document';

                return self::TYPE_MAP[$key] ?? self::TYPE_MAP['document'];
            }
        );
    }

    /**
     * 取得或設定附件的可見性。
     */
    protected function visibility(): Attribute
    {
        return Attribute::make(
            get: fn ($value): string => array_flip(self::VISIBILITY_MAP)[$value] ?? 'public',
            set: function ($value): int {
                if (is_int($value)) {
                    return $value;
                }

                $key = is_string($value) ? strtolower($value) : 'public';

                return self::VISIBILITY_MAP[$key] ?? self::VISIBILITY_MAP['public'];
            }
        );
    }

    /**
     * 使用自訂查詢產生器，支援以字串指定附件類型。
     */
    public function newEloquentBuilder($query): AttachmentBuilder
    {
        return new AttachmentBuilder($query);
    }

    /**
     * 多型關聯：附件所屬的模型。
     */
    public function attachable(): MorphTo
    {
        return $this->morphTo(null, 'attached_to_type', 'attached_to_id');
    }

    /**
     * 附件上傳者。
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * 所屬 Space 關聯。
     */
    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class, 'space_id');
    }

    /**
     * 從儲存空間刪除實體檔案。
     */
    public function deleteFileFromDisk(): void
    {
        if (! $this->disk || ! $this->disk_path) {
            return;
        }

        if (Storage::disk($this->disk)->exists($this->disk_path)) {
            Storage::disk($this->disk)->delete($this->disk_path);
        }
    }

    /**
     * 判斷附件是否為私人可見。
     */
    public function isPrivate(): bool
    {
        return $this->visibility === 'private';
    }
}
