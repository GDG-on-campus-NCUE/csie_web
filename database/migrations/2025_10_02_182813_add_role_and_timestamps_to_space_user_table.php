<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('space_user', function (Blueprint $table) {
            $table->string('role', 50)->nullable()->after('user_id')->comment('成員角色');
            $table->string('access_level', 20)->nullable()->after('role')->comment('存取權限等級');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('space_user', function (Blueprint $table) {
            $table->dropColumn(['role', 'access_level', 'created_at', 'updated_at']);
        });
    }
};
