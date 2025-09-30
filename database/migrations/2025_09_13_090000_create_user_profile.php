<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->longText('avatar_url')->nullable();
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
