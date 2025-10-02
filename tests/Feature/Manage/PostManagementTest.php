<?php

namespace Tests\Feature\Manage;

use App\Models\Attachment;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Tag;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PostManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_draft_post_with_attachments(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $category = PostCategory::factory()->create();

        $response = $this
            ->actingAs($admin)
            ->post(route('manage.posts.store'), [
                'title' => '系務公告',
                'slug' => '',
                'category_id' => $category->id,
                'excerpt' => '摘要內容',
                'content' => '<p>公告內容<script>alert(1)</script></p>',
                'status' => 'draft',
                'published_at' => null,
                'tags' => '系務,公告',
                'attachments' => [
                    'files' => [
                        UploadedFile::fake()->create('政策.pdf', 100, 'application/pdf'),
                    ],
                    'links' => [
                        ['title' => '相關連結', 'url' => 'https://example.com/resource'],
                    ],
                ],
            ]);

        $response->assertRedirect(route('manage.posts.index'));

        $post = Post::first();
        $this->assertNotNull($post);
        $this->assertSame('系務公告', $post->title);
        $this->assertSame('draft', $post->status);
        $this->assertNull($post->published_at);
        $this->assertEquals(['系務', '公告'], $post->tags);
        $this->assertStringNotContainsString('<script>', $post->content);
        $this->assertNotEmpty($post->slug);
        $this->assertEquals(2, $post->attachments()->count());

        $fileAttachment = $post->attachments()->where('type', 'document')->first();
        $this->assertNotNull($fileAttachment);
        $this->assertEquals('public', $fileAttachment->disk);
        $this->assertNotNull($fileAttachment->disk_path);
        $this->assertTrue(Storage::disk('public')->exists($fileAttachment->disk_path));
    $this->assertSame($post->getMorphClass(), $fileAttachment?->attached_to_type);
    }

    public function test_attachment_upload_validation_rejects_large_file(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $category = PostCategory::factory()->create();

        $response = $this
            ->actingAs($admin)
            ->post(route('manage.posts.store'), [
                'title' => '附件驗證',
                'slug' => null,
                'category_id' => $category->id,
                'excerpt' => '超大附件測試',
                'content' => '<p>內容</p>',
                'status' => 'draft',
                'attachments' => [
                    'files' => [
                        UploadedFile::fake()->create('超大檔案.pdf', 25000, 'application/pdf'),
                    ],
                ],
            ]);

        $response->assertSessionHasErrors(['attachments.files.0']);
        $this->assertSame(0, Attachment::count());
    }

    public function test_admin_can_schedule_post(): void
    {
        $admin = User::factory()->admin()->create();
        $category = PostCategory::factory()->create();
        $future = Carbon::now()->addDays(2);

        $response = $this
            ->actingAs($admin)
            ->post(route('manage.posts.store'), [
                'title' => '排程公告',
                'slug' => 'schedule-post',
                'category_id' => $category->id,
                'excerpt' => '排程摘要',
                'content' => '<p>排程內容</p>',
                'status' => 'scheduled',
                'published_at' => $future->toDateTimeString(),
            ]);

        $response->assertRedirect(route('manage.posts.index'));

        $post = Post::where('title', '排程公告')->first();
        $this->assertNotNull($post);
        $this->assertSame('scheduled', $post->status);
        $this->assertSame($future->toDateTimeString(), $post->published_at?->toDateTimeString());
    }

    public function test_bulk_publish_and_unpublish(): void
    {
        $admin = User::factory()->admin()->create();
        $category = PostCategory::factory()->create();

        $posts = Post::factory()
            ->count(2)
            ->for($category, 'category')
            ->create([
                'status' => 'draft',
                'published_at' => null,
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
            ]);

        $publishResponse = $this
            ->actingAs($admin)
            ->post(route('manage.posts.bulk'), [
                'action' => 'publish',
                'ids' => $posts->pluck('id')->all(),
            ]);

        $publishResponse->assertRedirect(route('manage.posts.index'));

        foreach ($posts as $post) {
            $post->refresh();
            $this->assertSame('published', $post->status);
            $this->assertNotNull($post->published_at);
        }

        $unpublishResponse = $this
            ->actingAs($admin)
            ->post(route('manage.posts.bulk'), [
                'action' => 'unpublish',
                'ids' => $posts->pluck('id')->all(),
            ]);

        $unpublishResponse->assertRedirect(route('manage.posts.index'));

        foreach ($posts as $post) {
            $post->refresh();
            $this->assertSame('draft', $post->status);
            $this->assertNull($post->published_at);
        }
    }

    public function test_featured_image_is_saved(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $category = PostCategory::factory()->create();

        $response = $this
            ->actingAs($admin)
            ->post(route('manage.posts.store'), [
                'title' => '含主圖公告',
                'slug' => null,
                'category_id' => $category->id,
                'excerpt' => '摘要內容',
                'content' => '<p>主圖內容</p>',
                'status' => 'published',
                'published_at' => null,
                'featured_image' => UploadedFile::fake()->image('cover.jpg', 1200, 800),
            ]);

        $response->assertRedirect(route('manage.posts.index'));

        $post = Post::where('title', '含主圖公告')->first();
        $this->assertNotNull($post);
        $this->assertNotNull($post->cover_image_url);
        $this->assertTrue(Storage::disk('public')->exists(str_replace('/storage/', '', $post->cover_image_url)));
    }

    public function test_post_create_page_handles_missing_tag_table(): void
    {
        $admin = User::factory()->admin()->create();

        Schema::dropIfExists('tags');

        $response = $this->actingAs($admin)->get(route('manage.posts.create'));

        $response->assertOk();
        $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) =>
            $page->component('manage/posts/create')
                ->where('availableTags', [])
        );
    }

    public function test_admin_can_update_post_with_new_attachments(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $category = PostCategory::factory()->create();

        $post = Post::factory()
            ->for($category, 'category')
            ->create([
                'status' => 'draft',
                'published_at' => null,
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
                'content' => '<p>舊的內容</p>',
            ]);

        $keepPath = 'posts/attachments/' . now()->format('Y/m') . '/keep.pdf';
        $removePath = 'posts/attachments/' . now()->format('Y/m') . '/remove.pdf';
        Storage::disk('public')->put($keepPath, 'keep');
        Storage::disk('public')->put($removePath, 'remove');

        $keepAttachment = Attachment::factory()->create([
            'attached_to_type' => $post->getMorphClass(),
            'attached_to_id' => $post->id,
            'type' => 'document',
            'title' => '保留附件',
            'filename' => 'keep.pdf',
            'disk' => 'public',
            'disk_path' => $keepPath,
            'file_url' => '/storage/' . $keepPath,
            'uploaded_by' => $admin->id,
            'sort_order' => 0,
        ]);

        $removedAttachment = Attachment::factory()->create([
            'attached_to_type' => $post->getMorphClass(),
            'attached_to_id' => $post->id,
            'type' => 'document',
            'title' => '移除附件',
            'filename' => 'remove.pdf',
            'disk' => 'public',
            'disk_path' => $removePath,
            'file_url' => '/storage/' . $removePath,
            'uploaded_by' => $admin->id,
            'sort_order' => 1,
        ]);

        $future = Carbon::now()->addDay();

        $response = $this
            ->actingAs($admin)
            ->put(route('manage.posts.update', $post), [
                'title' => '更新後公告',
                'slug' => '',
                'category_id' => $category->id,
                'content' => '<p>新的內容<script>alert(1)</script></p>',
                'status' => 'published',
                'published_at' => $future->toDateTimeString(),
                'tags' => '更新,公告',
                'attachments' => [
                    'keep' => [$keepAttachment->id],
                    'files' => [UploadedFile::fake()->create('new.pdf', 180, 'application/pdf')],
                    'links' => [
                        ['title' => '最新連結', 'url' => 'https://example.com/latest'],
                    ],
                ],
            ]);

        $response->assertRedirect(route('manage.posts.index'));

        $post->refresh();
        $post->load('attachments');

        $this->assertSame('更新後公告', $post->title);
        $this->assertSame('published', $post->status);
        $this->assertSame($future->toDateTimeString(), $post->published_at?->toDateTimeString());
        $this->assertEqualsCanonicalizing(['更新', '公告'], $post->tags);
        $this->assertStringNotContainsString('<script>', $post->content);

        $this->assertTrue(Storage::disk('public')->exists($keepPath));
        $this->assertFalse(Storage::disk('public')->exists($removePath));
        $this->assertSoftDeleted('attachments', ['id' => $removedAttachment->id]);

        $this->assertEquals(3, $post->attachments->count());

        $newDocument = $post->attachments->where('id', '!=', $keepAttachment->id)->where('type', 'document')->first();
        $this->assertNotNull($newDocument);
        $this->assertTrue(Storage::disk('public')->exists($newDocument?->disk_path));
        $this->assertSame($post->getMorphClass(), $newDocument?->attached_to_type);

        $linkAttachment = $post->attachments->firstWhere('type', 'link');
        $this->assertNotNull($linkAttachment);
        $this->assertSame('https://example.com/latest', $linkAttachment?->external_url);
        $this->assertSame($post->getMorphClass(), $linkAttachment?->attached_to_type);
    }

    public function test_admin_can_soft_delete_post_and_attachments(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $category = PostCategory::factory()->create();

        $coverPath = 'posts/covers/' . now()->format('Y/m') . '/cover.jpg';
        Storage::disk('public')->put($coverPath, 'cover');

        $post = Post::factory()
            ->for($category, 'category')
            ->published()
            ->create([
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
                'cover_image_url' => '/storage/' . $coverPath,
            ]);

        $attachmentPath = 'posts/attachments/' . now()->format('Y/m') . '/remove.pdf';
        Storage::disk('public')->put($attachmentPath, 'attachment');

        $attachment = Attachment::factory()->create([
            'attached_to_type' => $post->getMorphClass(),
            'attached_to_id' => $post->id,
            'type' => 'document',
            'title' => '刪除附件',
            'filename' => 'remove.pdf',
            'disk' => 'public',
            'disk_path' => $attachmentPath,
            'file_url' => '/storage/' . $attachmentPath,
            'uploaded_by' => $admin->id,
        ]);

        $response = $this
            ->actingAs($admin)
            ->delete(route('manage.posts.destroy', $post));

        $response->assertRedirect(route('manage.posts.index'));

        $this->assertSoftDeleted('posts', ['id' => $post->id]);
        $this->assertSoftDeleted('attachments', ['id' => $attachment->id]);
        $this->assertFalse(Storage::disk('public')->exists($attachmentPath));
        $this->assertFalse(Storage::disk('public')->exists($coverPath));
    }

    public function test_admin_can_restore_soft_deleted_post(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $category = PostCategory::factory()->create();

        $coverPath = 'posts/covers/' . now()->format('Y/m') . '/restore.jpg';
        Storage::disk('public')->put($coverPath, 'cover');

        $post = Post::factory()
            ->for($category, 'category')
            ->published()
            ->create([
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
                'cover_image_url' => '/storage/' . $coverPath,
            ]);

        // 先以 REST API 刪除公告，模擬實際操作流程。
        $deleteResponse = $this
            ->actingAs($admin)
            ->delete(route('manage.posts.destroy', $post));

        $deleteResponse->assertRedirect(route('manage.posts.index'));
        $this->assertSoftDeleted('posts', ['id' => $post->id]);

        $restoreResponse = $this
            ->actingAs($admin)
            ->patch(route('manage.posts.restore', $post->id));

        $restoreResponse->assertRedirect(route('manage.posts.index'));

        $restored = Post::find($post->id);
        $this->assertNotNull($restored);
        $this->assertNull($restored?->deleted_at);
        $this->assertNull($restored?->cover_image_url);
    }

    public function test_regular_user_cannot_restore_post(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->create();
        $category = PostCategory::factory()->create();

        $post = Post::factory()
            ->for($category, 'category')
            ->create([
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
            ]);

        $this->actingAs($admin)->delete(route('manage.posts.destroy', $post));

        $response = $this
            ->actingAs($member)
            ->patch(route('manage.posts.restore', $post->id));

        $response->assertForbidden();
        $this->assertSoftDeleted('posts', ['id' => $post->id]);
    }

    public function test_teacher_cannot_access_post_index(): void
    {
        $teacher = User::factory()->teacher()->create();

        $response = $this->actingAs($teacher)->get(route('manage.posts.index'));

        $response->assertForbidden();
    }

    public function test_updating_post_syncs_tags_correctly(): void
    {
        $admin = User::factory()->admin()->create();
        $category = PostCategory::factory()->create();

        $keepTag = Tag::factory()->create([
            'context' => 'posts',
            'name' => '保留標籤',
            'slug' => 'keep-tag',
        ]);

        $removeTag = Tag::factory()->create([
            'context' => 'posts',
            'name' => '移除標籤',
            'slug' => 'remove-tag',
        ]);

        $post = Post::factory()
            ->for($category, 'category')
            ->create([
                'status' => 'draft',
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
            ]);

        $post->tags()->attach([$keepTag->id, $removeTag->id]);

        $response = $this
            ->actingAs($admin)
            ->put(route('manage.posts.update', $post), [
                'title' => '同步標籤公告',
                'slug' => '',
                'category_id' => $category->id,
                'content' => '<p>更新內容</p>',
                'status' => 'draft',
                'tags' => '保留標籤,新增標籤',
            ]);

        $response->assertRedirect(route('manage.posts.index'));

        $post->refresh();
        $post->load('tags');

        $this->assertEqualsCanonicalizing(['保留標籤', '新增標籤'], $post->tags);
        $this->assertDatabaseHas('tags', ['context' => 'posts', 'name' => '新增標籤']);
        $this->assertDatabaseMissing('post_tag', [
            'post_id' => $post->id,
            'tag_id' => $removeTag->id,
        ]);
    }
}
