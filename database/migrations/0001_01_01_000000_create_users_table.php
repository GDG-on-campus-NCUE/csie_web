<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('locale')->nullable();
            $table->unsignedTinyInteger('status')
                ->default(1)
                ->comment('使用者狀態：1=啟用、2=停用，於服務層轉換為對應名稱');
            $table->enum('role', ['admin', 'teacher', 'user'])->default('user')->comment('使用者角色，預設為一般會員');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('last_login_at')->nullable()->comment('最近登入時間')->index();
            $table->timestamp('last_seen_at')->nullable()->comment('最近活動時間')->index();
            $table->string('password');
            $table->rememberToken();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
