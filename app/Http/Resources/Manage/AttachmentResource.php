<?php

namespace App\Http\Resources\Manage;

use App\Models\Post;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Route as RouteFacade;
use Illuminate\Support\Facades\Storage;

/**
 * @property-read int $id
 * @property-read string|null $title
 * @property-read string|null $filename
 * @property-read string $type
 * @property-read string|null $disk
 * @property-read string|null $disk_path
 * @property-read string|null $file_url
 * @property-read string|null $external_url
 * @property-read string|null $mime_type
 * @property-read int|null $size
 * @property-read string|null $visibility
 * @property-read string|null $attached_to_type
 * @property-read int|null $attached_to_id
 * @property-read int|null $uploaded_by
 * @property-read \App\Models\User|null $uploader
 * @property-read \Illuminate\Support\Carbon|null $created_at
 * @property-read \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Support\Carbon|null $deleted_at
 */
class AttachmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $downloadUrl = null;

        if (RouteFacade::has('public.attachments.download')) {
            $downloadUrl = route('public.attachments.download', $this->resource);
        } elseif ($this->file_url) {
            $downloadUrl = $this->file_url;
        } elseif ($this->disk && $this->disk_path) {
            try {
                $downloadUrl = Storage::disk($this->disk)->url($this->disk_path);
            } catch (\Throwable $exception) {
                $downloadUrl = null;
            }
        }

        $attachable = null;
        if ($this->relationLoaded('attachable') && $this->attachable) {
            $model = $this->attachable;

            if ($model instanceof Post) {
                $attachable = [
                    'type' => 'post',
                    'id' => $model->id,
                    'title' => $model->title,
                    'status' => $model->status,
                    'space' => $model->relationLoaded('space') && $model->space ? [
                        'id' => $model->space->id,
                        'name' => $model->space->name,
                    ] : null,
                ];
            } else {
                $attachable = [
                    'type' => class_basename($model),
                    'id' => $model->getKey(),
                ];
            }
        }

        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'filename' => $this->filename,
            'disk' => $this->disk,
            'disk_path' => $this->disk_path,
            'file_url' => $this->file_url,
            'external_url' => $this->external_url,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'visibility' => $this->visibility,
            'attached_to_type' => $this->attached_to_type,
            'attached_to_id' => $this->attached_to_id,
            'uploaded_by' => $this->uploaded_by,
            'uploader' => $this->uploader ? [
                'id' => $this->uploader->id,
                'name' => $this->uploader->name,
                'email' => $this->uploader->email,
            ] : null,
            'attachable' => $attachable,
            'created_at' => optional($this->created_at)->toIso8601String(),
            'updated_at' => optional($this->updated_at)->toIso8601String(),
            'deleted_at' => optional($this->deleted_at)->toIso8601String(),
            'uploaded_at' => optional($this->created_at)->toIso8601String(),
            'download_url' => $downloadUrl,
        ];
    }
}
