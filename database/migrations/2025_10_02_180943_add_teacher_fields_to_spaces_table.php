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
        Schema::table('spaces', function (Blueprint $table) {
            $table->string('field')->nullable()->after('name_en')
                ->comment('研究領域（實驗室使用）');
            $table->unsignedBigInteger('principal_investigator_id')->nullable()
                ->after('field')->comment('負責教師ID（實驗室使用）');

            $table->foreign('principal_investigator_id')
                ->references('id')->on('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spaces', function (Blueprint $table) {
            $table->dropForeign(['principal_investigator_id']);
            $table->dropColumn(['field', 'principal_investigator_id']);
        });
    }
};
