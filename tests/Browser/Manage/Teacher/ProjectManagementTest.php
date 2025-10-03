<?php

namespace Tests\Browser\Manage\Teacher;

use App\Models\Project;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * 研究計畫管理 E2E 測試
 *
 * 測試範圍：
 * - 列表頁面顯示與操作
 * - 搜尋與篩選功能
 * - 建立新計畫流程
 * - 編輯現有計畫
 * - 查看計畫詳情
 * - 刪除計畫
 * - 表單驗證
 * - 權限控制
 */
class ProjectManagementTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected User $teacher;
    protected User $admin;

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

        // 建立測試標籤
        Tag::factory()->create(['name' => 'AI', 'name_en' => 'Artificial Intelligence']);
        Tag::factory()->create(['name' => '機器學習', 'name_en' => 'Machine Learning']);
    }

    /**
     * 測試：教師可以訪問研究計畫列表頁
     *
     * @test
     */
    public function teacher_can_access_project_list_page(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/projects')
                ->assertSee('研究計畫管理')
                ->assertSee('新增計畫')
                ->assertPresent('input[placeholder*="搜尋"]');
        });
    }

    /**
     * 測試：列表顯示研究計畫資料
     *
     * @test
     */
    public function list_displays_project_data(): void
    {
        // 建立測試計畫
        $project = Project::factory()->create([
            'title' => '深度學習應用研究',
            'principal_investigator' => '測試教師',
            'executing_agency' => '國科會',
            'user_id' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) use ($project) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/projects')
                ->assertSee($project->title)
                ->assertSee($project->principal_investigator)
                ->assertSee($project->executing_agency);
        });
    }

    /**
     * 測試：搜尋功能
     *
     * @test
     */
    public function search_filters_projects(): void
    {
        // 建立多個計畫
        Project::factory()->create([
            'title' => 'AI 研究計畫',
            'user_id' => $this->teacher->id,
        ]);

        Project::factory()->create([
            'title' => '資料庫系統開發',
            'user_id' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/projects')
                ->type('input[placeholder*="搜尋"]', 'AI')
                ->pause(500) // 等待 debounce
                ->assertSee('AI 研究計畫')
                ->assertDontSee('資料庫系統開發');
        });
    }

    /**
     * 測試：狀態篩選功能
     *
     * @test
     */
    public function status_filter_works(): void
    {
        // 建立進行中的計畫
        Project::factory()->create([
            'title' => '進行中計畫',
            'start_date' => now()->subMonths(2),
            'end_date' => now()->addMonths(10),
            'user_id' => $this->teacher->id,
        ]);

        // 建立已完成的計畫
        Project::factory()->create([
            'title' => '已完成計畫',
            'start_date' => now()->subYears(2),
            'end_date' => now()->subMonths(6),
            'user_id' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/projects')
                ->select('select[name="status"]', 'ongoing')
                ->pause(500)
                ->assertSee('進行中計畫')
                ->assertDontSee('已完成計畫')
                ->select('select[name="status"]', 'completed')
                ->pause(500)
                ->assertSee('已完成計畫')
                ->assertDontSee('進行中計畫');
        });
    }

    /**
     * 測試：建立新計畫流程
     *
     * @test
     */
    public function can_create_new_project(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/projects')
                ->clickLink('新增計畫')
                ->assertPathIs('/manage/teacher/projects/create')
                ->assertSee('建立研究計畫')
                // 填寫基本資訊
                ->type('input[name="title"]', '新研究計畫')
                ->type('input[name="title_en"]', 'New Research Project')
                ->type('input[name="project_number"]', 'NSC-2024-001')
                ->type('input[name="principal_investigator"]', '測試教師')
                ->type('input[name="executing_agency"]', '國科會')
                // 填寫期程與經費
                ->type('input[name="start_date"]', '2024-01-01')
                ->type('input[name="end_date"]', '2025-12-31')
                ->type('input[name="total_budget"]', '1000000')
                // 填寫說明
                ->type('textarea[name="summary"]', '這是研究計畫摘要')
                ->type('textarea[name="description"]', '這是詳細描述')
                // 提交表單
                ->press('建立')
                ->waitForText('研究計畫已成功建立')
                ->assertPathIs('/manage/teacher/projects')
                ->assertSee('新研究計畫');
        });

        // 驗證資料庫
        $this->assertDatabaseHas('projects', [
            'title' => '新研究計畫',
            'title_en' => 'New Research Project',
            'project_number' => 'NSC-2024-001',
            'principal_investigator' => '測試教師',
            'executing_agency' => '國科會',
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
                ->visit('/manage/teacher/projects/create')
                // 不填寫必填欄位直接提交
                ->press('建立')
                ->pause(500)
                // 驗證錯誤訊息顯示
                ->assertSee('標題為必填')
                ->assertSee('主持人為必填')
                ->assertSee('執行單位為必填');
        });
    }

    /**
     * 測試：編輯現有計畫
     *
     * @test
     */
    public function can_edit_existing_project(): void
    {
        $project = Project::factory()->create([
            'title' => '原始標題',
            'principal_investigator' => '原始主持人',
            'user_id' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) use ($project) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/projects')
                ->click("button[data-project-id='{$project->id}']") // 點擊操作選單
                ->pause(200)
                ->clickLink('編輯')
                ->assertPathIs("/manage/teacher/projects/{$project->id}/edit")
                ->assertSee('編輯研究計畫')
                // 驗證預填資料
                ->assertInputValue('input[name="title"]', '原始標題')
                ->assertInputValue('input[name="principal_investigator"]', '原始主持人')
                // 修改資料
                ->clear('input[name="title"]')
                ->type('input[name="title"]', '更新後標題')
                ->clear('input[name="principal_investigator"]')
                ->type('input[name="principal_investigator"]', '新主持人')
                // 提交更新
                ->press('更新')
                ->waitForText('研究計畫已成功更新')
                ->assertPathIs('/manage/teacher/projects')
                ->assertSee('更新後標題')
                ->assertSee('新主持人');
        });

        // 驗證資料庫
        $project->refresh();
        $this->assertEquals('更新後標題', $project->title);
        $this->assertEquals('新主持人', $project->principal_investigator);
    }

    /**
     * 測試：查看計畫詳情
     *
     * @test
     */
    public function can_view_project_details(): void
    {
        $project = Project::factory()->create([
            'title' => '詳情測試計畫',
            'title_en' => 'Detail Test Project',
            'project_number' => 'TEST-001',
            'principal_investigator' => '測試教師',
            'executing_agency' => '國科會',
            'summary' => '這是計畫摘要',
            'description' => '這是計畫詳細描述',
            'total_budget' => 1000000,
            'user_id' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) use ($project) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/projects')
                ->click("button[data-project-id='{$project->id}']")
                ->pause(200)
                ->clickLink('查看')
                ->assertPathIs("/manage/teacher/projects/{$project->id}")
                ->assertSee('詳情測試計畫')
                ->assertSee('Detail Test Project')
                ->assertSee('TEST-001')
                ->assertSee('測試教師')
                ->assertSee('國科會')
                ->assertSee('這是計畫摘要')
                ->assertSee('這是計畫詳細描述')
                ->assertSee('1,000,000');
        });
    }

    /**
     * 測試：刪除計畫
     *
     * @test
     */
    public function can_delete_project(): void
    {
        $project = Project::factory()->create([
            'title' => '待刪除計畫',
            'user_id' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) use ($project) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/projects')
                ->assertSee('待刪除計畫')
                ->click("button[data-project-id='{$project->id}']")
                ->pause(200)
                ->clickLink('刪除')
                ->pause(200)
                // 確認刪除對話框
                ->whenAvailable('.confirm-dialog', function ($dialog) {
                    $dialog->assertSee('確定要刪除這個研究計畫嗎')
                        ->press('確認');
                })
                ->waitForText('研究計畫已成功刪除')
                ->assertDontSee('待刪除計畫');
        });

        // 驗證軟刪除
        $this->assertSoftDeleted('projects', ['id' => $project->id]);
    }

    /**
     * 測試：教師只能看到自己的計畫
     *
     * @test
     */
    public function teacher_only_sees_own_projects(): void
    {
        $otherTeacher = User::factory()->create(['role' => 'teacher']);

        // 建立自己的計畫
        Project::factory()->create([
            'title' => '我的計畫',
            'user_id' => $this->teacher->id,
        ]);

        // 建立其他教師的計畫
        Project::factory()->create([
            'title' => '別人的計畫',
            'user_id' => $otherTeacher->id,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/projects')
                ->assertSee('我的計畫')
                ->assertDontSee('別人的計畫');
        });
    }

    /**
     * 測試：管理員可以看到所有計畫
     *
     * @test
     */
    public function admin_can_see_all_projects(): void
    {
        // 建立不同教師的計畫
        Project::factory()->create([
            'title' => '教師A的計畫',
            'user_id' => $this->teacher->id,
        ]);

        $otherTeacher = User::factory()->create(['role' => 'teacher']);
        Project::factory()->create([
            'title' => '教師B的計畫',
            'user_id' => $otherTeacher->id,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                ->visit('/manage/teacher/projects')
                ->assertSee('教師A的計畫')
                ->assertSee('教師B的計畫');
        });
    }

    /**
     * 測試：教師無法編輯其他教師的計畫
     *
     * @test
     */
    public function teacher_cannot_edit_others_projects(): void
    {
        $otherTeacher = User::factory()->create(['role' => 'teacher']);
        $project = Project::factory()->create([
            'title' => '別人的計畫',
            'user_id' => $otherTeacher->id,
        ]);

        $this->browse(function (Browser $browser) use ($project) {
            $browser->loginAs($this->teacher)
                ->visit("/manage/teacher/projects/{$project->id}/edit")
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
        // 建立超過一頁的計畫數量
        Project::factory()->count(15)->create([
            'user_id' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/projects')
                ->assertPresent('.pagination')
                ->assertSeeLink('下一頁')
                ->clickLink('下一頁')
                ->pause(500)
                ->assertQueryStringHas('page', '2');
        });
    }

    /**
     * 測試：執行單位篩選
     *
     * @test
     */
    public function executing_agency_filter_works(): void
    {
        Project::factory()->create([
            'title' => '國科會計畫',
            'executing_agency' => '國科會',
            'user_id' => $this->teacher->id,
        ]);

        Project::factory()->create([
            'title' => '教育部計畫',
            'executing_agency' => '教育部',
            'user_id' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/projects')
                ->select('select[name="sponsor"]', '國科會')
                ->pause(500)
                ->assertSee('國科會計畫')
                ->assertDontSee('教育部計畫');
        });
    }

    /**
     * 測試：年份篩選
     *
     * @test
     */
    public function year_filter_works(): void
    {
        Project::factory()->create([
            'title' => '2024計畫',
            'start_date' => '2024-01-01',
            'user_id' => $this->teacher->id,
        ]);

        Project::factory()->create([
            'title' => '2023計畫',
            'start_date' => '2023-01-01',
            'user_id' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/projects')
                ->select('select[name="year"]', '2024')
                ->pause(500)
                ->assertSee('2024計畫')
                ->assertDontSee('2023計畫');
        });
    }
}
