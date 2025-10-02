<?php

namespace Tests\Feature\Manage;

use App\Models\ManageActivity;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Space;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostActivityLoggingTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 建立一筆 Space 測試資料，提供關聯使用。
     */
    protected function createSpace(): Space
    {
        return Space::query()->create([
            'code' => 'CSIE-001',
            'space_type' => 1,
            'name' => '資工系公告空間',
        ]);
    }

    /**
     * 確認建立公告後會寫入活動紀錄。
     */
    public function test_store_creates_activity_log(): void
    {
        $admin = User::factory()->admin()->create();
        $category = PostCategory::factory()->create();
        $space = $this->createSpace();

        $response = $this->actingAs($admin)
            ->post(route('manage.posts.store'), [
                'title' => '公告測試標題',
                'category_id' => $category->id,
                'space_id' => $space->id,
                'content' => '<p>Hello</p>',
                'status' => 'draft',
                'visibility' => 'public',
                'tags' => ['notice'],
            ]);

        $response->assertRedirect(route('manage.posts.index'));

        $activity = ManageActivity::query()->latest('id')->first();
        $this->assertNotNull($activity, '應成功寫入活動紀錄');
        $this->assertSame('post.created', $activity->action);
        $this->assertSame(Post::class, $activity->subject_type);
        $this->assertNotNull($activity->subject_id);
        $this->assertSame($space->id, $activity->properties['space_id'] ?? null);
    }

    /**
     * 確認更新公告狀態或標籤時會寫入差異資訊。
     */
    public function test_update_logs_changes(): void
    {
        $admin = User::factory()->admin()->create();
        $space = $this->createSpace();
        $category = PostCategory::factory()->create();
        $post = Post::factory()->create([
            'status' => 'draft',
            'category_id' => $category->id,
            'space_id' => $space->id,
        ]);

        $response = $this->actingAs($admin)
            ->from(route('manage.posts.index'))
            ->patch(route('manage.posts.update', $post), [
                'title' => '更新後標題',
                'category_id' => $category->id,
                'space_id' => $space->id,
                'content' => '<p>Updated</p>',
                'status' => 'published',
                'visibility' => 'public',
                'tags' => ['notice', 'update'],
            ]);

        $response->assertRedirect(route('manage.posts.index'));

        $activity = ManageActivity::query()->latest('id')->first();
        $this->assertSame('post.updated', $activity->action);
        $this->assertTrue($activity->properties['status_changed']);
        $this->assertTrue($activity->properties['tags_changed']);
    }

    /**
     * 確認批次操作會留下活動紀錄。
     */
    public function test_bulk_operation_logs_activity(): void
    {
        $admin = User::factory()->admin()->create();
        $posts = Post::factory()->count(2)->create(['status' => 'draft']);
        $ids = $posts->pluck('id')->all();

        $response = $this->actingAs($admin)
            ->post(route('manage.posts.bulk'), [
                'action' => 'publish',
                'ids' => $ids,
            ]);

        $response->assertRedirect(route('manage.posts.index'));

        $activity = ManageActivity::query()->latest('id')->first();
        $this->assertSame('post.bulk_action', $activity->action);
        $this->assertEqualsCanonicalizing($ids, $activity->properties['post_ids']);
        $this->assertSame(count($ids), $activity->properties['affected']);
    }

    /**
     * 確認刪除與復原同樣會產生活動紀錄。
     */
    public function test_destroy_and_restore_log_activity(): void
    {
        $admin = User::factory()->admin()->create();
        $post = Post::factory()->create();

        $this->actingAs($admin)->delete(route('manage.posts.destroy', $post));
        $deleteActivity = ManageActivity::query()->latest('id')->first();
        $this->assertSame('post.deleted', $deleteActivity->action);

        $this->actingAs($admin)->patch(route('manage.posts.restore', $post->id));
        $restoreActivity = ManageActivity::query()->latest('id')->first();
        $this->assertSame('post.restored', $restoreActivity->action);
    }
}
