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
            $table->string('attached_to_type')->nullable();
            $table->unsignedBigInteger('attached_to_id')->nullable();
            $table->enum('type', ['image', 'document', 'link'])->default('document')->index();
            $table->string('title')->nullable();
            $table->string('filename')->nullable();
            $table->string('disk_path')->nullable();
            $table->string('external_url')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->enum('visibility', ['public', 'authorized', 'private'])->default('public')->index();
            $table->unsignedBigInteger('download_count')->default(0);
            $table->string('alt_text')->nullable();
            $table->string('alt_text_en')->nullable();
            $table->integer('sort_order')->default(0);
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['attached_to_type', 'attached_to_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};

