<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 角色表：僅保留 admin、teacher、user 三種角色
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->string('description')->nullable();
            $table->unsignedInteger('priority')->default(0);
            $table->timestamps();
        });

        // 使用者與角色對應表：移除過去的 person 關聯，僅保留角色資訊
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('deactivated_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'role_id']);
            $table->index(['role_id', 'status']);
        });

        // 使用者個人檔案資料：包含大頭貼、學經歷等基本資訊
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('avatar_url')->nullable();
            $table->longText('bio')->nullable();
            $table->json('experience')->nullable();
            $table->json('education')->nullable();
            $table->timestamps();
        });

        // 使用者外部連結：可儲存多種不同連結
        Schema::create('user_profile_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_profile_id')->constrained('user_profiles')->cascadeOnDelete();
            $table->string('type', 50)->default('other');
            $table->string('label')->nullable();
            $table->string('url');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // 研究紀錄：教師可新增期刊、計畫等資料
        Schema::create('research_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('type', 50)->default('other');
            $table->longText('description')->nullable();
            $table->date('published_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'type']);
        });

        // 研究紀錄與標籤的對應表
        Schema::create('research_record_tag', function (Blueprint $table) {
            $table->foreignId('research_record_id')->constrained('research_records')->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained('tags')->cascadeOnDelete();
            $table->primary(['research_record_id', 'tag_id']);
        });

        // 預設角色資料
        $now = now();
        DB::table('roles')->insert([
            ['name' => 'admin', 'display_name' => '管理員', 'priority' => 100, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'teacher', 'display_name' => '教師', 'priority' => 80, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'user', 'display_name' => '一般會員', 'priority' => 20, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('research_record_tag');
        Schema::dropIfExists('research_records');
        Schema::dropIfExists('user_profile_links');
        Schema::dropIfExists('user_profiles');
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('roles');
    }
};
