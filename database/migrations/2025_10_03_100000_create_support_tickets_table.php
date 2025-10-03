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
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('ticket_number')->unique(); // 工單編號 ST-20251003-0001
            $table->string('subject'); // 主旨
            $table->string('category'); // 分類：技術問題、帳號問題、功能建議、其他
            $table->string('priority')->default('medium'); // 優先級：low, medium, high, urgent
            $table->text('message'); // 問題描述
            $table->string('status')->default('open'); // 狀態：open, in_progress, resolved, closed
            $table->foreignId('assigned_to')->nullable()->constrained('users'); // 指派給
            $table->timestamp('resolved_at')->nullable(); // 解決時間
            $table->timestamp('closed_at')->nullable(); // 關閉時間
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index(['category', 'priority']);
            $table->index('ticket_number');
        });

        Schema::create('support_ticket_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('support_tickets')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('message'); // 回覆內容
            $table->boolean('is_staff_reply')->default(false); // 是否為客服回覆
            $table->timestamps();

            $table->index('ticket_id');
        });

        Schema::create('support_faqs', function (Blueprint $table) {
            $table->id();
            $table->string('category'); // 分類
            $table->string('question'); // 問題
            $table->text('answer'); // 答案
            $table->string('status')->default('published'); // 狀態：draft, published, archived
            $table->integer('sort_order')->default(0); // 排序
            $table->integer('views')->default(0); // 瀏覽次數
            $table->boolean('is_helpful')->default(true); // 是否有幫助（用於統計）
            $table->timestamps();

            $table->index(['category', 'status']);
            $table->index('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('support_ticket_replies');
        Schema::dropIfExists('support_tickets');
        Schema::dropIfExists('support_faqs');
    }
};
