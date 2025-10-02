<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id()->comment('主鍵');
            $table->string('name')->comment('姓名');
            $table->string('name_en')->nullable()->comment('英文姓名');
            $table->string('position')->nullable()->comment('職稱');
            $table->string('position_en')->nullable()->comment('英文職稱');
            $table->string('email')->unique()->comment('電子郵件');
            $table->string('phone')->nullable()->comment('連絡電話');
            $table->text('bio')->nullable()->comment('簡介');
            $table->text('bio_en')->nullable()->comment('英文簡介');
            $table->boolean('visible')->default(true)->comment('是否顯示')->index();
            $table->integer('sort_order')->default(0)->comment('排序')->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
