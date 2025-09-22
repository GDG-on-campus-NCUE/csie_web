<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
            $table->string('attached_to_type');
            $table->unsignedBigInteger('attached_to_id');
            $table->enum('type', ['image', 'document', 'link'])->index();
            $table->string('title')->nullable();
            $table->string('filename')->nullable();
            $table->string('disk')->default('public');
            $table->string('disk_path')->nullable();
            $table->string('file_url')->nullable();
            $table->string('external_url')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('visibility', ['public', 'private'])->default('public');
            $table->string('alt_text')->nullable();
            $table->string('alt_text_en')->nullable();
            $table->integer('sort_order')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['attached_to_type', 'attached_to_id']);
            $table->index(['uploaded_by']);
            $table->index(['visibility']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};

