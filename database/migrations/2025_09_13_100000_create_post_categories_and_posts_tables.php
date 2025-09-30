<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_categories', function (Blueprint $table) {
            $table->id()->comment('主鍵');
            $table->foreignId('parent_id')
                ->nullable()
                ->comment('父層分類 ID')
                ->constrained('post_categories')
                ->nullOnDelete();
            $table->string('slug')->comment('分類代碼')->unique();
            $table->string('name')->comment('分類名稱');
            $table->string('name_en')->comment('分類英文名稱');
            $table->integer('sort_order')->default(0)->comment('排序數值');
            $table->boolean('visible')->default(true)->comment('是否顯示')->index();
            $table->timestamp('deleted_at')->nullable()->comment('軟刪除時間');
            $table->timestamp('created_at')->nullable()->comment('建立時間');
            $table->timestamp('updated_at')->nullable()->comment('最後更新時間');
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->id()->comment('主鍵');
            $table->foreignId('category_id')
                ->comment('所屬分類 ID')
                ->constrained('post_categories')
                ->cascadeOnDelete();
            $table->string('slug')->comment('文章代碼')->unique();
            $table->unsignedTinyInteger('status')
                ->default(0)
                ->comment('文章狀態：0=草稿、1=公開、2=隱藏，於服務層轉換名稱')
                ->index();
            $table->unsignedTinyInteger('source_type')
                ->default(1)
                ->comment('內容來源類型：1=手動、2=匯入、3=外部連結，於服務層轉換名稱')
                ->index();
            $table->string('source_url')
                ->nullable()
                ->comment('外部來源網址');
            $table->timestamp('publish_at')->nullable()->comment('發佈時間')->index();
            $table->timestamp('expire_at')->nullable()->comment('下架時間');
            $table->boolean('pinned')->default(false)->comment('是否置頂')->index();
            $table->string('cover_image_url')->nullable()->comment('封面圖片網址');
            $table->string('title')->comment('文章標題');
            $table->string('title_en')->comment('文章英文標題');
            $table->text('summary')->nullable()->comment('文章摘要');
            $table->text('summary_en')->nullable()->comment('文章英文摘要');
            $table->longText('content')->comment('文章內容');
            $table->longText('content_en')->comment('文章英文內容');
            $table->unsignedBigInteger('views')->default(0)->comment('瀏覽次數');
            $table->foreignId('created_by')
                ->comment('建立者使用者 ID')
                ->constrained('users');
            $table->foreignId('updated_by')
                ->comment('最後更新者使用者 ID')
                ->constrained('users');
            $table->timestamp('deleted_at')->nullable()->comment('軟刪除時間');
            $table->timestamp('created_at')->nullable()->comment('建立時間');
            $table->timestamp('updated_at')->nullable()->comment('最後更新時間');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
        Schema::dropIfExists('post_categories');
    }
};

