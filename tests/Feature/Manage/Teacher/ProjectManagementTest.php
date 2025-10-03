<?php

namespace Tests\Feature\Manage\Teacher;

use App\Models\ManageActivity;
use App\Models\Project;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ProjectManagementTest extends TestCase
{
    use RefreshDatabase;
    use WithFaker;

    protected User $admin;
    protected User $teacher;
    protected User $otherTeacher;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        // 建立測試使用者
        $this->admin = User::factory()->create([
            'name' => '管理員',
            'role' => 'admin',
            'status' => 1,
        ]);

        $this->teacher = User::factory()->create([
            'name' => '測試教師',
            'role' => 'teacher',
            'status' => 1,
        ]);

        $this->otherTeacher = User::factory()->create([
            'name' => '其他教師',
            'role' => 'teacher',
            'status' => 1,
        ]);

        $this->regularUser = User::factory()->create([
            'role' => 'user',
            'status' => 1,
        ]);
    }

    /**
     * 測試：教師可以查看自己作為主持人的研究計畫列表。
     */
    public function test_teacher_can_view_their_projects_list(): void
    {
        // 建立教師作為主持人的計畫
        $project = Project::factory()->create([
            'principal_investigator' => $this->teacher->name,
        ]);

        // 建立其他教師的計畫（不應該出現）
        Project::factory()->create([
            'principal_investigator' => $this->otherTeacher->name,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/manage/teacher/projects');

        $response->assertOk()
            ->assertJsonCount(1, 'projects.data')
            ->assertJsonPath('projects.data.0.id', $project->id)
            ->assertJsonPath('projects.data.0.title', $project->title);
    }

    /**
     * 測試：管理員可以查看所有研究計畫。
     */
    public function test_admin_can_view_all_projects(): void
    {
        Project::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)
            ->getJson('/manage/teacher/projects');

        $response->assertOk()
            ->assertJsonCount(3, 'projects.data');
    }

    /**
     * 測試：可以搜尋研究計畫（依標題）。
     */
    public function test_can_search_projects_by_title(): void
    {
        $project1 = Project::factory()->create([
            'title' => '深度學習應用研究',
            'principal_investigator' => $this->teacher->name,
        ]);

        Project::factory()->create([
            'title' => '網路安全防護',
            'principal_investigator' => $this->teacher->name,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/manage/teacher/projects?search=深度學習');

        $response->assertOk()
            ->assertJsonCount(1, 'projects.data')
            ->assertJsonPath('projects.data.0.id', $project1->id);
    }

    /**
     * 測試：可以依狀態篩選研究計畫。
     */
    public function test_can_filter_projects_by_status(): void
    {
        // 進行中的計畫
        $ongoingProject = Project::factory()->ongoing()->create([
            'principal_investigator' => $this->teacher->name,
        ]);

        // 已完成的計畫
        Project::factory()->completed()->create([
            'principal_investigator' => $this->teacher->name,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/manage/teacher/projects?status=ongoing');

        $response->assertOk()
            ->assertJsonCount(1, 'projects.data')
            ->assertJsonPath('projects.data.0.id', $ongoingProject->id);
    }

    /**
     * 測試：可以依標籤篩選研究計畫。
     */
    public function test_can_filter_projects_by_tag(): void
    {
        $tag = Tag::factory()->create(['name' => 'AI']);

        $project = Project::factory()->create([
            'principal_investigator' => $this->teacher->name,
        ]);
        $project->tags()->attach($tag->id);

        Project::factory()->create([
            'principal_investigator' => $this->teacher->name,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/manage/teacher/projects?tag=AI');

        $response->assertOk()
            ->assertJsonCount(1, 'projects.data')
            ->assertJsonPath('projects.data.0.id', $project->id);
    }

    /**
     * 測試：可以依執行單位篩選研究計畫。
     */
    public function test_can_filter_projects_by_sponsor(): void
    {
        $project1 = Project::factory()->create([
            'sponsor' => '科技部',
            'principal_investigator' => $this->teacher->name,
        ]);

        Project::factory()->create([
            'sponsor' => '教育部',
            'principal_investigator' => $this->teacher->name,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/manage/teacher/projects?sponsor=科技部');

        $response->assertOk()
            ->assertJsonCount(1, 'projects.data')
            ->assertJsonPath('projects.data.0.id', $project1->id);
    }

    /**
     * 測試：可以依年份篩選研究計畫。
     */
    public function test_can_filter_projects_by_year(): void
    {
        $project2024 = Project::factory()->create([
            'start_date' => '2024-01-01',
            'principal_investigator' => $this->teacher->name,
        ]);

        Project::factory()->create([
            'start_date' => '2023-01-01',
            'principal_investigator' => $this->teacher->name,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/manage/teacher/projects?year=2024');

        $response->assertOk()
            ->assertJsonCount(1, 'projects.data')
            ->assertJsonPath('projects.data.0.id', $project2024->id);
    }

    /**
     * 測試：教師可以建立研究計畫。
     */
    public function test_teacher_can_create_project(): void
    {
        $projectData = [
            'title' => '新研究計畫',
            'title_en' => 'New Research Project',
            'sponsor' => '科技部',
            'principal_investigator' => $this->teacher->name,
            'start_date' => '2024-01-01',
            'end_date' => '2025-12-31',
            'total_budget' => 1000000,
            'summary' => '這是一個測試研究計畫',
            'tags' => ['AI', 'Machine Learning'],
        ];

        $response = $this->actingAs($this->teacher)
            ->postJson('/manage/teacher/projects', $projectData);

        $response->assertRedirect();

        $this->assertDatabaseHas('research_projects', [
            'title' => '新研究計畫',
            'sponsor' => '科技部',
            'principal_investigator' => $this->teacher->name,
        ]);

        // 驗證活動記錄
        $this->assertDatabaseHas('manage_activities', [
            'action' => 'project.created',
            'user_id' => $this->teacher->id,
        ]);
    }

    /**
     * 測試：建立研究計畫需要必填欄位。
     */
    public function test_project_creation_requires_required_fields(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson('/manage/teacher/projects', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'sponsor', 'principal_investigator', 'start_date']);
    }

    /**
     * 測試：結束日期必須在開始日期之後。
     */
    public function test_project_end_date_must_be_after_start_date(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson('/manage/teacher/projects', [
                'title' => '測試計畫',
                'sponsor' => '科技部',
                'principal_investigator' => $this->teacher->name,
                'start_date' => '2024-12-31',
                'end_date' => '2024-01-01',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['end_date']);
    }

    /**
     * 測試：經費金額不能為負數。
     */
    public function test_project_budget_cannot_be_negative(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson('/manage/teacher/projects', [
                'title' => '測試計畫',
                'sponsor' => '科技部',
                'principal_investigator' => $this->teacher->name,
                'start_date' => '2024-01-01',
                'total_budget' => -1000,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['total_budget']);
    }

    /**
     * 測試：教師可以更新自己作為主持人的研究計畫。
     */
    public function test_teacher_can_update_their_project(): void
    {
        $project = Project::factory()->create([
            'principal_investigator' => $this->teacher->name,
        ]);

        $updateData = [
            'title' => '更新後的計畫名稱',
            'sponsor' => '更新後的執行單位',
        ];

        $response = $this->actingAs($this->teacher)
            ->putJson("/manage/teacher/projects/{$project->id}", $updateData);

        $response->assertRedirect();

        $this->assertDatabaseHas('research_projects', [
            'id' => $project->id,
            'title' => '更新後的計畫名稱',
            'sponsor' => '更新後的執行單位',
        ]);

        // 驗證活動記錄
        $this->assertDatabaseHas('manage_activities', [
            'action' => 'project.updated',
            'user_id' => $this->teacher->id,
        ]);
    }

    /**
     * 測試：教師不能更新其他教師作為主持人的研究計畫。
     */
    public function test_teacher_cannot_update_other_teacher_project(): void
    {
        $project = Project::factory()->create([
            'principal_investigator' => $this->otherTeacher->name,
        ]);

        $response = $this->actingAs($this->teacher)
            ->putJson("/manage/teacher/projects/{$project->id}", [
                'title' => '嘗試更新',
            ]);

        $response->assertForbidden();
    }

    /**
     * 測試：管理員可以更新任何研究計畫。
     */
    public function test_admin_can_update_any_project(): void
    {
        $project = Project::factory()->create([
            'principal_investigator' => $this->teacher->name,
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/manage/teacher/projects/{$project->id}", [
                'title' => '管理員更新',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('research_projects', [
            'id' => $project->id,
            'title' => '管理員更新',
        ]);
    }

    /**
     * 測試：教師可以刪除自己作為主持人的研究計畫。
     */
    public function test_teacher_can_delete_their_project(): void
    {
        $project = Project::factory()->create([
            'principal_investigator' => $this->teacher->name,
        ]);

        $response = $this->actingAs($this->teacher)
            ->deleteJson("/manage/teacher/projects/{$project->id}");

        $response->assertRedirect();

        $this->assertSoftDeleted('research_projects', [
            'id' => $project->id,
        ]);

        // 驗證活動記錄
        $this->assertDatabaseHas('manage_activities', [
            'action' => 'project.deleted',
            'user_id' => $this->teacher->id,
        ]);
    }

    /**
     * 測試：教師不能刪除其他教師的研究計畫。
     */
    public function test_teacher_cannot_delete_other_teacher_project(): void
    {
        $project = Project::factory()->create([
            'principal_investigator' => $this->otherTeacher->name,
        ]);

        $response = $this->actingAs($this->teacher)
            ->deleteJson("/manage/teacher/projects/{$project->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('research_projects', [
            'id' => $project->id,
            'deleted_at' => null,
        ]);
    }

    /**
     * 測試：管理員可以刪除任何研究計畫。
     */
    public function test_admin_can_delete_any_project(): void
    {
        $project = Project::factory()->create([
            'principal_investigator' => $this->teacher->name,
        ]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/manage/teacher/projects/{$project->id}");

        $response->assertRedirect();

        $this->assertSoftDeleted('research_projects', [
            'id' => $project->id,
        ]);
    }

    /**
     * 測試：可以查看研究計畫詳細資訊。
     */
    public function test_can_view_project_details(): void
    {
        $project = Project::factory()->create([
            'principal_investigator' => $this->teacher->name,
        ]);

        $project->load(['tags', 'space']);

        $response = $this->actingAs($this->teacher)
            ->get("/manage/teacher/projects/{$project->id}");

        $response->assertOk();
    }

    /**
     * 測試：可以同步研究計畫的標籤。
     */
    public function test_can_sync_project_tags(): void
    {
        $project = Project::factory()->create([
            'principal_investigator' => $this->teacher->name,
        ]);

        $tag1 = Tag::factory()->create(['name' => 'AI']);
        $tag2 = Tag::factory()->create(['name' => 'ML']);

        // 初始標籤
        $project->tags()->attach($tag1->id);

        // 更新標籤（移除 tag1，新增 tag2）
        $response = $this->actingAs($this->teacher)
            ->putJson("/manage/teacher/projects/{$project->id}", [
                'title' => $project->title,
                'sponsor' => $project->sponsor,
                'principal_investigator' => $project->principal_investigator,
                'start_date' => $project->start_date->format('Y-m-d'),
                'tags' => ['ML'],
            ]);

        $response->assertRedirect();

        // 驗證標籤已同步
        $this->assertDatabaseMissing('research_project_tag', [
            'research_project_id' => $project->id,
            'tag_id' => $tag1->id,
        ]);

        $this->assertDatabaseHas('research_project_tag', [
            'research_project_id' => $project->id,
            'tag_id' => $tag2->id,
        ]);
    }

    /**
     * 測試：一般使用者不能存取研究計畫管理。
     */
    public function test_regular_user_cannot_access_project_management(): void
    {
        $response = $this->actingAs($this->regularUser)
            ->getJson('/manage/teacher/projects');

        $response->assertForbidden();
    }

    /**
     * 測試：訪客不能存取研究計畫管理。
     */
    public function test_guest_cannot_access_project_management(): void
    {
        $response = $this->getJson('/manage/teacher/projects');

        $response->assertUnauthorized();
    }

    /**
     * 測試：計畫狀態正確計算（進行中）。
     */
    public function test_project_status_is_correctly_calculated_as_ongoing(): void
    {
        $project = Project::factory()->ongoing()->create([
            'principal_investigator' => $this->teacher->name,
        ]);

        $this->assertEquals('ongoing', $project->status);
    }

    /**
     * 測試：計畫狀態正確計算（已完成）。
     */
    public function test_project_status_is_correctly_calculated_as_completed(): void
    {
        $project = Project::factory()->completed()->create([
            'principal_investigator' => $this->teacher->name,
        ]);

        $this->assertEquals('completed', $project->status);
    }

    /**
     * 測試：計畫狀態正確計算（即將開始）。
     */
    public function test_project_status_is_correctly_calculated_as_upcoming(): void
    {
        $project = Project::factory()->upcoming()->create([
            'principal_investigator' => $this->teacher->name,
        ]);

        $this->assertEquals('upcoming', $project->status);
    }

    /**
     * 測試：支援 amount 別名欄位。
     */
    public function test_supports_amount_field_alias(): void
    {
        $projectData = [
            'title' => '測試計畫',
            'sponsor' => '科技部',
            'principal_investigator' => $this->teacher->name,
            'start_date' => '2024-01-01',
            'amount' => 500000, // 使用別名
        ];

        $response = $this->actingAs($this->teacher)
            ->postJson('/manage/teacher/projects', $projectData);

        $response->assertRedirect();

        $this->assertDatabaseHas('research_projects', [
            'title' => '測試計畫',
            'total_budget' => 500000,
        ]);
    }

    /**
     * 測試：可以取得執行單位選項列表。
     */
    public function test_can_get_sponsor_options(): void
    {
        Project::factory()->create([
            'sponsor' => '科技部',
            'principal_investigator' => $this->teacher->name,
        ]);

        Project::factory()->create([
            'sponsor' => '教育部',
            'principal_investigator' => $this->teacher->name,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/manage/teacher/projects');

        $response->assertOk()
            ->assertJsonStructure(['sponsors']);
    }

    /**
     * 測試：可以取得年份選項列表。
     */
    public function test_can_get_year_options(): void
    {
        Project::factory()->create([
            'start_date' => '2024-01-01',
            'principal_investigator' => $this->teacher->name,
        ]);

        Project::factory()->create([
            'start_date' => '2023-01-01',
            'principal_investigator' => $this->teacher->name,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/manage/teacher/projects');

        $response->assertOk()
            ->assertJsonStructure(['years']);
    }
}
