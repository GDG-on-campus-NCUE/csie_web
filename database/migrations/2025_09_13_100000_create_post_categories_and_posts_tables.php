<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('post_categories')->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('name_en');
            $table->integer('sort_order')->default(0);
            $table->boolean('visible')->default(true)->index();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('post_categories')->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('status', 32)->default('draft')->index();
            $table->enum('source_type', ['manual', 'import', 'link'])
                ->default('manual')
                ->index();
            $table->string('source_url')
                ->nullable();
            $table->timestamp('publish_at')->nullable()->index();
            $table->timestamp('expire_at')->nullable();
            $table->boolean('pinned')->default(false)->index();
            $table->string('cover_image_url')->nullable();
            $table->string('title');
            $table->string('title_en');
            $table->text('summary')->nullable();
            $table->text('summary_en')->nullable();
            $table->json('tags')->nullable();
            $table->longText('content');
            $table->longText('content_en');
            $table->unsignedBigInteger('views')->default(0);
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->constrained('users');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
        Schema::dropIfExists('post_categories');
    }
};

