<?php

use App\Models\Attachment;
use Illuminate\Support\Facades\Artisan;

Artisan::command('attachments:clean-orphans', function () {
    $total = 0;

    Attachment::query()
        ->whereDoesntHave('attachable')
        ->chunkById(100, function ($attachments) use (&$total) {
            foreach ($attachments as $attachment) {
                $this->line("清理附件 #{$attachment->id}");
                $attachment->deleteFileFromDisk();
                $attachment->delete();
                $total++;
            }
        });

    $this->info("已清理 {$total} 個附件。");
})->describe('清理遺失關聯的附件並移除檔案。');
