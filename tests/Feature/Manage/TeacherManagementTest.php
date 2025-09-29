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

        $this->withoutVite();
        $this->admin = User::factory()->admin()->create();
    }

    /**
     * 測試後台教職員首頁可以正常載入教師與職員資料。
     */
    public function test_staff_index_displays_teachers_and_staff(): void
    {
        $staff = Staff::factory()->create([
            'name' => ['zh-TW' => '行政專員', 'en' => 'Admin Officer'],
            'employment_status' => 'active',
        ]);
        $teacher = Teacher::factory()->create([
            'name' => ['zh-TW' => '張老師', 'en' => 'Mr. Chang'],
            'employment_status' => 'retired',
        ]);

        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.staff.index'));

        $response->assertOk();
        $response->assertInertia(function ($page) {
            $page->component('manage/staff/index')
                ->where('staff.active.0.name.zh-TW', '行政專員')
                ->where('teachers.data.0.name.zh-TW', '張老師')
                ->where('teachers.data.0.employment_status', 'retired');
        });
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

    /**
     * 切換教師在職狀態會更新 employment_status 與顯示狀態。
     */
    public function test_toggle_teacher_status_from_index(): void
    {
        $teacher = Teacher::factory()->create([
            'employment_status' => 'active',
            'visible' => true,
        ]);

        $this
            ->from(route('manage.staff.index', ['tab' => 'teachers']))
            ->actingAs($this->admin)
            ->patch(route('manage.teachers.toggle-status', $teacher))
            ->assertRedirect(route('manage.staff.index', ['tab' => 'teachers']));

        $teacher->refresh();
        $this->assertSame('inactive', $teacher->employment_status);
        $this->assertFalse($teacher->visible);

        $this
            ->from(route('manage.staff.index', ['tab' => 'teachers']))
            ->actingAs($this->admin)
            ->patch(route('manage.teachers.toggle-status', $teacher), [
                'status' => 'active',
                'restore_visibility' => true,
            ])
            ->assertRedirect(route('manage.staff.index', ['tab' => 'teachers']));

        $teacher->refresh();
        $this->assertSame('active', $teacher->employment_status);
        $this->assertTrue($teacher->visible);
    }

    /**
     * 切換教師顯示狀態。
     */
    public function test_toggle_teacher_visibility_from_index(): void
    {
        $teacher = Teacher::factory()->create(['visible' => false]);

        $this
            ->from(route('manage.staff.index', ['tab' => 'teachers']))
            ->actingAs($this->admin)
            ->patch(route('manage.teachers.toggle-visibility', $teacher))
            ->assertRedirect(route('manage.staff.index', ['tab' => 'teachers']));

        $teacher->refresh();
        $this->assertTrue($teacher->visible);
    }
}
