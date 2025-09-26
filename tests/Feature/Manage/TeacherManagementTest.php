<?php

namespace Tests\Feature\Manage;

use App\Models\Staff;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
    }

    /**
     * 測試後台教職員首頁可以正常載入教師與職員資料。
     */
    public function test_staff_index_displays_teachers_and_staff(): void
    {
        $staff = Staff::factory()->create(['name' => '行政專員']);
        $teacher = Teacher::factory()->create(['name' => '張老師', 'name_en' => 'Mr. Chang']);

        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.staff.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('manage/admin/staff/index')
                ->where('staff.active.0.name', '行政專員')
                ->where('teachers.data.0.name.zh-TW', '張老師')
                ->where('teachers.data.0.name.en', 'Mr. Chang')
        );
    }

    /**
     * 確認刪除教師後會回傳成功訊息並軟刪除資料。
     */
    public function test_delete_teacher_from_index(): void
    {
        $teacher = Teacher::factory()->create();

        $response = $this
            ->actingAs($this->admin)
            ->delete(route('manage.teachers.destroy', $teacher));

        $response->assertRedirect(route('manage.staff.index', ['tab' => 'teachers']));
        $this->assertSoftDeleted('teachers', ['id' => $teacher->id]);
    }

    /**
     * 確認刪除職員後會回傳成功訊息並軟刪除資料。
     */
    public function test_delete_staff_from_index(): void
    {
        $staff = Staff::factory()->create();

        $response = $this
            ->actingAs($this->admin)
            ->delete(route('manage.staff.destroy', $staff));

        $response->assertRedirect(route('manage.staff.index'));
        $this->assertSoftDeleted('staff', ['id' => $staff->id]);
    }
}
