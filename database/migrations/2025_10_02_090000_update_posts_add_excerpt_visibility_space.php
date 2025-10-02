<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            if (Schema::hasColumn('posts', 'publish_at') && ! Schema::hasColumn('posts', 'published_at')) {
                $table->timestamp('published_at')
                    ->nullable()
                    ->comment('發佈時間')
                    ->after('publish_at')
                    ->index();
            }

            if (! Schema::hasColumn('posts', 'space_id')) {
                $table->foreignId('space_id')
                    ->nullable()
                    ->after('category_id')
                    ->comment('綁定的 Space ID')
                    ->constrained('spaces')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('posts', 'visibility')) {
                $table->unsignedTinyInteger('visibility')
                    ->default(1)
                    ->comment('可見性：1=公開、2=內部、3=私人')
                    ->after('status')
                    ->index();
            }

            if (! Schema::hasColumn('posts', 'excerpt')) {
                $table->text('excerpt')
                    ->nullable()
                    ->comment('公告摘要')
                    ->after('title_en');
            }

            if (! Schema::hasColumn('posts', 'excerpt_en')) {
                $table->text('excerpt_en')
                    ->nullable()
                    ->comment('公告英文摘要')
                    ->after('excerpt');
            }
        });

        if (Schema::hasColumn('posts', 'publish_at') && Schema::hasColumn('posts', 'published_at')) {
            DB::statement('UPDATE posts SET published_at = publish_at WHERE published_at IS NULL AND publish_at IS NOT NULL');

            Schema::table('posts', function (Blueprint $table) {
                $table->dropColumn('publish_at');
            });
        }
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            if (! Schema::hasColumn('posts', 'publish_at')) {
                $table->timestamp('publish_at')
                    ->nullable()
                    ->comment('發佈時間')
                    ->after('published_at')
                    ->index();
            }

            if (Schema::hasColumn('posts', 'excerpt_en')) {
                $table->dropColumn('excerpt_en');
            }

            if (Schema::hasColumn('posts', 'excerpt')) {
                $table->dropColumn('excerpt');
            }

            if (Schema::hasColumn('posts', 'visibility')) {
                $table->dropColumn('visibility');
            }

            if (Schema::hasColumn('posts', 'space_id')) {
                $table->dropConstrainedForeignId('space_id');
            }
        });

        if (Schema::hasColumn('posts', 'publish_at') && Schema::hasColumn('posts', 'published_at')) {
            DB::statement('UPDATE posts SET publish_at = published_at WHERE publish_at IS NULL AND published_at IS NOT NULL');

            Schema::table('posts', function (Blueprint $table) {
                $table->dropColumn('published_at');
            });
        }
    }
};
