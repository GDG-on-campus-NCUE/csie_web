<?php

use App\Models\Attachment;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Utility: list current DB tables and row counts
Artisan::command('db:counts', function () {
    try {
        $conn = DB::connection();
        $tables = collect($conn->select('SHOW TABLES'));
        if ($tables->isEmpty()) { $this->warn('No tables'); return 0; }
        $first = (array) $tables->first();
        $key = array_key_first($first);
        $rows = [];
        foreach ($tables as $t) {
            $name = $t->$key;
            try { $count = (int)($conn->table($name)->count()); }
            catch (\Throwable $e) { $count = -1; }
            $rows[] = [$name, $count];
        }
        usort($rows, fn($a,$b) => strcmp($a[0], $b[0]));
        $this->table(['TABLE_NAME','TABLE_ROWS'], $rows);
    } catch (\Throwable $e) {
        $this->error('Error: '.$e->getMessage());
        return 1;
    }
})->purpose('List current DB tables and row counts');

Artisan::command('attachments:clean-orphans {--force-delete : Permanently delete the records instead of moving to recycle bin}', function () {
    $force = (bool) $this->option('force-delete');
    $removed = 0;

    Attachment::withTrashed()
        ->with(['attachable'])
        ->chunkById(100, function ($attachments) use (&$removed, $force) {
            foreach ($attachments as $attachment) {
                try {
                    if ($attachment->attachable !== null) {
                        continue;
                    }
                } catch (\Throwable $e) {
                    // Treat any resolution error as orphaned
                }

                if ($force || $attachment->trashed()) {
                    $attachment->deleteFileFromDisk();
                    $attachment->forceDelete();
                } else {
                    $attachment->deleteFileFromDisk();
                    $attachment->delete();
                }

                $removed++;
            }
        });

    $this->info("Cleaned {$removed} orphaned attachments.");

    return 0;
})->purpose('Clean attachments without an associated parent record');

