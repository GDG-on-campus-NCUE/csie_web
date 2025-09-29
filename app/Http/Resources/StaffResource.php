<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StaffResource extends JsonResource
{
    /**
     * 將職員資料轉換為統一結構，供 Inertia 前端使用。
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $photoPath = $this->photo_url ?? null;
        $photoUrl = null;

        if ($photoPath) {
            if (Str::startsWith($photoPath, ['http://', 'https://', '/'])) {
                $photoUrl = $photoPath;
            } elseif (Storage::disk('public')->exists($photoPath)) {
                $photoUrl = Storage::disk('public')->url($photoPath);
            } else {
                $photoUrl = asset($photoPath);
            }
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'position' => $this->position,
            'email' => $this->email,
            'phone' => $this->phone,
            'office' => $this->office,
            'bio' => $this->bio,
            'avatar_url' => $photoUrl,
            'visible' => (bool) $this->visible,
            'sort_order' => $this->sort_order,
            'employment_status' => $this->employment_status,
            'employment_started_at' => $this->employment_started_at?->toDateString(),
            'employment_ended_at' => $this->employment_ended_at?->toDateString(),
            'deleted_at' => $this->deleted_at?->toDateTimeString(),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'user' => $this->whenLoaded('user', function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ];
            }),
        ];
    }
}
