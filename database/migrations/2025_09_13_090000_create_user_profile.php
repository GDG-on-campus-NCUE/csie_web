<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id()->comment('主鍵');
            $table->foreignId('user_id')
                ->unique()
                ->comment('對應的使用者 ID')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->longText('avatar_url')->nullable()->comment('大頭照網址');
            $table->longText('bio')->nullable()->comment('個人簡介');
            $table->json('experience')->nullable()->comment('經歷資訊 JSON');
            $table->json('education')->nullable()->comment('學歷資訊 JSON');
            $table->timestamp('created_at')->nullable()->comment('建立時間');
            $table->timestamp('updated_at')->nullable()->comment('最後更新時間');
        });

        // 使用者外部連結：可儲存多種不同連結
        Schema::create('user_profile_links', function (Blueprint $table) {
            $table->id()->comment('主鍵');
            $table->foreignId('user_profile_id')
                ->comment('所屬使用者個人檔案 ID')
                ->constrained('user_profiles')
                ->cascadeOnDelete();
            $table->string('type', 50)->default('other')->comment('連結類型');
            $table->string('label')->nullable()->comment('連結顯示文字');
            $table->string('url')->comment('連結網址');
            $table->unsignedInteger('sort_order')->default(0)->comment('排序數值');
            $table->timestamp('created_at')->nullable()->comment('建立時間');
            $table->timestamp('updated_at')->nullable()->comment('最後更新時間');
        });


    }

    public function down(): void
    {
        Schema::dropIfExists('user_profile_links');
        Schema::dropIfExists('user_profiles');
    }
};
