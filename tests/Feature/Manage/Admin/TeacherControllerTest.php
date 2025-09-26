<?php

namespace Tests\Feature\Manage\Admin;

use App\Models\Lab;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
    }

    /**
     * 確認管理者可以開啟新增教師頁面，頁面渲染正確。
     */
    public function test_admin_can_view_create_form(): void
    {
        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.teachers.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('manage/admin/teachers/create'));
    }

    /**
     * 確認非管理角色無法進入新增教師頁面。
     */
    public function test_non_admin_cannot_view_create_form(): void
    {
        $teacherUser = User::factory()->teacher()->create();

        $response = $this
            ->actingAs($teacherUser)
            ->get(route('manage.teachers.create'));

        $response->assertForbidden();
    }

    /**
     * 測試成功建立教師資料且不需關聯使用者帳號。
     */
    public function test_admin_can_store_teacher_without_user_relation(): void
    {
        $payload = [
            'name' => ['zh-TW' => '王教授', 'en' => 'Prof. Wang'],
            'title' => ['zh-TW' => '教授', 'en' => 'Professor'],
            'email' => 'prof.wang@example.com',
            'phone' => '02-12345678',
            'office' => 'E301',
            'job_title' => '系主任',
            'bio' => ['zh-TW' => '研究領域為人工智慧', 'en' => 'Artificial intelligence research'],
            'expertise' => ['zh-TW' => ['人工智慧', '資料探勘'], 'en' => ['AI', 'Data Mining']],
            'education' => ['zh-TW' => ['台大資工博士'], 'en' => ['Ph.D. NTU']],
            'sort_order' => 5,
            'visible' => true,
        ];

        $response = $this
            ->actingAs($this->admin)
            ->post(route('manage.teachers.store'), $payload);

        $response->assertRedirect(route('manage.staff.index', ['tab' => 'teachers']));

        $this->assertDatabaseHas('teachers', [
            'email' => 'prof.wang@example.com',
            'name' => '王教授',
            'name_en' => 'Prof. Wang',
            'user_id' => null,
        ]);
    }

    /**
     * 測試編輯教師時可以正常更新各項欄位。
     */
    public function test_admin_can_update_teacher_record(): void
    {
        $teacher = Teacher::factory()->create([
            'name' => '原始姓名',
            'name_en' => 'Original Name',
            'title' => '原始職稱',
            'title_en' => 'Original Title',
            'email' => 'original@example.com',
        ]);

        $payload = [
            'name' => ['zh-TW' => '更新姓名', 'en' => 'Updated Name'],
            'title' => ['zh-TW' => '更新職稱', 'en' => 'Updated Title'],
            'email' => 'updated@example.com',
            'phone' => '02-98765432',
            'office' => 'D202',
            'job_title' => '研究所主任',
            'bio' => ['zh-TW' => '更新簡介', 'en' => 'Updated bio'],
            'expertise' => ['zh-TW' => ['資料庫'], 'en' => ['Database']],
            'education' => ['zh-TW' => ['政大資管碩士'], 'en' => ['M.S. NCCU']],
            'sort_order' => 2,
            'visible' => false,
        ];

        $response = $this
            ->actingAs($this->admin)
            ->put(route('manage.teachers.update', $teacher), $payload);

        $response->assertRedirect(route('manage.staff.index', ['tab' => 'teachers']));

        $this->assertDatabaseHas('teachers', [
            'id' => $teacher->id,
            'name' => '更新姓名',
            'name_en' => 'Updated Name',
            'email' => 'updated@example.com',
            'visible' => false,
        ]);
    }

    /**
     * 測試刪除教師資料後資料庫確實刪除。
     */
    public function test_admin_can_delete_teacher(): void
    {
        $teacher = Teacher::factory()->create();

        $response = $this
            ->actingAs($this->admin)
            ->delete(route('manage.teachers.destroy', $teacher));

        $response->assertRedirect(route('manage.staff.index', ['tab' => 'teachers']));
        $this->assertSoftDeleted('teachers', ['id' => $teacher->id]);
    }

    /**
     * 測試教師詳情頁能正確顯示，且不需要 user 關聯。
     */
    public function test_admin_can_view_teacher_detail(): void
    {
        $lab = Lab::factory()->create();
        $teacher = Teacher::factory()->create([
            'name' => '顯示姓名',
            'name_en' => 'Display Name',
            'email' => 'display@example.com',
        ]);
        $teacher->labs()->attach($lab->id);

        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.teachers.show', $teacher));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('manage/admin/teachers/show')
                ->where('teacher.data.id', $teacher->id)
                ->where('teacher.data.email', 'display@example.com')
        );
    }
}
