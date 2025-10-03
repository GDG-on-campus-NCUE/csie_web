<?php

namespace Tests\Feature\Manage\Teacher;

use App\Models\ManageActivity;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Space;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * 教師公告管理功能測試
 *
 * 測試範圍：
 * - 權限與訪問控制
 * - 搜尋與篩選
 * - CRUD 操作
 * - 驗證規則
 * - 附件處理
 * - 標籤同步
 * - 活動記錄
 * - 複製功能
 * - 快速發佈
 */
class PostManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $teacher;
    protected User $admin;
    protected User $anotherTeacher;
    protected PostCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        // 建立測試使用者
        $this->teacher = User::factory()->create(['role' => 'teacher']);
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->anotherTeacher = User::factory()->create(['role' => 'teacher']);

        // 建立測試分類
        $this->category = PostCategory::factory()->create(['name' => '課程公告']);

        // 建立測試標籤
        Tag::factory()->create(['name' => '課程', 'slug' => 'course']);
        Tag::factory()->create(['name' => '作業', 'slug' => 'homework']);

        Storage::fake('public');
    }

    /**
     * 測試：教師可以訪問公告列表頁
     *
     * @test
     */
    public function teacher_can_access_post_list(): void
    {
        $response = $this->actingAs($this->teacher)
            ->get(route('manage.teacher.posts.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('manage/teacher/posts/index')
            ->has('posts')
            ->has('filters')
            ->has('filterOptions')
            ->has('abilities')
        );
    }

    /**
     * 測試：一般使用者無法訪問教師公告管理
     *
     * @test
     */
    public function regular_user_cannot_access_teacher_posts(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)
            ->get(route('manage.teacher.posts.index'));

        $response->assertForbidden();
    }

    /**
     * 測試：教師只能看到自己建立的公告
     *
     * @test
     */
    public function teacher_only_sees_own_posts(): void
    {
        // 建立自己的公告
        Post::factory()->create([
            'title' => '我的公告',
            'created_by' => $this->teacher->id,
        ]);

        // 建立其他教師的公告
        Post::factory()->create([
            'title' => '別人的公告',
            'created_by' => $this->anotherTeacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->get(route('manage.teacher.posts.index'));

        $response->assertOk();
        $data = $response->viewData('page')['props']['posts']['data'];

        $this->assertCount(1, $data);
        $this->assertEquals('我的公告', $data[0]['title']);
    }

    /**
     * 測試：管理員可以看到所有教師的公告
     *
     * @test
     */
    public function admin_can_see_all_teacher_posts(): void
    {
        Post::factory()->create([
            'title' => '教師A的公告',
            'created_by' => $this->teacher->id,
        ]);

        Post::factory()->create([
            'title' => '教師B的公告',
            'created_by' => $this->anotherTeacher->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('manage.teacher.posts.index'));

        $response->assertOk();
        $data = $response->viewData('page')['props']['posts']['data'];

        $this->assertCount(2, $data);
    }

    /**
     * 測試：關鍵字搜尋功能
     *
     * @test
     */
    public function can_search_posts_by_keyword(): void
    {
        Post::factory()->create([
            'title' => 'AI 課程公告',
            'created_by' => $this->teacher->id,
        ]);

        Post::factory()->create([
            'title' => '資料庫系統作業',
            'created_by' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->get(route('manage.teacher.posts.index', ['keyword' => 'AI']));

        $response->assertOk();
        $data = $response->viewData('page')['props']['posts']['data'];

        $this->assertCount(1, $data);
        $this->assertStringContainsString('AI', $data[0]['title']);
    }

    /**
     * 測試：狀態篩選功能
     *
     * @test
     */
    public function can_filter_posts_by_status(): void
    {
        Post::factory()->create([
            'title' => '草稿公告',
            'status' => 'draft',
            'created_by' => $this->teacher->id,
        ]);

        Post::factory()->create([
            'title' => '已發佈公告',
            'status' => 'published',
            'published_at' => now(),
            'created_by' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->get(route('manage.teacher.posts.index', ['status' => 'draft']));

        $response->assertOk();
        $data = $response->viewData('page')['props']['posts']['data'];

        $this->assertCount(1, $data);
        $this->assertEquals('草稿公告', $data[0]['title']);
    }

    /**
     * 測試：分類篩選功能
     *
     * @test
     */
    public function can_filter_posts_by_category(): void
    {
        $category1 = PostCategory::factory()->create(['name' => '課程公告']);
        $category2 = PostCategory::factory()->create(['name' => '作業繳交']);

        Post::factory()->create([
            'title' => '課程公告',
            'category_id' => $category1->id,
            'created_by' => $this->teacher->id,
        ]);

        Post::factory()->create([
            'title' => '作業公告',
            'category_id' => $category2->id,
            'created_by' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->get(route('manage.teacher.posts.index', ['category' => $category1->id]));

        $response->assertOk();
        $data = $response->viewData('page')['props']['posts']['data'];

        $this->assertCount(1, $data);
        $this->assertEquals('課程公告', $data[0]['title']);
    }

    /**
     * 測試：標籤篩選功能
     *
     * @test
     */
    public function can_filter_posts_by_tag(): void
    {
        $courseTag = Tag::where('slug', 'course')->first();

        $post = Post::factory()->create([
            'title' => '課程相關公告',
            'created_by' => $this->teacher->id,
        ]);
        $post->tags = ['課程'];
        $post->save();

        Post::factory()->create([
            'title' => '其他公告',
            'created_by' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->get(route('manage.teacher.posts.index', ['tag' => 'course']));

        $response->assertOk();
        $data = $response->viewData('page')['props']['posts']['data'];

        $this->assertCount(1, $data);
        $this->assertEquals('課程相關公告', $data[0]['title']);
    }

    /**
     * 測試：分頁功能
     *
     * @test
     */
    public function pagination_works_correctly(): void
    {
        Post::factory()->count(15)->create([
            'created_by' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->get(route('manage.teacher.posts.index', ['per_page' => 10]));

        $response->assertOk();
        $meta = $response->viewData('page')['props']['posts']['meta'];

        $this->assertEquals(1, $meta['current_page']);
        $this->assertEquals(2, $meta['last_page']);
        $this->assertEquals(15, $meta['total']);
    }

    /**
     * 測試：教師可以訪問新增公告頁面
     *
     * @test
     */
    public function teacher_can_access_create_page(): void
    {
        $response = $this->actingAs($this->teacher)
            ->get(route('manage.teacher.posts.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('manage/teacher/posts/create')
            ->has('availableTags')
            ->has('formOptions')
        );
    }

    /**
     * 測試：教師可以建立新公告
     *
     * @test
     */
    public function teacher_can_create_post(): void
    {
        $data = [
            'title' => '新課程公告',
            'status' => 'draft',
            'category_id' => $this->category->id,
            'summary' => '這是摘要',
            'content' => '這是公告內容',
            'target_audience' => '大學部學生',
            'tags' => '課程,作業',
        ];

        $response = $this->actingAs($this->teacher)
            ->post(route('manage.teacher.posts.store'), $data);

        $response->assertRedirect(route('manage.teacher.posts.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('posts', [
            'title' => '新課程公告',
            'created_by' => $this->teacher->id,
        ]);

        // 驗證活動記錄
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $this->teacher->id,
            'action' => 'teacher.post.created',
        ]);
    }

    /**
     * 測試：建立公告時的驗證規則
     *
     * @test
     */
    public function create_post_validates_required_fields(): void
    {
        $response = $this->actingAs($this->teacher)
            ->post(route('manage.teacher.posts.store'), []);

        $response->assertSessionHasErrors(['title', 'category_id', 'content']);
    }

    /**
     * 測試：標題長度驗證
     *
     * @test
     */
    public function create_post_validates_title_length(): void
    {
        $data = [
            'title' => str_repeat('長', 256),
            'status' => 'draft',
            'category_id' => $this->category->id,
            'content' => '內容',
        ];

        $response = $this->actingAs($this->teacher)
            ->post(route('manage.teacher.posts.store'), $data);

        $response->assertSessionHasErrors(['title']);
    }

    /**
     * 測試：課程時間驗證
     *
     * @test
     */
    public function create_post_validates_course_dates(): void
    {
        $data = [
            'title' => '測試公告',
            'status' => 'draft',
            'category_id' => $this->category->id,
            'content' => '內容',
            'course_start_at' => '2024-12-31',
            'course_end_at' => '2024-01-01', // 早於開始日期
        ];

        $response = $this->actingAs($this->teacher)
            ->post(route('manage.teacher.posts.store'), $data);

        $response->assertSessionHasErrors(['course_end_at']);
    }

    /**
     * 測試：附件數量限制
     *
     * @test
     */
    public function create_post_validates_attachment_limit(): void
    {
        $files = [];
        for ($i = 0; $i < 11; $i++) {
            $files[] = UploadedFile::fake()->create("file{$i}.pdf", 100);
        }

        $data = [
            'title' => '測試公告',
            'status' => 'draft',
            'category_id' => $this->category->id,
            'content' => '內容',
            'attachments' => $files,
        ];

        $response = $this->actingAs($this->teacher)
            ->post(route('manage.teacher.posts.store'), $data);

        $response->assertSessionHasErrors(['attachments']);
    }

    /**
     * 測試：建立公告時上傳附件
     *
     * @test
     */
    public function can_create_post_with_attachments(): void
    {
        $file = UploadedFile::fake()->create('document.pdf', 100);

        $data = [
            'title' => '附件測試公告',
            'status' => 'draft',
            'category_id' => $this->category->id,
            'content' => '內容',
            'attachments' => [$file],
        ];

        $response = $this->actingAs($this->teacher)
            ->post(route('manage.teacher.posts.store'), $data);

        $response->assertRedirect(route('manage.teacher.posts.index'));

        $post = Post::where('title', '附件測試公告')->first();
        $this->assertNotNull($post);
        $this->assertCount(1, $post->attachments);

        Storage::disk('public')->assertExists($post->attachments->first()->disk_path);
    }

    /**
     * 測試：建立公告時同步標籤
     *
     * @test
     */
    public function can_create_post_with_tags(): void
    {
        $data = [
            'title' => '標籤測試',
            'status' => 'draft',
            'category_id' => $this->category->id,
            'content' => '內容',
            'tags' => '課程,作業,新標籤',
        ];

        $response = $this->actingAs($this->teacher)
            ->post(route('manage.teacher.posts.store'), $data);

        $response->assertRedirect(route('manage.teacher.posts.index'));

        $post = Post::where('title', '標籤測試')->first();
        $this->assertCount(3, $post->tags);
    }

    /**
     * 測試：教師可以查看自己的公告詳情
     *
     * @test
     */
    public function teacher_can_view_own_post(): void
    {
        $post = Post::factory()->create([
            'title' => '測試公告',
            'created_by' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->get(route('manage.teacher.posts.show', $post));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('manage/teacher/posts/show')
            ->has('post')
            ->has('abilities')
        );
    }

    /**
     * 測試：教師無法查看其他教師的公告
     *
     * @test
     */
    public function teacher_cannot_view_others_post(): void
    {
        $post = Post::factory()->create([
            'created_by' => $this->anotherTeacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->get(route('manage.teacher.posts.show', $post));

        $response->assertForbidden();
    }

    /**
     * 測試：教師可以編輯自己的公告
     *
     * @test
     */
    public function teacher_can_edit_own_post(): void
    {
        $post = Post::factory()->create([
            'created_by' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->get(route('manage.teacher.posts.edit', $post));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('manage/teacher/posts/edit')
            ->has('post')
        );
    }

    /**
     * 測試：教師可以更新自己的公告
     *
     * @test
     */
    public function teacher_can_update_own_post(): void
    {
        $post = Post::factory()->create([
            'title' => '原始標題',
            'created_by' => $this->teacher->id,
        ]);

        $data = [
            'title' => '更新後標題',
            'status' => 'draft',
            'category_id' => $this->category->id,
            'content' => '更新後內容',
        ];

        $response = $this->actingAs($this->teacher)
            ->put(route('manage.teacher.posts.update', $post), $data);

        $response->assertRedirect(route('manage.teacher.posts.index'));

        $post->refresh();
        $this->assertEquals('更新後標題', $post->title);

        // 驗證活動記錄
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $this->teacher->id,
            'action' => 'teacher.post.updated',
        ]);
    }

    /**
     * 測試：教師無法更新其他教師的公告
     *
     * @test
     */
    public function teacher_cannot_update_others_post(): void
    {
        $post = Post::factory()->create([
            'created_by' => $this->anotherTeacher->id,
        ]);

        $data = [
            'title' => '嘗試更新',
            'status' => 'draft',
            'category_id' => $this->category->id,
            'content' => '內容',
        ];

        $response = $this->actingAs($this->teacher)
            ->put(route('manage.teacher.posts.update', $post), $data);

        $response->assertForbidden();
    }

    /**
     * 測試：更新公告時保留現有附件
     *
     * @test
     */
    public function can_update_post_keeping_attachments(): void
    {
        $post = Post::factory()->create([
            'created_by' => $this->teacher->id,
        ]);

        $attachment = $post->attachments()->create([
            'type' => 'document',
            'title' => '現有附件',
            'filename' => 'existing.pdf',
            'disk' => 'public',
            'disk_path' => 'test/existing.pdf',
            'file_url' => '/storage/test/existing.pdf',
            'mime_type' => 'application/pdf',
            'size' => 1024,
            'uploaded_by' => $this->teacher->id,
        ]);

        $data = [
            'title' => '更新測試',
            'status' => 'draft',
            'category_id' => $this->category->id,
            'content' => '內容',
            'keep_attachment_ids' => [$attachment->id],
        ];

        $response = $this->actingAs($this->teacher)
            ->put(route('manage.teacher.posts.update', $post), $data);

        $response->assertRedirect(route('manage.teacher.posts.index'));

        $post->refresh();
        $this->assertCount(1, $post->attachments);
    }

    /**
     * 測試：更新公告時移除未勾選的附件
     *
     * @test
     */
    public function can_update_post_removing_attachments(): void
    {
        $post = Post::factory()->create([
            'created_by' => $this->teacher->id,
        ]);

        $attachment = $post->attachments()->create([
            'type' => 'document',
            'title' => '待移除附件',
            'filename' => 'remove.pdf',
            'disk' => 'public',
            'disk_path' => 'test/remove.pdf',
            'file_url' => '/storage/test/remove.pdf',
            'mime_type' => 'application/pdf',
            'size' => 1024,
            'uploaded_by' => $this->teacher->id,
        ]);

        $data = [
            'title' => '更新測試',
            'status' => 'draft',
            'category_id' => $this->category->id,
            'content' => '內容',
            'keep_attachment_ids' => [], // 不保留任何附件
        ];

        $response = $this->actingAs($this->teacher)
            ->put(route('manage.teacher.posts.update', $post), $data);

        $response->assertRedirect(route('manage.teacher.posts.index'));

        $post->refresh();
        $this->assertCount(0, $post->attachments);
    }

    /**
     * 測試：教師可以刪除自己的公告
     *
     * @test
     */
    public function teacher_can_delete_own_post(): void
    {
        $post = Post::factory()->create([
            'title' => '待刪除公告',
            'created_by' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->delete(route('manage.teacher.posts.destroy', $post));

        $response->assertRedirect(route('manage.teacher.posts.index'));

        $this->assertSoftDeleted('posts', ['id' => $post->id]);

        // 驗證活動記錄
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $this->teacher->id,
            'action' => 'teacher.post.deleted',
        ]);
    }

    /**
     * 測試：教師無法刪除其他教師的公告
     *
     * @test
     */
    public function teacher_cannot_delete_others_post(): void
    {
        $post = Post::factory()->create([
            'created_by' => $this->anotherTeacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->delete(route('manage.teacher.posts.destroy', $post));

        $response->assertForbidden();

        $this->assertDatabaseHas('posts', ['id' => $post->id]);
    }

    /**
     * 測試：教師可以複製公告
     *
     * @test
     */
    public function teacher_can_duplicate_post(): void
    {
        $post = Post::factory()->create([
            'title' => '原始公告',
            'content' => '原始內容',
            'status' => 'published',
            'created_by' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->post(route('manage.teacher.posts.duplicate', $post));

        $response->assertRedirect();

        $duplicated = Post::where('title', '原始公告（複製）')->first();
        $this->assertNotNull($duplicated);
        $this->assertEquals('draft', $duplicated->status);
        $this->assertEquals($this->teacher->id, $duplicated->created_by);

        // 驗證活動記錄
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $this->teacher->id,
            'action' => 'teacher.post.duplicated',
        ]);
    }

    /**
     * 測試：複製公告時同時複製附件
     *
     * @test
     */
    public function duplicate_post_includes_attachments(): void
    {
        $post = Post::factory()->create([
            'created_by' => $this->teacher->id,
        ]);

        $post->attachments()->create([
            'type' => 'document',
            'title' => '附件',
            'filename' => 'file.pdf',
            'disk' => 'public',
            'disk_path' => 'test/file.pdf',
            'file_url' => '/storage/test/file.pdf',
            'mime_type' => 'application/pdf',
            'size' => 1024,
            'uploaded_by' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->post(route('manage.teacher.posts.duplicate', $post));

        $response->assertRedirect();

        $duplicated = Post::latest()->first();
        $this->assertCount(1, $duplicated->attachments);
    }

    /**
     * 測試：教師可以快速發佈公告
     *
     * @test
     */
    public function teacher_can_quick_publish_post(): void
    {
        $post = Post::factory()->create([
            'title' => '草稿公告',
            'status' => 'draft',
            'published_at' => null,
            'created_by' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->post(route('manage.teacher.posts.quick-publish', $post));

        $response->assertRedirect(route('manage.teacher.posts.index'));

        $post->refresh();
        $this->assertEquals('published', $post->status);
        $this->assertNotNull($post->published_at);

        // 驗證活動記錄
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $this->teacher->id,
            'action' => 'teacher.post.quick_published',
        ]);
    }

    /**
     * 測試：管理員可以管理所有教師的公告
     *
     * @test
     */
    public function admin_can_manage_all_teacher_posts(): void
    {
        $post = Post::factory()->create([
            'created_by' => $this->teacher->id,
        ]);

        // 管理員可以查看
        $response = $this->actingAs($this->admin)
            ->get(route('manage.teacher.posts.show', $post));
        $response->assertOk();

        // 管理員可以編輯
        $response = $this->actingAs($this->admin)
            ->get(route('manage.teacher.posts.edit', $post));
        $response->assertOk();

        // 管理員可以更新
        $response = $this->actingAs($this->admin)
            ->put(route('manage.teacher.posts.update', $post), [
                'title' => '管理員更新',
                'status' => 'draft',
                'category_id' => $this->category->id,
                'content' => '內容',
            ]);
        $response->assertRedirect();

        // 管理員可以刪除
        $response = $this->actingAs($this->admin)
            ->delete(route('manage.teacher.posts.destroy', $post));
        $response->assertRedirect();
    }

    /**
     * 測試：狀態統計功能
     *
     * @test
     */
    public function status_summary_is_correct(): void
    {
        Post::factory()->count(3)->create([
            'status' => 'draft',
            'created_by' => $this->teacher->id,
        ]);

        Post::factory()->count(2)->create([
            'status' => 'published',
            'published_at' => now(),
            'created_by' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->get(route('manage.teacher.posts.index'));

        $response->assertOk();
        $summary = $response->viewData('page')['props']['statusSummary'];

        $this->assertEquals(3, $summary['draft'] ?? 0);
        $this->assertEquals(2, $summary['published'] ?? 0);
    }
}
