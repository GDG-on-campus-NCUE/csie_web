<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 將實驗室與教室資料表補上 tags 欄位，用於儲存資源標籤。
     */
    public function up(): void
    {
        Schema::table('labs', function (Blueprint $table) {
            if (! Schema::hasColumn('labs', 'tags')) {
                $table->json('tags')->nullable()->after('description_en');
            }
        });

        Schema::table('classrooms', function (Blueprint $table) {
            if (! Schema::hasColumn('classrooms', 'tags')) {
                $table->json('tags')->nullable()->after('description_en');
            }
        });
    }

    /**
     * 還原資料表結構，移除新增的 tags 欄位。
     */
    public function down(): void
    {
        Schema::table('labs', function (Blueprint $table) {
            if (Schema::hasColumn('labs', 'tags')) {
                $table->dropColumn('tags');
            }
        });

        Schema::table('classrooms', function (Blueprint $table) {
            if (Schema::hasColumn('classrooms', 'tags')) {
                $table->dropColumn('tags');
            }
        });
    }
};
