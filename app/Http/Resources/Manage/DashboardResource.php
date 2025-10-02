<?php

namespace App\Http\Resources\Manage;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'metrics' => collect($this->resource['metrics'] ?? [])
                ->map(function (array $metric): array {
                    return [
                        'key' => $metric['key'] ?? null,
                        'label' => $metric['label'] ?? null,
                        'value' => isset($metric['value']) ? (float) $metric['value'] : 0.0,
                        'delta' => isset($metric['delta']) ? (float) $metric['delta'] : null,
                        'trend' => $metric['trend'] ?? 'flat',
                        'unit' => $metric['unit'] ?? null,
                        'meta' => $metric['meta'] ?? null,
                    ];
                })
                ->values()
                ->all(),
            'activities' => collect($this->resource['activities'] ?? [])
                ->map(function (array $activity): array {
                    return [
                        'id' => (string) ($activity['id'] ?? ''),
                        'type' => $activity['type'] ?? 'generic',
                        'title' => $activity['title'] ?? '',
                        'status' => $activity['status'] ?? null,
                        'timestamp' => $activity['timestamp'] ?? null,
                        'actor' => $activity['actor'] ?? null,
                        'href' => $activity['href'] ?? null,
                        'icon' => $activity['icon'] ?? null,
                        'meta' => $activity['meta'] ?? null,
                    ];
                })
                ->values()
                ->all(),
            'quickLinks' => collect($this->resource['quickLinks'] ?? [])
                ->map(function (array $link): array {
                    return [
                        'key' => $link['key'] ?? null,
                        'label' => $link['label'] ?? null,
                        'description' => $link['description'] ?? null,
                        'href' => $link['href'] ?? '#',
                        'icon' => $link['icon'] ?? null,
                        'ability' => $link['ability'] ?? null,
                    ];
                })
                ->values()
                ->all(),
            'personalTodos' => collect($this->resource['personalTodos'] ?? [])
                ->map(function (array $todo): array {
                    return [
                        'key' => $todo['key'] ?? null,
                        'label' => $todo['label'] ?? null,
                        'description' => $todo['description'] ?? null,
                        'count' => isset($todo['count']) ? (int) $todo['count'] : null,
                        'completed' => (bool) ($todo['completed'] ?? false),
                        'href' => $todo['href'] ?? null,
                    ];
                })
                ->values()
                ->all(),
            'generatedAt' => $this->resource['generatedAt'] ?? now()->toIso8601String(),
        ];
    }
}
