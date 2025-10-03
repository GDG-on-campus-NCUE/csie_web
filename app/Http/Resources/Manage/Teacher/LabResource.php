<?php

namespace App\Http\Resources\Manage\Teacher;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LabResource extends JsonResource
{
    /**
     * 將資源轉換為陣列。
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'name_en' => $this->name_en,
            'field' => $this->field,
            'code' => $this->code,
            'location' => $this->location,
            'capacity' => $this->capacity,
            'description' => $this->description,
            'description_en' => $this->description_en,
            'equipment_summary' => $this->equipment_summary,
            'website_url' => $this->website_url,
            'contact_email' => $this->contact_email,
            'contact_phone' => $this->contact_phone,
            'cover_image_url' => $this->cover_image_url,
            'visible' => $this->visible,
            'sort_order' => $this->sort_order,

            // 關聯資料
            'principal_investigator' => $this->whenLoaded('principalInvestigator', function () {
                return [
                    'id' => $this->principalInvestigator->id,
                    'name' => $this->principalInvestigator->name,
                    'email' => $this->principalInvestigator->email,
                    'role' => $this->principalInvestigator->role,
                ];
            }),
            'principal_investigator_id' => $this->principal_investigator_id,

            'members' => $this->whenLoaded('members', function () {
                return $this->members->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->name,
                        'email' => $member->email,
                        'role' => $member->role,
                        'pivot_role' => $member->pivot->role ?? null,
                        'joined_at' => $member->pivot->created_at?->toISOString(),
                    ];
                });
            }),
            'members_count' => $this->when(
                isset($this->members_count),
                $this->members_count
            ),

            'tags' => $this->whenLoaded('tags', function () {
                $tags = is_array($this->tags) ? collect($this->tags) : $this->tags;
                return $tags->map(function ($tag) {
                    // 如果 tag 是字串，只返回 name
                    if (is_string($tag)) {
                        return [
                            'id' => null,
                            'name' => $tag,
                            'name_en' => null,
                        ];
                    }
                    // 如果是陣列
                    if (is_array($tag)) {
                        return [
                            'id' => $tag['id'] ?? null,
                            'name' => $tag['name'] ?? null,
                            'name_en' => $tag['name_en'] ?? null,
                        ];
                    }
                    // 如果是物件
                    return [
                        'id' => $tag->id ?? null,
                        'name' => $tag->name ?? null,
                        'name_en' => $tag->name_en ?? null,
                    ];
                });
            }),

            // 時間戳記
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}

