<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('sponsor')->nullable();
            $table->decimal('budget', 15, 2)->nullable();
            $table->string('website_url')->nullable();
            $table->string('title');
            $table->string('title_en');
            $table->longText('abstract')->nullable();
            $table->longText('abstract_en')->nullable();
            $table->boolean('visible')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('project_teachers', function (Blueprint $table) {
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->unique(['project_id','teacher_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_teachers');
        Schema::dropIfExists('projects');
    }
};

