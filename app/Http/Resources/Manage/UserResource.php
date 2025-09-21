<?php

namespace App\Http\Resources\Manage;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * 將使用者模型轉換為陣列。
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status,
            'avatar' => $this->avatar ?? null,
            'email_verified_at' => optional($this->email_verified_at)?->toIso8601String(),
            'created_at' => optional($this->created_at)?->toIso8601String(),
            'updated_at' => optional($this->updated_at)?->toIso8601String(),
            'deleted_at' => optional($this->deleted_at)?->toIso8601String(),
        ];
    }
}
