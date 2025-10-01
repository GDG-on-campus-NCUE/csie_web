<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programs', function (Blueprint $table) {
            $table->id()->comment('主鍵');
            $table->string('slug')->unique()->comment('學制代碼，作為網址或查詢識別用');
            $table->string('name')->comment('學制名稱');
            $table->string('name_en')->nullable()->comment('學制英文名稱');
            $table->string('degree_level')->nullable()->comment('學位層級說明，如學士班、碩士班');
            $table->text('summary')->nullable()->comment('學制簡介或特色說明');
            $table->json('metadata')->nullable()->comment('學制額外設定 JSON，彈性存放顯示需求');
            $table->integer('sort_order')->default(0)->comment('排序數值，數字越小排序越前');
            $table->boolean('visible')->default(true)->comment('是否顯示於前台，預設顯示');
            $table->timestamp('created_at')->nullable()->comment('建立時間');
            $table->timestamp('updated_at')->nullable()->comment('最後更新時間');
        });

        Schema::create('program_post', function (Blueprint $table) {
            $table->unsignedBigInteger('program_id')->comment('學制 ID');
            $table->unsignedBigInteger('post_id')->comment('文章 ID');
            $table->string('relation_type')->nullable()->comment('學制與文章的關聯類型備註，例如課程地圖或畢業條件');
            $table->integer('sort_order')->default(0)->comment('排序數值，控制文章在學制內的顯示順序');

            $table->primary(['program_id', 'post_id'], 'program_post_primary');
            $table->foreign('program_id')->references('id')->on('programs')->cascadeOnDelete();
            $table->foreign('post_id')->references('id')->on('posts')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_post');
        Schema::dropIfExists('programs');
    }
};
