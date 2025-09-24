<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            // Intentionally left blank, we use raw SQL to avoid Doctrine dependency.
        });

        DB::statement("ALTER TABLE posts MODIFY COLUMN source_type ENUM('manual', 'import', 'link') DEFAULT 'manual'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            // Intentionally left blank, we use raw SQL to avoid Doctrine dependency.
        });

        DB::table('posts')
            ->where('source_type', 'import')
            ->update(['source_type' => 'manual']);

        DB::statement("ALTER TABLE posts MODIFY COLUMN source_type ENUM('manual', 'link') DEFAULT 'manual'");
    }
};
