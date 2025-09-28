<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classrooms', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable()->unique();
            $table->string('name');
            $table->string('name_en')->nullable();
            $table->string('location')->nullable();
            $table->integer('capacity')->nullable();
            $table->string('equipment_summary')->nullable();
            $table->longText('description')->nullable();
            $table->longText('description_en')->nullable();
            $table->json('tags')->nullable();
            $table->integer('sort_order')->default(0)->index();
            $table->boolean('visible')->default(true)->index();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('classroom_staff', function (Blueprint $table) {
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->unique(['classroom_id', 'staff_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classroom_staff');
        Schema::dropIfExists('classrooms');
    }
};
