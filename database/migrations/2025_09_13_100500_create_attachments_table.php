<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id()->comment('主鍵');
            $table->string('attached_to_type')->comment('多型關聯模型類型');
            $table->unsignedBigInteger('attached_to_id')->comment('多型關聯模型主鍵');
            $table->unsignedTinyInteger('type')
                ->comment('附件類型：1=圖片、2=文件、3=連結，於服務層轉換名稱')
                ->index();
            $table->string('title')->nullable()->comment('附件標題');
            $table->string('filename')->nullable()->comment('原始檔名');
            $table->string('disk')->default('public')->comment('儲存磁碟名稱');
            $table->string('disk_path')->nullable()->comment('儲存路徑');
            $table->string('file_url')->nullable()->comment('檔案存取網址');
            $table->string('external_url')->nullable()->comment('外部連結網址');
            $table->string('mime_type')->nullable()->comment('檔案 MIME 類型');
            $table->unsignedBigInteger('size')->nullable()->comment('檔案大小位元組');
            $table->foreignId('uploaded_by')
                ->nullable()
                ->comment('上傳者使用者 ID')
                ->constrained('users')
                ->nullOnDelete();
            $table->unsignedTinyInteger('visibility')
                ->default(1)
                ->comment('可見性：1=公開、2=私人，於服務層轉換名稱');
            $table->string('alt_text')->nullable()->comment('替代文字');
            $table->string('alt_text_en')->nullable()->comment('替代文字英文版');
            $table->integer('sort_order')->default(0)->comment('排序數值');
            $table->timestamp('deleted_at')->nullable()->comment('軟刪除時間');
            $table->timestamp('created_at')->nullable()->comment('建立時間');
            $table->timestamp('updated_at')->nullable()->comment('最後更新時間');

            $table->index(['attached_to_type', 'attached_to_id']);
            $table->index(['uploaded_by']);
            $table->index(['visibility']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};

