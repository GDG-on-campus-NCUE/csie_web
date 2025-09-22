<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StaffResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name, // JSON object with localized content
            'position' => $this->position, // JSON object with localized content
            'email' => $this->email,
            'phone' => $this->phone,
            'office' => $this->office,
            'bio' => $this->bio, // JSON object with localized content
            'avatar' => $this->avatar,
            'avatar_url' => $this->avatar ? asset('storage/' . $this->avatar) : null,
            'visible' => $this->visible,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
