<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id()->comment('主鍵');
            $table->string('locale')->nullable()->comment('表單語系');
            $table->string('name')->comment('聯絡人姓名');
            $table->string('email')->comment('聯絡人信箱');
            $table->string('subject')->nullable()->comment('主旨');
            $table->longText('message')->comment('訊息內容');
            $table->string('file_url')->nullable()->comment('附件連結');
            $table->unsignedTinyInteger('status')
                ->default(1)
                ->comment('處理狀態：1=新進、2=處理中、3=已結案、4=垃圾訊息，於服務層轉換名稱')
                ->index();
            $table->foreignId('processed_by')
                ->nullable()
                ->comment('處理人員使用者 ID')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('processed_at')->nullable()->comment('處理時間');
            $table->timestamp('created_at')->nullable()->comment('建立時間');
            $table->timestamp('updated_at')->nullable()->comment('最後更新時間');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
    }
};

