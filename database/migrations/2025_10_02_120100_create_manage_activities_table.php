<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('manage_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 100)->index();
            $table->string('subject_type')->nullable()->index();
            $table->unsignedBigInteger('subject_id')->nullable()->index();
            $table->json('properties')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['subject_type', 'subject_id'], 'manage_activities_subject_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('manage_activities');
    }
};
