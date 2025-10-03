<?php

namespace Tests\Feature\Manage\Teacher;

use App\Models\Lab;
use App\Models\ManageActivity;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class LabManagementTest extends TestCase
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
            'role' => 'admin',
            'status' => 1,
        ]);

        $this->teacher = User::factory()->create([
            'role' => 'teacher',
            'status' => 1,
        ]);

        $this->otherTeacher = User::factory()->create([
            'role' => 'teacher',
            'status' => 1,
        ]);

        $this->regularUser = User::factory()->create([
            'role' => 'user',
            'status' => 1,
        ]);
    }

    /**
     * 測試：教師可以查看自己負責的實驗室列表。
     */
    public function test_teacher_can_view_their_labs_list(): void
    {
        // 建立教師負責的實驗室
        $lab = Lab::factory()->create([
            'principal_investigator_id' => $this->teacher->id,
            'visible' => true,
        ]);

        // 建立其他教師的實驗室（不應該出現）
        Lab::factory()->create([
            'principal_investigator_id' => $this->otherTeacher->id,
            'visible' => true,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/manage/teacher/labs');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $lab->id)
            ->assertJsonPath('data.0.name', $lab->name);
    }

    /**
     * 測試：教師可以查看自己參與的實驗室。
     */
    public function test_teacher_can_view_labs_they_are_member_of(): void
    {
        // 建立實驗室並將教師加為成員
        $lab = Lab::factory()->create([
            'principal_investigator_id' => $this->otherTeacher->id,
        ]);
        $lab->members()->attach($this->teacher->id);

        $response = $this->actingAs($this->teacher)
            ->getJson('/manage/teacher/labs');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $lab->id);
    }

    /**
     * 測試：教師不能查看其他教師的實驗室（非成員）。
     */
    public function test_teacher_cannot_view_other_teacher_labs(): void
    {
        // 建立其他教師的實驗室
        Lab::factory()->create([
            'principal_investigator_id' => $this->otherTeacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/manage/teacher/labs');

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }

    /**
     * 測試：管理員可以查看所有實驗室。
     */
    public function test_admin_can_view_all_labs(): void
    {
        Lab::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)
            ->getJson('/manage/teacher/labs');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    /**
     * 測試：可以搜尋實驗室（依名稱）。
     */
    public function test_can_search_labs_by_name(): void
    {
        $lab1 = Lab::factory()->create([
            'name' => '人工智慧實驗室',
            'principal_investigator_id' => $this->teacher->id,
        ]);

        Lab::factory()->create([
            'name' => '網路安全實驗室',
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/manage/teacher/labs?search=人工智慧');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $lab1->id);
    }

    /**
     * 測試：可以依研究領域篩選實驗室。
     */
    public function test_can_filter_labs_by_field(): void
    {
        $aiLab = Lab::factory()->create([
            'field' => 'Artificial Intelligence',
            'principal_investigator_id' => $this->teacher->id,
        ]);

        Lab::factory()->create([
            'field' => 'Network Security',
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/manage/teacher/labs?field=Artificial Intelligence');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $aiLab->id);
    }

    /**
     * 測試：可以依可見性篩選實驗室。
     */
    public function test_can_filter_labs_by_visibility(): void
    {
        $visibleLab = Lab::factory()->create([
            'visible' => true,
            'principal_investigator_id' => $this->teacher->id,
        ]);

        Lab::factory()->create([
            'visible' => false,
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/manage/teacher/labs?visible=1');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $visibleLab->id);
    }

    /**
     * 測試：可以依標籤篩選實驗室。
     */
    public function test_can_filter_labs_by_tag(): void
    {
        $tag = Tag::factory()->create(['name' => 'AI']);

        $lab = Lab::factory()->create([
            'principal_investigator_id' => $this->teacher->id,
        ]);
        $lab->tags()->attach($tag->id);

        Lab::factory()->create([
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/manage/teacher/labs?tag=AI');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $lab->id);
    }

    /**
     * 測試：教師可以建立實驗室。
     */
    public function test_teacher_can_create_lab(): void
    {
        $labData = [
            'name' => '新實驗室',
            'name_en' => 'New Lab',
            'field' => 'Computer Science',
            'location' => 'Building A, Room 101',
            'capacity' => 20,
            'description' => '這是一個測試實驗室',
            'visible' => true,
            'tags' => ['AI', 'Machine Learning'],
        ];

        $response = $this->actingAs($this->teacher)
            ->postJson('/manage/teacher/labs', $labData);

        $response->assertRedirect();

        $this->assertDatabaseHas('spaces', [
            'name' => '新實驗室',
            'field' => 'Computer Science',
            'principal_investigator_id' => $this->teacher->id,
        ]);

        // 驗證活動記錄
        $this->assertDatabaseHas('manage_activities', [
            'action' => 'lab.created',
            'user_id' => $this->teacher->id,
        ]);
    }

    /**
     * 測試：建立實驗室時會自動設定負責教師。
     */
    public function test_lab_creation_automatically_sets_principal_investigator(): void
    {
        $labData = [
            'name' => '測試實驗室',
            'field' => 'AI',
            'visible' => true,
        ];

        $this->actingAs($this->teacher)
            ->postJson('/manage/teacher/labs', $labData);

        $this->assertDatabaseHas('spaces', [
            'name' => '測試實驗室',
            'principal_investigator_id' => $this->teacher->id,
        ]);
    }

    /**
     * 測試：建立實驗室需要必填欄位。
     */
    public function test_lab_creation_requires_name_and_field(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson('/manage/teacher/labs', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'field']);
    }

    /**
     * 測試：實驗室容量必須為正整數。
     */
    public function test_lab_capacity_must_be_positive_integer(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson('/manage/teacher/labs', [
                'name' => '測試實驗室',
                'field' => 'AI',
                'capacity' => -5,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['capacity']);
    }

    /**
     * 測試：實驗室成員必須存在。
     */
    public function test_lab_members_must_exist(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson('/manage/teacher/labs', [
                'name' => '測試實驗室',
                'field' => 'AI',
                'members' => [99999], // 不存在的使用者
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['members.0']);
    }

    /**
     * 測試：教師可以更新自己負責的實驗室。
     */
    public function test_teacher_can_update_their_lab(): void
    {
        $lab = Lab::factory()->create([
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $updateData = [
            'name' => '更新後的實驗室名稱',
            'field' => '更新後的領域',
        ];

        $response = $this->actingAs($this->teacher)
            ->putJson("/manage/teacher/labs/{$lab->id}", $updateData);

        $response->assertRedirect();

        $this->assertDatabaseHas('spaces', [
            'id' => $lab->id,
            'name' => '更新後的實驗室名稱',
            'field' => '更新後的領域',
        ]);

        // 驗證活動記錄
        $this->assertDatabaseHas('manage_activities', [
            'action' => 'lab.updated',
            'user_id' => $this->teacher->id,
        ]);
    }

    /**
     * 測試：教師不能更新其他教師負責的實驗室。
     */
    public function test_teacher_cannot_update_other_teacher_lab(): void
    {
        $lab = Lab::factory()->create([
            'principal_investigator_id' => $this->otherTeacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->putJson("/manage/teacher/labs/{$lab->id}", [
                'name' => '嘗試更新',
            ]);

        $response->assertForbidden();
    }

    /**
     * 測試：管理員可以更新任何實驗室。
     */
    public function test_admin_can_update_any_lab(): void
    {
        $lab = Lab::factory()->create([
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/manage/teacher/labs/{$lab->id}", [
                'name' => '管理員更新',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('spaces', [
            'id' => $lab->id,
            'name' => '管理員更新',
        ]);
    }

    /**
     * 測試：教師可以刪除自己負責的實驗室。
     */
    public function test_teacher_can_delete_their_lab(): void
    {
        $lab = Lab::factory()->create([
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->deleteJson("/manage/teacher/labs/{$lab->id}");

        $response->assertRedirect();

        $this->assertSoftDeleted('spaces', [
            'id' => $lab->id,
        ]);

        // 驗證活動記錄
        $this->assertDatabaseHas('manage_activities', [
            'action' => 'lab.deleted',
            'user_id' => $this->teacher->id,
        ]);
    }

    /**
     * 測試：教師不能刪除其他教師的實驗室。
     */
    public function test_teacher_cannot_delete_other_teacher_lab(): void
    {
        $lab = Lab::factory()->create([
            'principal_investigator_id' => $this->otherTeacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->deleteJson("/manage/teacher/labs/{$lab->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('spaces', [
            'id' => $lab->id,
            'deleted_at' => null,
        ]);
    }

    /**
     * 測試：教師可以新增成員到自己的實驗室。
     */
    public function test_teacher_can_add_member_to_their_lab(): void
    {
        $lab = Lab::factory()->create([
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $member = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($this->teacher)
            ->postJson("/manage/teacher/labs/{$lab->id}/members", [
                'user_id' => $member->id,
                'role' => 'researcher',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('space_user', [
            'space_id' => $lab->id,
            'user_id' => $member->id,
        ]);

        // 驗證活動記錄
        $this->assertDatabaseHas('manage_activities', [
            'action' => 'lab.member_added',
        ]);
    }

    /**
     * 測試：教師可以從自己的實驗室移除成員。
     */
    public function test_teacher_can_remove_member_from_their_lab(): void
    {
        $lab = Lab::factory()->create([
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $member = User::factory()->create(['role' => 'user']);
        $lab->members()->attach($member->id);

        $response = $this->actingAs($this->teacher)
            ->deleteJson("/manage/teacher/labs/{$lab->id}/members/{$member->id}");

        $response->assertRedirect();

        $this->assertDatabaseMissing('space_user', [
            'space_id' => $lab->id,
            'user_id' => $member->id,
        ]);

        // 驗證活動記錄
        $this->assertDatabaseHas('manage_activities', [
            'action' => 'lab.member_removed',
        ]);
    }

    /**
     * 測試：教師不能管理其他教師實驗室的成員。
     */
    public function test_teacher_cannot_manage_members_of_other_lab(): void
    {
        $lab = Lab::factory()->create([
            'principal_investigator_id' => $this->otherTeacher->id,
        ]);

        $member = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($this->teacher)
            ->postJson("/manage/teacher/labs/{$lab->id}/members", [
                'user_id' => $member->id,
            ]);

        $response->assertForbidden();
    }

    /**
     * 測試：一般使用者不能存取實驗室管理。
     */
    public function test_regular_user_cannot_access_lab_management(): void
    {
        $response = $this->actingAs($this->regularUser)
            ->getJson('/manage/teacher/labs');

        $response->assertForbidden();
    }

    /**
     * 測試：訪客不能存取實驗室管理。
     */
    public function test_guest_cannot_access_lab_management(): void
    {
        $response = $this->getJson('/manage/teacher/labs');

        $response->assertUnauthorized();
    }

    /**
     * 測試：可以查看實驗室詳細資訊。
     */
    public function test_can_view_lab_details(): void
    {
        $lab = Lab::factory()->create([
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $lab->load(['principalInvestigator', 'members', 'tags']);

        $response = $this->actingAs($this->teacher)
            ->get("/manage/teacher/labs/{$lab->id}");

        $response->assertOk();
    }

    /**
     * 測試：教師可以同步實驗室成員。
     */
    public function test_teacher_can_sync_lab_members(): void
    {
        $lab = Lab::factory()->create([
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $member1 = User::factory()->create(['role' => 'user']);
        $member2 = User::factory()->create(['role' => 'user']);
        $member3 = User::factory()->create(['role' => 'user']);

        // 初始成員
        $lab->members()->attach([$member1->id, $member2->id]);

        // 更新成員列表（移除 member1，保留 member2，新增 member3）
        $response = $this->actingAs($this->teacher)
            ->putJson("/manage/teacher/labs/{$lab->id}", [
                'name' => $lab->name,
                'field' => $lab->field,
                'members' => [$member2->id, $member3->id],
            ]);

        $response->assertRedirect();

        // 驗證成員已同步
        $this->assertDatabaseMissing('space_user', [
            'space_id' => $lab->id,
            'user_id' => $member1->id,
        ]);

        $this->assertDatabaseHas('space_user', [
            'space_id' => $lab->id,
            'user_id' => $member2->id,
        ]);

        $this->assertDatabaseHas('space_user', [
            'space_id' => $lab->id,
            'user_id' => $member3->id,
        ]);
    }

    /**
     * 測試：可以取得實驗室的研究領域選項。
     */
    public function test_can_get_field_options_for_filtering(): void
    {
        Lab::factory()->create([
            'field' => 'AI',
            'principal_investigator_id' => $this->teacher->id,
        ]);

        Lab::factory()->create([
            'field' => 'Network',
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/manage/teacher/labs');

        $response->assertOk()
            ->assertJsonStructure(['data', 'fields']);
    }
}
