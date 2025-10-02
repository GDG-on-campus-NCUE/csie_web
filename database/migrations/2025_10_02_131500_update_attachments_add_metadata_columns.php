<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attachments', function (Blueprint $table) {
            // 新增 Space 與描述欄位，讓附件可以被獨立管理
            if (! Schema::hasColumn('attachments', 'space_id')) {
                $table->foreignId('space_id')
                    ->nullable()
                    ->comment('所屬 Space ID')
                    ->after('uploaded_by')
                    ->constrained('spaces')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('attachments', 'description')) {
                $table->text('description')
                    ->nullable()
                    ->comment('附件備註說明')
                    ->after('alt_text_en');
            }

            if (! Schema::hasColumn('attachments', 'tags')) {
                $table->json('tags')
                    ->nullable()
                    ->comment('附件標籤快取，儲存 slug 陣列')
                    ->after('description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('attachments', function (Blueprint $table) {
            if (Schema::hasColumn('attachments', 'tags')) {
                $table->dropColumn('tags');
            }

            if (Schema::hasColumn('attachments', 'description')) {
                $table->dropColumn('description');
            }

            if (Schema::hasColumn('attachments', 'space_id')) {
                $table->dropConstrainedForeignId('space_id');
            }
        });
    }
};
