<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 學程表 - 簡化設計，主要用於分類和關聯公告
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable()->comment('學程代碼');
            $table->enum('level', ['bachelor', 'master', 'ai_inservice', 'dual'])
                  ->comment('學制類別：學士班、碩士班、AI在職專班、雙聯學制');
            $table->string('name')->comment('學程名稱（中文）');
            $table->string('name_en')->comment('學程名稱（英文）');
            $table->text('description')->nullable()->comment('學程簡介（中文）');
            $table->text('description_en')->nullable()->comment('學程簡介（英文）');
            $table->string('website_url')->nullable()->comment('官方網站連結');
            $table->boolean('visible')->default(true)->comment('是否顯示');
            $table->integer('sort_order')->default(0)->comment('排序');
            $table->softDeletes();
            $table->timestamps();
            
            $table->index(['level', 'visible', 'sort_order']);
        });

        // 學程與公告關聯表 - 一個學程可以關聯多個公告（如修業規定、課程地圖等）
        Schema::create('program_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
            $table->foreignId('post_id')->constrained('posts')->cascadeOnDelete();
            $table->enum('post_type', ['curriculum', 'regulation', 'course_map', 'other'])
                  ->default('other')
                  ->comment('公告類型：課程資訊、修業規定、課程地圖、其他');
            $table->integer('sort_order')->default(0)->comment('在該學程中的排序');
            $table->timestamps();
            
            $table->unique(['program_id', 'post_id']);
            $table->index(['program_id', 'post_type', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_posts');
        Schema::dropIfExists('programs');
    }
};

