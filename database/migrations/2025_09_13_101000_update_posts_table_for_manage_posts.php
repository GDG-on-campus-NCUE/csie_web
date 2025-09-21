<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $existingStatuses = DB::table('posts')->pluck('status', 'id');

        try {
            Schema::table('posts', function (Blueprint $table) {
                $table->dropIndex(['status']);
            });
        } catch (\Throwable) {
            // 忽略索引不存在的情況
        }

        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->string('status', 32)->default('draft')->after('slug')->index();
            $table->unsignedBigInteger('views')->default(0)->after('publish_at');
            $table->json('tags')->nullable()->after('summary_en');
        });

        foreach ($existingStatuses as $id => $status) {
            DB::table('posts')->where('id', $id)->update([
                'status' => $status ?? 'draft',
            ]);
        }
    }

    public function down(): void
    {
        $existingStatuses = DB::table('posts')->pluck('status', 'id');

        try {
            Schema::table('posts', function (Blueprint $table) {
                $table->dropIndex(['status']);
            });
        } catch (\Throwable) {
            // 忽略索引不存在的情況
        }

        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['views', 'tags', 'status']);
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->after('slug')->index();
        });

        foreach ($existingStatuses as $id => $status) {
            $value = in_array($status, ['draft', 'published', 'archived'], true)
                ? $status
                : 'draft';

            DB::table('posts')->where('id', $id)->update([
                'status' => $value,
            ]);
        }
    }
};
