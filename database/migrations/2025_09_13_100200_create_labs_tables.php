<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('labs', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable()->unique();
            $table->string('website_url')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('cover_image_url')->nullable();
            $table->string('name');
            $table->string('name_en');
            $table->longText('description')->nullable();
            $table->longText('description_en')->nullable();
            $table->json('tags')->nullable();
            $table->integer('sort_order')->default(0)->index();
            $table->boolean('visible')->default(true)->index();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('lab_teachers', function (Blueprint $table) {
            $table->foreignId('lab_id')->constrained('labs')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->unique(['lab_id','teacher_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_teachers');
        Schema::dropIfExists('labs');
    }
};

