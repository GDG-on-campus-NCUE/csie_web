<?php

namespace Tests\Feature\Manage;

use App\Models\Attachment;
use App\Models\ManageActivity;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * 管理稽核日誌測試。
 * 驗證所有敏感操作都會正確記錄到 ManageActivity 表。
 */
class ManageActivityAuditTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 測試公告發佈操作會記錄稽核日誌。
     */
    public function test_post_publish_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $post = Post::factory()->create(['status' => 'draft']);

        $this->actingAs($admin)->putJson("/manage/admin/posts/{$post->id}", [
            'title' => $post->title,
            'title_en' => $post->title_en,
            'slug' => $post->slug,
            'status' => 'published',
            'published_at' => now()->toDateTimeString(),
            'category_id' => $post->category_id,
            'summary' => $post->summary,
            'content' => $post->content,
            'tags' => [],
            'attachments' => [],
        ]);

        // 驗證操作已記錄
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $admin->id,
            'action' => 'post.updated',
            'subject_type' => Post::class,
            'subject_id' => $post->id,
        ]);
    }

    /**
     * 測試標籤合併操作會記錄稽核日誌。
     */
    public function test_tag_merge_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $sourceTag = Tag::factory()->create(['name' => 'Old Tag']);
        $targetTag = Tag::factory()->create(['name' => 'New Tag']);

        $this->actingAs($admin)->postJson('/manage/admin/tags/merge', [
            'source_ids' => [$sourceTag->id],
            'target_id' => $targetTag->id,
        ]);

        // 驗證操作已記錄
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $admin->id,
            'action' => 'tag.merged',
        ]);
    }

    /**
     * 測試標籤分割操作會記錄稽核日誌。
     */
    public function test_tag_split_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $tag = Tag::factory()->create(['name' => 'Original Tag']);

        $this->actingAs($admin)->postJson('/manage/admin/tags/split', [
            'tag_id' => $tag->id,
            'new_tags' => 'Tag A, Tag B, Tag C',
            'keep_original' => false,
        ]);

        // 驗證操作已記錄
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $admin->id,
            'action' => 'tag.split',
        ]);
    }

    /**
     * 測試使用者角色變更會記錄稽核日誌。
     */
    public function test_user_role_change_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($admin)->putJson("/manage/admin/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'role' => 'teacher',
            'status' => $user->status,
            'locale' => $user->locale,
            'spaces' => [],
        ]);

        // 驗證操作已記錄，並包含角色變更資訊
        $activity = ManageActivity::where('user_id', $admin->id)
            ->where('action', 'user.updated')
            ->where('subject_id', $user->id)
            ->first();

        $this->assertNotNull($activity);
        $this->assertTrue($activity->properties['role_changed'] ?? false);
    }

    /**
     * 測試使用者狀態變更會記錄稽核日誌。
     */
    public function test_user_status_change_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['status' => 'active']);

        $this->actingAs($admin)->putJson("/manage/admin/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => 'inactive',
            'locale' => $user->locale,
            'spaces' => [],
        ]);

        // 驗證操作已記錄，並包含狀態變更資訊
        $activity = ManageActivity::where('user_id', $admin->id)
            ->where('action', 'user.updated')
            ->where('subject_id', $user->id)
            ->first();

        $this->assertNotNull($activity);
        $this->assertTrue($activity->properties['status_changed'] ?? false);
    }

    /**
     * 測試批次使用者狀態更新會記錄稽核日誌。
     */
    public function test_bulk_user_status_update_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $users = User::factory()->count(3)->create(['status' => 'active']);

        $this->actingAs($admin)->postJson('/manage/admin/users/bulk-status', [
            'user_ids' => $users->pluck('id')->toArray(),
            'status' => 'inactive',
        ]);

        // 驗證操作已記錄
        $activity = ManageActivity::where('user_id', $admin->id)
            ->where('action', 'user.bulk_status_updated')
            ->first();

        $this->assertNotNull($activity);
        $this->assertEquals(3, $activity->properties['affected'] ?? 0);
    }

    /**
     * 測試密碼重設連結發送會記錄稽核日誌。
     */
    public function test_password_reset_link_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        $this->actingAs($admin)->postJson("/manage/admin/users/{$user->id}/password-reset");

        // 驗證操作已記錄
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $admin->id,
            'action' => 'user.password_reset_link',
            'subject_type' => User::class,
            'subject_id' => $user->id,
        ]);
    }

    /**
     * 測試模擬登入會記錄稽核日誌。
     */
    public function test_impersonate_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($admin)->post("/manage/admin/users/{$user->id}/impersonate");

        // 驗證操作已記錄
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $admin->id,
            'action' => 'user.impersonated',
            'subject_type' => User::class,
            'subject_id' => $user->id,
        ]);
    }

    /**
     * 測試使用者停用會記錄稽核日誌。
     */
    public function test_user_deactivation_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['status' => 'active']);

        $this->actingAs($admin)->delete("/manage/admin/users/{$user->id}");

        // 驗證操作已記錄
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $admin->id,
            'action' => 'user.deactivated',
            'subject_type' => User::class,
            'subject_id' => $user->id,
        ]);
    }

    /**
     * 測試附件批次刪除會記錄稽核日誌。
     */
    public function test_attachment_bulk_delete_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $attachments = Attachment::factory()->count(3)->create();

        $this->actingAs($admin)->postJson('/manage/admin/attachments/bulk-delete', [
            'attachment_ids' => $attachments->pluck('id')->toArray(),
        ]);

        // 驗證操作已記錄
        $activity = ManageActivity::where('user_id', $admin->id)
            ->where('action', 'attachment.bulk_deleted')
            ->first();

        $this->assertNotNull($activity);
        $this->assertEquals(3, $activity->properties['affected'] ?? 0);
        $this->assertIsArray($activity->properties['attachment_ids'] ?? null);
    }

    /**
     * 測試公告批次操作會記錄稽核日誌。
     */
    public function test_post_bulk_operations_log_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $posts = Post::factory()->count(3)->create(['status' => 'draft']);

        $this->actingAs($admin)->postJson('/manage/admin/posts/bulk', [
            'post_ids' => $posts->pluck('id')->toArray(),
            'action' => 'publish',
        ]);

        // 驗證操作已記錄
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $admin->id,
            'action' => 'post.bulk_publish',
        ]);
    }

    /**
     * 測試稽核日誌包含必要的屬性資訊。
     */
    public function test_activity_log_contains_required_properties(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $post = Post::factory()->create(['status' => 'draft']);

        ManageActivity::log(
            $admin,
            'test.action',
            $post,
            ['test_property' => 'test_value'],
            'Test description'
        );

        $activity = ManageActivity::where('action', 'test.action')->first();

        $this->assertNotNull($activity);
        $this->assertEquals($admin->id, $activity->user_id);
        $this->assertEquals(Post::class, $activity->subject_type);
        $this->assertEquals($post->id, $activity->subject_id);
        $this->assertEquals('Test description', $activity->description);
        $this->assertEquals('test_value', $activity->properties['test_property']);
    }

    /**
     * 測試稽核日誌可以顯示在時間線元件中。
     */
    public function test_activity_logs_can_be_displayed_in_timeline(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        // 建立多筆活動紀錄
        ManageActivity::log($admin, 'test.action_1', $user);
        ManageActivity::log($admin, 'test.action_2', $user);
        ManageActivity::log($admin, 'test.action_3', $user);

        $response = $this->actingAs($admin)->getJson("/manage/admin/users/{$user->id}");

        $response->assertOk();
        $response->assertJsonPath('data.recent_activities.0.action', 'test.action_3');
        $response->assertJsonCount(3, 'data.recent_activities');
    }
}
