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
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('notification_type'); // post_published, space_sync_failed, permission_changed, etc.
            $table->json('channels'); // ['email', 'app', 'line']
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'notification_type']);
            $table->index('user_id');
        });

        // 擴充現有的 notifications 表（Laravel 預設）
        if (Schema::hasTable('notifications')) {
            Schema::table('notifications', function (Blueprint $table) {
                if (!Schema::hasColumn('notifications', 'priority')) {
                    $table->string('priority')->default('normal')->after('type'); // low, normal, high, urgent
                }
                if (!Schema::hasColumn('notifications', 'action_url')) {
                    $table->string('action_url')->nullable()->after('data');
                }
                if (!Schema::hasColumn('notifications', 'expires_at')) {
                    $table->timestamp('expires_at')->nullable()->after('read_at');
                }
            });
        } else {
            // 如果沒有 notifications 表，建立它
            Schema::create('notifications', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('type');
                $table->morphs('notifiable');
                $table->string('priority')->default('normal');
                $table->text('data');
                $table->string('action_url')->nullable();
                $table->timestamp('read_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
        }

        Schema::create('webhook_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event_type'); // post.published, space.sync_failed, etc.
            $table->string('url');
            $table->string('method')->default('POST');
            $table->json('payload');
            $table->integer('response_code')->nullable();
            $table->text('response_body')->nullable();
            $table->string('status'); // pending, success, failed
            $table->integer('retry_count')->default(0);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index('event_type');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('webhook_logs');

        if (Schema::hasTable('notifications')) {
            Schema::table('notifications', function (Blueprint $table) {
                if (Schema::hasColumn('notifications', 'priority')) {
                    $table->dropColumn('priority');
                }
                if (Schema::hasColumn('notifications', 'action_url')) {
                    $table->dropColumn('action_url');
                }
                if (Schema::hasColumn('notifications', 'expires_at')) {
                    $table->dropColumn('expires_at');
                }
            });
        }

        Schema::dropIfExists('notification_preferences');
    }
};
