<?php

namespace App\Http\Resources\Manage;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
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
            'title' => $this->title,
            'title_en' => $this->title_en,
            'sponsor' => $this->sponsor,
            'funding_source' => $this->sponsor, // 別名
            'principal_investigator' => $this->principal_investigator,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            'start_at' => $this->start_date?->format('Y-m-d'), // 別名
            'end_at' => $this->end_date?->format('Y-m-d'), // 別名
            'duration' => $this->formatDuration(),
            'total_budget' => $this->total_budget,
            'amount' => $this->total_budget, // 別名
            'formatted_budget' => $this->formatBudget(),
            'summary' => $this->summary,
            'status' => $this->getStatus(),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'space' => $this->when($this->relationLoaded('space'), function () {
                return [
                    'id' => $this->space->id,
                    'name' => $this->space->name,
                ];
            }),
            'space_id' => $this->space_id,
            'attachments' => AttachmentResource::collection($this->whenLoaded('attachments')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * 格式化計畫期間。
     */
    protected function formatDuration(): string
    {
        if (! $this->start_date) {
            return '—';
        }

        $start = $this->start_date->format('Y/m');

        if (! $this->end_date) {
            return "{$start} ~ 進行中";
        }

        $end = $this->end_date->format('Y/m');

        return "{$start} ~ {$end}";
    }

    /**
     * 格式化經費金額。
     */
    protected function formatBudget(): string
    {
        if (! $this->total_budget) {
            return '未公開';
        }

        return 'NT$ ' . number_format($this->total_budget);
    }

    /**
     * 取得計畫狀態。
     */
    protected function getStatus(): string
    {
        if (! $this->start_date) {
            return 'planning';
        }

        $now = now();

        if ($now->lt($this->start_date)) {
            return 'upcoming';
        }

        if (! $this->end_date || $now->lte($this->end_date)) {
            return 'ongoing';
        }

        return 'completed';
    }
}
