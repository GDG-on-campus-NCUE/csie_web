<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spaces', function (Blueprint $table) {
            $table->id()->comment('主鍵');
            $table->string('code')->comment('空間代碼')->unique();
            $table->unsignedTinyInteger('space_type')
                ->default(1)
                ->comment('空間類型：1=研究室、2=實驗室、3=教室，於服務層轉換名稱')
                ->index();
            $table->string('name')->comment('空間名稱');
            $table->string('name_en')->nullable()->comment('空間英文名稱');
            $table->string('location')->nullable()->comment('空間位置或樓層');
            $table->integer('capacity')->nullable()->comment('容納人數');
            $table->string('website_url')->nullable()->comment('官方網站網址');
            $table->string('contact_email')->nullable()->comment('聯絡信箱');
            $table->string('contact_phone')->nullable()->comment('聯絡電話');
            $table->string('cover_image_url')->nullable()->comment('封面圖片網址');
            $table->string('equipment_summary')->nullable()->comment('設備摘要');
            $table->longText('description')->nullable()->comment('空間介紹');
            $table->longText('description_en')->nullable()->comment('空間英文介紹');
            $table->integer('sort_order')->default(0)->comment('排序數值')->index();
            $table->boolean('visible')->default(true)->comment('是否顯示')->index();
            $table->timestamp('deleted_at')->nullable()->comment('軟刪除時間');
            $table->timestamp('created_at')->nullable()->comment('建立時間');
            $table->timestamp('updated_at')->nullable()->comment('最後更新時間');
        });

        Schema::create('space_user', function (Blueprint $table) {
            $table->foreignId('space_id')
                ->comment('空間 ID')
                ->constrained('spaces')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->comment('使用者 ID')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->unique(['space_id', 'user_id']);
        });

        Schema::create('space_tag', function (Blueprint $table) {
            $table->foreignId('space_id')
                ->comment('空間 ID')
                ->constrained('spaces')
                ->cascadeOnDelete();
            $table->foreignId('tag_id')
                ->comment('標籤 ID')
                ->constrained('tags')
                ->cascadeOnDelete();
            $table->unique(['space_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('space_tag');
        Schema::dropIfExists('space_user');
        Schema::dropIfExists('spaces');
    }
};
