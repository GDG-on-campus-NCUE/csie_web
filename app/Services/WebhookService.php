<?php

namespace App\Services;

use App\Models\WebhookLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookService
{
    /**
     * 發送 Webhook
     */
    public function send(string $eventType, array $payload, ?string $url = null): ?WebhookLog
    {
        // 從設定取得 Webhook URL
        $webhookUrl = $url ?? config("webhooks.{$eventType}");

        if (!$webhookUrl) {
            Log::info("No webhook URL configured for event: {$eventType}");
            return null;
        }

        // 建立 Webhook 記錄
        $log = WebhookLog::create([
            'event_type' => $eventType,
            'url' => $webhookUrl,
            'method' => 'POST',
            'payload' => $payload,
            'status' => WebhookLog::STATUS_PENDING,
        ]);

        try {
            // 發送請求
            $response = Http::timeout(10)
                ->retry(3, 100)
                ->post($webhookUrl, $payload);

            if ($response->successful()) {
                $log->markSuccess($response->status(), $response->body());
            } else {
                $log->markFailed($response->status(), $response->body());
            }
        } catch (\Exception $e) {
            Log::error("Webhook failed for event {$eventType}: " . $e->getMessage());
            $log->markFailed(0, $e->getMessage());
        }

        return $log;
    }

    /**
     * 重試失敗的 Webhook
     */
    public function retry(WebhookLog $log): void
    {
        if ($log->retry_count >= 5) {
            Log::warning("Max retry attempts reached for webhook log #{$log->id}");
            return;
        }

        $log->incrementRetry();

        try {
            $response = Http::timeout(10)
                ->post($log->url, $log->payload);

            if ($response->successful()) {
                $log->markSuccess($response->status(), $response->body());
            } else {
                $log->markFailed($response->status(), $response->body());
            }
        } catch (\Exception $e) {
            Log::error("Webhook retry failed for log #{$log->id}: " . $e->getMessage());
            $log->markFailed(0, $e->getMessage());
        }
    }

    /**
     * 批次重試失敗的 Webhooks
     */
    public function retryFailed(int $maxRetries = 5): int
    {
        $logs = WebhookLog::failed()
            ->where('retry_count', '<', $maxRetries)
            ->where('created_at', '>', now()->subDays(7))
            ->get();

        foreach ($logs as $log) {
            $this->retry($log);
        }

        return $logs->count();
    }
}
