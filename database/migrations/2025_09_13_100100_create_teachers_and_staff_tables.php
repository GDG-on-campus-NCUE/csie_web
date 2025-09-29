<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('office')->nullable();
            $table->string('job_title')->nullable();
            $table->string('photo_url')->nullable();
            $table->string('name');
            $table->string('name_en');
            $table->string('title');
            $table->string('title_en');
            $table->longText('bio')->nullable();
            $table->longText('bio_en')->nullable();
            $table->enum('employment_status', ['active', 'inactive', 'retired', 'left'])->default('active')->index();
            $table->timestamp('employment_started_at')->nullable();
            $table->timestamp('employment_ended_at')->nullable();
            $table->text('expertise')->nullable();
            $table->text('expertise_en')->nullable();
            $table->text('education')->nullable();
            $table->text('education_en')->nullable();
            $table->integer('sort_order')->default(0)->index();
            $table->boolean('visible')->default(true)->index();
            $table->softDeletes();
            $table->timestamps();

            $table->unique('user_id');
        });

        Schema::create('teacher_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->enum('type', ['website','scholar','github','linkedin','other']);
            $table->string('label')->nullable();
            $table->string('url');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('photo_url')->nullable();
            $table->string('name');
            $table->string('name_en');
            $table->string('position');
            $table->string('position_en');
            $table->longText('bio')->nullable();
            $table->longText('bio_en')->nullable();
            $table->enum('employment_status', ['active', 'inactive', 'retired', 'left'])->default('active')->index();
            $table->timestamp('employment_started_at')->nullable();
            $table->timestamp('employment_ended_at')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('visible')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
        Schema::dropIfExists('teacher_links');
        Schema::dropIfExists('teachers');
    }
};

