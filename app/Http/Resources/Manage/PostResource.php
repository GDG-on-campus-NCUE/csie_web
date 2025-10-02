<?php

namespace App\Http\Resources\Manage;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Post
 */
class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'title_en' => $this->title_en,
            'excerpt' => $this->excerpt ?? $this->summary,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'pinned' => (bool) $this->pinned,
            'published_at' => optional($this->published_at)->toIso8601String(),
            'updated_at' => optional($this->updated_at)->toIso8601String(),
            'created_at' => optional($this->created_at)->toIso8601String(),
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
            'attachments_count' => $this->when(isset($this->attachments_count), (int) $this->attachments_count),
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->map(fn ($tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
            ])->all()),
        ];
    }
}
