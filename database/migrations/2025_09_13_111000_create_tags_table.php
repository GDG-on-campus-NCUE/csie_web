<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id()->comment('主鍵');
            $table->string('context', 100)->comment('標籤使用範疇');
            $table->string('name')->comment('標籤名稱');
            $table->string('name_en')->nullable()->comment('標籤英文名稱');
            $table->string('slug')->comment('標籤代碼');
            $table->string('description')->nullable()->comment('標籤描述');
            $table->string('color', 32)->nullable()->comment('顏色代碼 (hex or tailwind token)');
            $table->unsignedInteger('sort_order')->default(0)->comment('排序數值');
            $table->boolean('is_active')->default(true)->comment('是否啟用')->index();
            $table->timestamp('created_at')->nullable()->comment('建立時間');
            $table->timestamp('updated_at')->nullable()->comment('最後更新時間');
            $table->timestamp('last_used_at')->nullable()->comment('最後使用時間')->index();

            $table->unique(['context', 'slug']);
            $table->index('context');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tags');
    }
};
