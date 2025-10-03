<?php

namespace Tests\Browser\Manage\Teacher;

use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * 教師公告管理 E2E 測試
 *
 * 測試範圍：
 * - 列表頁面顯示與操作
 * - 搜尋與篩選功能
 * - 建立新公告流程
 * - 編輯現有公告
 * - 查看公告詳情
 * - 刪除公告
 * - 複製公告
 * - 快速發佈
 * - 表單驗證
 * - 權限控制
 */
class PostManagementTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected User $teacher;
    protected User $admin;
    protected PostCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        // 建立測試使用者
        $this->teacher = User::factory()->create([
            'name' => '測試教師',
            'email' => 'teacher@test.com',
            'role' => 'teacher',
        ]);

        $this->admin = User::factory()->create([
            'name' => '測試管理員',
            'email' => 'admin@test.com',
            'role' => 'admin',
        ]);

        // 建立測試分類
        $this->category = PostCategory::factory()->create(['name' => '課程公告']);

        // 建立測試標籤
        Tag::factory()->create(['name' => '課程', 'slug' => 'course']);
        Tag::factory()->create(['name' => '作業', 'slug' => 'homework']);
    }

    /**
     * 測試：教師可以訪問公告列表頁
     *
     * @test
     */
    public function teacher_can_access_post_list_page(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/posts')
                ->assertSee('公告管理')
                ->assertSee('新增公告')
                ->assertPresent('input[placeholder*="搜尋"]');
        });
    }

    /**
     * 測試：列表顯示公告資料
     *
     * @test
     */
    public function list_displays_post_data(): void
    {
        $post = Post::factory()->create([
            'title' => 'AI 課程公告',
            'category_id' => $this->category->id,
            'created_by' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) use ($post) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/posts')
                ->assertSee($post->title)
                ->assertSee($this->category->name);
        });
    }

    /**
     * 測試：搜尋功能
     *
     * @test
     */
    public function search_filters_posts(): void
    {
        Post::factory()->create([
            'title' => 'AI 研究課程',
            'category_id' => $this->category->id,
            'created_by' => $this->teacher->id,
        ]);

        Post::factory()->create([
            'title' => '資料庫系統',
            'category_id' => $this->category->id,
            'created_by' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/posts')
                ->type('input[placeholder*="搜尋"]', 'AI')
                ->pause(500) // 等待 debounce
                ->assertSee('AI 研究課程')
                ->assertDontSee('資料庫系統');
        });
    }

    /**
     * 測試：狀態篩選功能
     *
     * @test
     */
    public function status_filter_works(): void
    {
        Post::factory()->create([
            'title' => '草稿公告',
            'status' => 'draft',
            'category_id' => $this->category->id,
            'created_by' => $this->teacher->id,
        ]);

        Post::factory()->create([
            'title' => '已發佈公告',
            'status' => 'published',
            'published_at' => now(),
            'category_id' => $this->category->id,
            'created_by' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/posts')
                ->select('select[name="status"]', 'draft')
                ->pause(500)
                ->assertSee('草稿公告')
                ->assertDontSee('已發佈公告')
                ->select('select[name="status"]', 'published')
                ->pause(500)
                ->assertSee('已發佈公告')
                ->assertDontSee('草稿公告');
        });
    }

    /**
     * 測試：建立新公告流程
     *
     * @test
     */
    public function can_create_new_post(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/posts')
                ->clickLink('新增公告')
                ->assertPathIs('/manage/teacher/posts/create')
                ->assertSee('建立公告')
                // 填寫表單
                ->type('input[name="title"]', '新課程公告')
                ->select('select[name="category_id"]', (string) $this->category->id)
                ->select('select[name="status"]', 'draft')
                ->type('textarea[name="summary"]', '這是公告摘要')
                ->type('textarea[name="content"]', '這是公告內容')
                ->type('input[name="target_audience"]', '大學部學生')
                // 提交表單
                ->press('建立')
                ->waitForText('公告建立成功')
                ->assertPathIs('/manage/teacher/posts')
                ->assertSee('新課程公告');
        });

        // 驗證資料庫
        $this->assertDatabaseHas('posts', [
            'title' => '新課程公告',
            'created_by' => $this->teacher->id,
        ]);
    }

    /**
     * 測試：表單驗證錯誤顯示
     *
     * @test
     */
    public function form_validation_shows_errors(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/posts/create')
                // 不填寫必填欄位直接提交
                ->press('建立')
                ->pause(500)
                // 驗證錯誤訊息顯示
                ->assertSee('標題')
                ->assertSee('分類')
                ->assertSee('內容');
        });
    }

    /**
     * 測試：編輯現有公告
     *
     * @test
     */
    public function can_edit_existing_post(): void
    {
        $post = Post::factory()->create([
            'title' => '原始公告',
            'content' => '原始內容',
            'category_id' => $this->category->id,
            'created_by' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) use ($post) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/posts')
                ->click("button[data-post-id='{$post->id}']") // 點擊操作選單
                ->pause(200)
                ->clickLink('編輯')
                ->assertPathIs("/manage/teacher/posts/{$post->id}/edit")
                ->assertSee('編輯公告')
                // 驗證預填資料
                ->assertInputValue('input[name="title"]', '原始公告')
                // 修改資料
                ->clear('input[name="title"]')
                ->type('input[name="title"]', '更新後公告')
                ->clear('textarea[name="content"]')
                ->type('textarea[name="content"]', '更新後內容')
                // 提交更新
                ->press('更新')
                ->waitForText('公告已更新')
                ->assertPathIs('/manage/teacher/posts')
                ->assertSee('更新後公告');
        });

        // 驗證資料庫
        $post->refresh();
        $this->assertEquals('更新後公告', $post->title);
    }

    /**
     * 測試：查看公告詳情
     *
     * @test
     */
    public function can_view_post_details(): void
    {
        $post = Post::factory()->create([
            'title' => '詳情測試公告',
            'summary' => '這是摘要',
            'content' => '這是詳細內容',
            'target_audience' => '大學部學生',
            'category_id' => $this->category->id,
            'created_by' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) use ($post) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/posts')
                ->click("button[data-post-id='{$post->id}']")
                ->pause(200)
                ->clickLink('查看')
                ->assertPathIs("/manage/teacher/posts/{$post->id}")
                ->assertSee('詳情測試公告')
                ->assertSee('這是摘要')
                ->assertSee('這是詳細內容')
                ->assertSee('大學部學生');
        });
    }

    /**
     * 測試：刪除公告
     *
     * @test
     */
    public function can_delete_post(): void
    {
        $post = Post::factory()->create([
            'title' => '待刪除公告',
            'category_id' => $this->category->id,
            'created_by' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) use ($post) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/posts')
                ->assertSee('待刪除公告')
                ->click("button[data-post-id='{$post->id}']")
                ->pause(200)
                ->clickLink('刪除')
                ->pause(200)
                // 確認刪除對話框
                ->whenAvailable('.confirm-dialog', function ($dialog) {
                    $dialog->assertSee('確定要刪除這則公告嗎')
                        ->press('確認');
                })
                ->waitForText('公告已刪除')
                ->assertDontSee('待刪除公告');
        });

        // 驗證軟刪除
        $this->assertSoftDeleted('posts', ['id' => $post->id]);
    }

    /**
     * 測試：複製公告
     *
     * @test
     */
    public function can_duplicate_post(): void
    {
        $post = Post::factory()->create([
            'title' => '原始公告',
            'content' => '原始內容',
            'status' => 'published',
            'published_at' => now(),
            'category_id' => $this->category->id,
            'created_by' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) use ($post) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/posts')
                ->click("button[data-post-id='{$post->id}']")
                ->pause(200)
                ->clickLink('複製')
                ->pause(500)
                ->waitForText('已建立公告副本')
                ->assertPathBeginsWith('/manage/teacher/posts/')
                ->assertPathEndsWith('/edit');
        });

        // 驗證資料庫
        $this->assertDatabaseHas('posts', [
            'title' => '原始公告（複製）',
            'status' => 'draft',
            'created_by' => $this->teacher->id,
        ]);
    }

    /**
     * 測試：快速發佈公告
     *
     * @test
     */
    public function can_quick_publish_post(): void
    {
        $post = Post::factory()->create([
            'title' => '草稿公告',
            'status' => 'draft',
            'published_at' => null,
            'category_id' => $this->category->id,
            'created_by' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) use ($post) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/posts')
                ->click("button[data-post-id='{$post->id}']")
                ->pause(200)
                ->clickLink('快速發佈')
                ->pause(200)
                // 確認發佈
                ->whenAvailable('.confirm-dialog', function ($dialog) {
                    $dialog->press('確認');
                })
                ->waitForText('公告已快速發佈')
                ->assertSee('草稿公告');
        });

        // 驗證資料庫
        $post->refresh();
        $this->assertEquals('published', $post->status);
        $this->assertNotNull($post->published_at);
    }

    /**
     * 測試：教師只能看到自己的公告
     *
     * @test
     */
    public function teacher_only_sees_own_posts(): void
    {
        $otherTeacher = User::factory()->create(['role' => 'teacher']);

        // 建立自己的公告
        Post::factory()->create([
            'title' => '我的公告',
            'category_id' => $this->category->id,
            'created_by' => $this->teacher->id,
        ]);

        // 建立其他教師的公告
        Post::factory()->create([
            'title' => '別人的公告',
            'category_id' => $this->category->id,
            'created_by' => $otherTeacher->id,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/posts')
                ->assertSee('我的公告')
                ->assertDontSee('別人的公告');
        });
    }

    /**
     * 測試：管理員可以看到所有公告
     *
     * @test
     */
    public function admin_can_see_all_posts(): void
    {
        Post::factory()->create([
            'title' => '教師A的公告',
            'category_id' => $this->category->id,
            'created_by' => $this->teacher->id,
        ]);

        $otherTeacher = User::factory()->create(['role' => 'teacher']);
        Post::factory()->create([
            'title' => '教師B的公告',
            'category_id' => $this->category->id,
            'created_by' => $otherTeacher->id,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                ->visit('/manage/teacher/posts')
                ->assertSee('教師A的公告')
                ->assertSee('教師B的公告');
        });
    }

    /**
     * 測試：教師無法編輯其他教師的公告
     *
     * @test
     */
    public function teacher_cannot_edit_others_posts(): void
    {
        $otherTeacher = User::factory()->create(['role' => 'teacher']);
        $post = Post::factory()->create([
            'title' => '別人的公告',
            'category_id' => $this->category->id,
            'created_by' => $otherTeacher->id,
        ]);

        $this->browse(function (Browser $browser) use ($post) {
            $browser->loginAs($this->teacher)
                ->visit("/manage/teacher/posts/{$post->id}/edit")
                ->assertSee('403')
                ->assertSee('無權限');
        });
    }

    /**
     * 測試：分頁功能
     *
     * @test
     */
    public function pagination_works_correctly(): void
    {
        Post::factory()->count(15)->create([
            'category_id' => $this->category->id,
            'created_by' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/posts')
                ->assertPresent('.pagination')
                ->assertSeeLink('下一頁')
                ->clickLink('下一頁')
                ->pause(500)
                ->assertQueryStringHas('page', '2');
        });
    }

    /**
     * 測試：分類篩選
     *
     * @test
     */
    public function category_filter_works(): void
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

        $this->browse(function (Browser $browser) use ($category1) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/posts')
                ->select('select[name="category"]', (string) $category1->id)
                ->pause(500)
                ->assertSee('課程公告')
                ->assertDontSee('作業公告');
        });
    }

    /**
     * 測試：建立公告時填寫課程時間
     *
     * @test
     */
    public function can_create_post_with_course_dates(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/posts/create')
                ->type('input[name="title"]', '課程時間測試')
                ->select('select[name="category_id"]', (string) $this->category->id)
                ->type('textarea[name="content"]', '內容')
                ->type('input[name="course_start_at"]', '2024-09-01')
                ->type('input[name="course_end_at"]', '2025-01-15')
                ->press('建立')
                ->waitForText('公告建立成功');
        });

        // 驗證資料庫
        $this->assertDatabaseHas('posts', [
            'title' => '課程時間測試',
            'created_by' => $this->teacher->id,
        ]);
    }
}
