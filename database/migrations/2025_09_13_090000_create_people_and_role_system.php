<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. 建立人員基底表
        Schema::create('people', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_en');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('photo_url')->nullable();
            $table->longText('bio')->nullable();
            $table->longText('bio_en')->nullable();
            $table->enum('status', ['active', 'inactive', 'retired'])->default('active');
            $table->integer('sort_order')->default(0)->index();
            $table->boolean('visible')->default(true)->index();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'visible']);
        });

        // 2. 建立角色表（如果需要的話，可以擴充角色定義）
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // admin, teacher, staff, user
            $table->string('display_name');
            $table->string('description')->nullable();
            $table->integer('priority')->default(0); // 用於角色層級判斷
            $table->timestamps();
        });

        // 3. 建立使用者角色中介表
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('person_id')->nullable()->constrained('people')->nullOnDelete();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('deactivated_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'role_id']);
            $table->index(['user_id', 'status']);
            $table->index(['person_id', 'status']);
        });

        // 4. 建立教師專屬資料表
        Schema::create('teacher_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained('people')->cascadeOnDelete();
            $table->string('office')->nullable();
            $table->string('job_title')->nullable();
            $table->string('title');
            $table->string('title_en');
            $table->text('expertise')->nullable(); // JSON 格式
            $table->text('expertise_en')->nullable(); // JSON 格式
            $table->text('education')->nullable(); // JSON 格式
            $table->text('education_en')->nullable(); // JSON 格式
            $table->timestamps();

            $table->unique('person_id');
        });

        // 5. 建立教師相關連結表
        Schema::create('teacher_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_profile_id')->constrained('teacher_profiles')->cascadeOnDelete();
            $table->enum('type', ['website','scholar','github','linkedin','other']);
            $table->string('label')->nullable();
            $table->string('url');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 6. 建立職員專屬資料表
        Schema::create('staff_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained('people')->cascadeOnDelete();
            $table->string('position');
            $table->string('position_en');
            $table->string('department')->nullable();
            $table->string('department_en')->nullable();
            $table->timestamps();

            $table->unique('person_id');
        });

        // 7. 插入基本角色資料
        DB::table('roles')->insert([
            ['name' => 'admin', 'display_name' => '管理員', 'priority' => 100, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'teacher', 'display_name' => '教師', 'priority' => 80, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'staff', 'display_name' => '職員', 'priority' => 60, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'user', 'display_name' => '一般會員', 'priority' => 20, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_profiles');
        Schema::dropIfExists('teacher_links');
        Schema::dropIfExists('teacher_profiles');
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('people');
    }
};
