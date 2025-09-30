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
            $table->string('slug')->comment('標籤代碼');
            $table->string('description')->nullable()->comment('標籤描述');
            $table->unsignedInteger('sort_order')->default(0)->comment('排序數值');
            $table->timestamp('created_at')->nullable()->comment('建立時間');
            $table->timestamp('updated_at')->nullable()->comment('最後更新時間');

            $table->unique(['context', 'slug']);
            $table->index('context');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tags');
    }
};
