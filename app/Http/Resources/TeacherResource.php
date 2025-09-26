<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'phone' => $this->phone,
            'office' => $this->office,
            'job_title' => $this->job_title,
            'avatar_url' => $this->avatar,
            'name' => $this->name,
            'title' => $this->title,
            'bio' => $this->bio,
            'expertise' => $this->expertise,
            'education' => $this->education,
            'sort_order' => $this->sort_order,
            'visible' => $this->visible,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Conditional relationships
            $this->mergeWhen($this->relationLoaded('links'), [
                'links' => $this->whenLoaded('links'),
            ]),

            $this->mergeWhen($this->relationLoaded('publications'), [
                'publications' => $this->whenLoaded('publications'),
            ]),

            $this->mergeWhen($this->relationLoaded('projects'), [
                'projects' => $this->whenLoaded('projects'),
            ]),
        ];
    }
}
