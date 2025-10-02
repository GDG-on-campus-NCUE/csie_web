<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            if (! Schema::hasColumn('tags', 'name_en')) {
                $table->string('name_en')->nullable()->after('name')->comment('標籤英文名稱');
            }

            if (! Schema::hasColumn('tags', 'color')) {
                $table->string('color', 32)->nullable()->after('description')->comment('顏色代碼 (hex or tailwind token)');
            }

            if (! Schema::hasColumn('tags', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('sort_order')->comment('是否啟用')->index();
            }

            if (! Schema::hasColumn('tags', 'last_used_at')) {
                $table->timestamp('last_used_at')->nullable()->after('updated_at')->comment('最後使用時間')->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            if (Schema::hasColumn('tags', 'last_used_at')) {
                $table->dropColumn('last_used_at');
            }

            if (Schema::hasColumn('tags', 'is_active')) {
                $table->dropColumn('is_active');
            }

            if (Schema::hasColumn('tags', 'color')) {
                $table->dropColumn('color');
            }

            if (Schema::hasColumn('tags', 'name_en')) {
                $table->dropColumn('name_en');
            }
        });
    }
};
