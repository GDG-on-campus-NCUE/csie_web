<?php

namespace App\Http\Resources\Manage;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\ContactMessage
 */
class ContactMessageResource extends JsonResource
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'locale' => $this->locale,
            'name' => $this->name,
            'email' => $this->email,
            'subject' => $this->subject,
            'message' => $this->message,
            'status' => $this->status,
            'file_url' => $this->file_url,
            'processed_at' => optional($this->processed_at)->toIso8601String(),
            'created_at' => optional($this->created_at)->toIso8601String(),
            'updated_at' => optional($this->updated_at)->toIso8601String(),
            'processor' => $this->processor ? [
                'id' => $this->processor->id,
                'name' => $this->processor->name,
            ] : null,
        ];
    }
}
