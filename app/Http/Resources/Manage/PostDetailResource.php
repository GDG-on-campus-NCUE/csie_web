<?php

namespace App\Http\Resources\Manage;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin \App\Models\Post
 */
class PostDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $attachments = $this->whenLoaded('attachments', function () {
            return $this->attachments->map(function ($attachment) {
                $url = $attachment->file_url;

                if (! $url && $attachment->disk && $attachment->disk_path) {
                    $url = Storage::disk($attachment->disk)->url($attachment->disk_path);
                }

                if (! $url && $attachment->external_url) {
                    $url = $attachment->external_url;
                }

                return [
                    'id' => $attachment->id,
                    'title' => $attachment->title ?: $attachment->filename,
                    'filename' => $attachment->filename,
                    'type' => $attachment->type,
                    'url' => $url,
                    'is_external' => (bool) $attachment->external_url,
                    'size' => $attachment->size,
                    'uploader' => $attachment->uploader ? [
                        'id' => $attachment->uploader->id,
                        'name' => $attachment->uploader->name,
                    ] : null,
                    'uploaded_at' => optional($attachment->created_at)->toIso8601String(),
                ];
            })->all();
        });

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'title_en' => $this->title_en,
            'summary' => $this->summary,
            'summary_en' => $this->summary_en,
            'content' => $this->content,
            'content_en' => $this->content_en,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'source_type' => $this->source_type,
            'pinned' => (bool) $this->pinned,
            'published_at' => optional($this->published_at)->toIso8601String(),
            'created_at' => optional($this->created_at)->toIso8601String(),
            'updated_at' => optional($this->updated_at)->toIso8601String(),
            'views' => (int) $this->views,
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                ];
            }),
            'space' => $this->whenLoaded('space', function () {
                return [
                    'id' => $this->space->id,
                    'name' => $this->space->name,
                ];
            }),
            'author' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ];
            }),
            'updater' => $this->whenLoaded('updater', function () {
                return [
                    'id' => $this->updater->id,
                    'name' => $this->updater->name,
                ];
            }),
            'tags' => $this->whenLoaded('tags', function () {
                return $this->tags->map(fn ($tag) => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                    'color' => $tag->color ?? null,
                    'is_active' => isset($tag->is_active) ? (bool) $tag->is_active : true,
                ])->all();
            }),
            'attachments' => $attachments,
        ];
    }
}
