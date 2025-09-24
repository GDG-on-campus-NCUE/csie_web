<?php

namespace Tests\Feature\Manage;

use App\Models\Attachment;
use App\Models\Post;
use App\Models\PostCategory;
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
                'publish_at' => null,
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
        $this->assertNull($post->publish_at);
        $this->assertEquals(['系務', '公告'], $post->tags);
        $this->assertStringNotContainsString('<script>', $post->content);
        $this->assertNotEmpty($post->slug);
        $this->assertEquals(2, $post->attachments()->count());

        $fileAttachment = $post->attachments()->where('type', 'document')->first();
        $this->assertNotNull($fileAttachment);
        $this->assertEquals('public', $fileAttachment->disk);
        $this->assertNotNull($fileAttachment->disk_path);
        $this->assertTrue(Storage::disk('public')->exists($fileAttachment->disk_path));
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
                'publish_at' => $future->toDateTimeString(),
            ]);

        $response->assertRedirect(route('manage.posts.index'));

        $post = Post::where('title', '排程公告')->first();
        $this->assertNotNull($post);
        $this->assertSame('scheduled', $post->status);
        $this->assertSame($future->toDateTimeString(), $post->publish_at->toDateTimeString());
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
                'publish_at' => null,
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
            $this->assertNotNull($post->publish_at);
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
            $this->assertNull($post->publish_at);
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
                'publish_at' => null,
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
}
