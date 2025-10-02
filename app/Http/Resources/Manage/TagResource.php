<?php

namespace App\Http\Resources\Manage;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Tag */
class TagResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'context' => $this->context,
            'context_label' => Tag::CONTEXTS[$this->context] ?? $this->context,
            'name' => $this->name,
            'name_en' => $this->name_en,
            'slug' => $this->slug,
            'description' => $this->description,
            'color' => $this->color,
            'is_active' => (bool) $this->is_active,
            'usage_count' => (int) ($this->usage_count ?? 0),
            'last_used_at' => $this->last_used_at ? $this->last_used_at instanceof \DateTimeInterface ? $this->last_used_at->toIso8601String() : (string) $this->last_used_at : null,
            'created_at' => optional($this->created_at)->toIso8601String(),
            'updated_at' => optional($this->updated_at)->toIso8601String(),
        ];
    }
}
