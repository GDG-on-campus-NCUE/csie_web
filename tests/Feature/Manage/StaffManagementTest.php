<?php

namespace Tests\Feature\Manage;

use App\Models\Staff;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    // T007: 職員列表頁面會回傳包含新欄位的統一結構，並同時載入教師資料
    public function test_staff_index_returns_structured_staff_and_teacher_payload(): void
    {
        $admin = User::factory()->admin()->create();

        $staffUser = User::factory()->create(['role' => 'user']);
        $teacherUser = User::factory()->teacher()->create();

        $staffMember = Staff::factory()
            ->for($staffUser)
            ->create([
                'employment_status' => 'active',
                'employment_started_at' => now()->subYears(2),
                'employment_ended_at' => null,
                'visible' => true,
            ]);

        $teacher = Teacher::factory()
            ->for($teacherUser)
            ->create([
                'employment_status' => 'inactive',
                'employment_started_at' => now()->subYears(5),
                'employment_ended_at' => now()->subYear(),
                'visible' => false,
            ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('manage.staff.index'));

        $response->assertOk();
        $response->assertInertia(function ($page) use ($staffMember, $teacher, $staffUser, $teacherUser) {
            $page->component('manage/staff/index')
                ->has('staff.active', 1)
                ->where('staff.active.0.id', $staffMember->id)
                ->where('staff.active.0.employment_status', 'active')
                ->where('staff.active.0.user.email', $staffUser->email)
                ->has('staff.active.0.employment_started_at')
                ->has('staff.active.0.visible')
                ->has('staff.trashed', 0)
                ->has('teachers.data', 1)
                ->where('teachers.data.0.id', $teacher->id)
                ->where('teachers.data.0.employment_status', 'inactive')
                ->where('teachers.data.0.user.email', $teacherUser->email)
                ->where('teachers.data.0.visible', false)
                ->has('teachers.trashed', 0)
                ->has('filters')
                ->where('filters.per_page', 15);
        });
    }

    // T008: 職員新增表單包含所有必要欄位並支援多語言輸入
    public function test_staff_create_form_displays_all_required_fields(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this
            ->actingAs($admin)
            ->get(route('manage.staff.create'));

        $response->assertSuccessful();
        $response->assertInertia(function ($page) {
            $page->component('manage/staff/create')
                ->has('staff'); // 應該包含空的 staff 物件
        });
    }

    // T009: 職員資料可以成功新增並驗證多語言內容
    public function test_staff_can_be_created_with_multilingual_content(): void
    {
        $admin = User::factory()->admin()->create();

        $staffData = [
            'name' => [
                'zh-TW' => '王小明',
                'en' => 'Ming Wang'
            ],
            'position' => [
                'zh-TW' => '系辦助理',
                'en' => 'Department Assistant'
            ],
            'email' => 'ming.wang@example.com',
            'phone' => '02-1234-5678',
            'office' => 'A101',
            'bio' => [
                'zh-TW' => '負責系務相關業務',
                'en' => 'Responsible for department affairs'
            ],
            'visible' => true,
            'sort_order' => 1
        ];

        $response = $this
            ->actingAs($admin)
            ->post(route('manage.staff.store'), $staffData);

        $response->assertRedirect(route('manage.staff.index'));

        $staff = Staff::where('email', 'ming.wang@example.com')->first();
        $this->assertNotNull($staff);
        $this->assertEquals('王小明', $staff->name['zh-TW']);
        $this->assertEquals('Ming Wang', $staff->name['en']);
        $this->assertEquals('系辦助理', $staff->position['zh-TW']);
        $this->assertEquals('Department Assistant', $staff->position['en']);
    }

    // T010: 職員資料驗證規則正確運作
    public function test_staff_validation_rules_work_correctly(): void
    {
        $admin = User::factory()->admin()->create();

        // 測試必填欄位
        $response = $this
            ->actingAs($admin)
            ->post(route('manage.staff.store'), []);

        $response->assertSessionHasErrors(['name.zh-TW', 'position.zh-TW', 'email']);

        // 測試 email 格式驗證
        $response = $this
            ->actingAs($admin)
            ->post(route('manage.staff.store'), [
                'name' => ['zh-TW' => '測試'],
                'position' => ['zh-TW' => '測試職位'],
                'email' => 'invalid-email'
            ]);

        $response->assertSessionHasErrors(['email']);

        // 測試 email 唯一性
        $existingStaff = Staff::factory()->create(['email' => 'existing@example.com']);

        $response = $this
            ->actingAs($admin)
            ->post(route('manage.staff.store'), [
                'name' => ['zh-TW' => '測試'],
                'position' => ['zh-TW' => '測試職位'],
                'email' => 'existing@example.com'
            ]);

        $response->assertSessionHasErrors(['email']);
    }

    // T011: 職員編輯表單正確載入現有資料
    public function test_staff_edit_form_loads_existing_data(): void
    {
        $admin = User::factory()->admin()->create();
        $staff = Staff::factory()->create([
            'name' => ['zh-TW' => '測試職員', 'en' => 'Test Staff'],
            'name_en' => 'Test Staff',
            'position' => ['zh-TW' => '測試職位', 'en' => 'Test Position']
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('manage.staff.edit', $staff));

        $response->assertSuccessful();
        $response->assertInertia(function ($page) use ($staff) {
            $page->component('manage/staff/edit')
                ->where('staff.id', $staff->id)
                ->where('staff.name.zh-TW', '測試職員')
                ->where('staff.name.en', 'Test Staff');
        });
    }

    // T012: 職員資料可以成功更新
    public function test_staff_can_be_updated(): void
    {
        $admin = User::factory()->admin()->create();
        $staff = Staff::factory()->create();

        $updatedData = [
            'name' => [
                'zh-TW' => '更新後的姓名',
                'en' => 'Updated Name'
            ],
            'position' => [
                'zh-TW' => '更新後的職位',
                'en' => 'Updated Position'
            ],
            'email' => 'updated@example.com',
            'phone' => '02-9876-5432',
            'office' => 'B202',
            'bio' => [
                'zh-TW' => '更新後的簡介',
                'en' => 'Updated Bio'
            ],
            'visible' => false,
            'sort_order' => 5
        ];

        $response = $this
            ->actingAs($admin)
            ->put(route('manage.staff.update', $staff), $updatedData);

        $response->assertRedirect(route('manage.staff.index'));

        $staff->refresh();
        $this->assertEquals('更新後的姓名', $staff->name['zh-TW']);
        $this->assertEquals('Updated Name', $staff->name['en']);
        $this->assertEquals('updated@example.com', $staff->email);
        $this->assertFalse($staff->visible);
        $this->assertEquals(5, $staff->sort_order);
    }

    // T013: 職員資料可以成功刪除
    public function test_staff_can_be_deleted(): void
    {
        $admin = User::factory()->admin()->create();
        $staff = Staff::factory()->create();

        $response = $this
            ->actingAs($admin)
            ->delete(route('manage.staff.destroy', $staff));

        $response->assertRedirect(route('manage.staff.index'));

        $this->assertSoftDeleted('staff', ['id' => $staff->id]);
    }

    // T013-1: 職員在職狀態可以在列表中切換
    public function test_staff_employment_status_can_be_toggled(): void
    {
        $admin = User::factory()->admin()->create();
        $staff = Staff::factory()->create([
            'employment_status' => 'active',
            'visible' => true,
        ]);

        $this
            ->from(route('manage.staff.index'))
            ->actingAs($admin)
            ->patch(route('manage.staff.toggle-status', $staff))
            ->assertRedirect(route('manage.staff.index'));

        $staff->refresh();
        $this->assertSame('inactive', $staff->employment_status);
        $this->assertFalse($staff->visible); // 停用時預設會自動隱藏

        $this
            ->from(route('manage.staff.index'))
            ->actingAs($admin)
            ->patch(route('manage.staff.toggle-status', $staff), [
                'status' => 'retired',
                'sync_visibility' => false,
            ])
            ->assertRedirect(route('manage.staff.index'));

        $staff->refresh();
        $this->assertSame('retired', $staff->employment_status);
        $this->assertFalse($staff->visible, '停用後手動切換狀態且不同步顯示時應維持原狀。');
    }

    // T013-2: 職員可直接切換前台顯示狀態
    public function test_staff_visibility_can_be_toggled(): void
    {
        $admin = User::factory()->admin()->create();
        $staff = Staff::factory()->create(['visible' => true]);

        $this
            ->from(route('manage.staff.index'))
            ->actingAs($admin)
            ->patch(route('manage.staff.toggle-visibility', $staff))
            ->assertRedirect(route('manage.staff.index'));

        $staff->refresh();
        $this->assertFalse($staff->visible);
    }

    // 額外測試：職員詳情頁面顯示完整資訊
    public function test_staff_show_displays_complete_information(): void
    {
        $admin = User::factory()->admin()->create();
        $staff = Staff::factory()->create([
            'name' => ['zh-TW' => '詳情測試', 'en' => 'Detail Test'],
            'name_en' => 'Detail Test',
            'position' => ['zh-TW' => '測試職位', 'en' => 'Test Position'],
            'bio' => ['zh-TW' => '詳細簡介', 'en' => 'Detailed Bio']
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('manage.staff.show', $staff));

        $response->assertSuccessful();
        $response->assertInertia(function ($page) use ($staff) {
            $page->component('manage/staff/show')
                ->where('staff.id', $staff->id)
                ->where('staff.name.zh-TW', '詳情測試')
                ->where('staff.bio.zh-TW', '詳細簡介');
        });
    }

    // 額外測試：非管理員用戶無法訪問管理功能
    public function test_non_admin_cannot_access_staff_management(): void
    {
        $user = User::factory()->create(); // 非管理員用戶
        $staff = Staff::factory()->create();

        $routes = [
            'manage.staff.index',
            'manage.staff.create',
            ['manage.staff.show', $staff],
            ['manage.staff.edit', $staff]
        ];

        foreach ($routes as $route) {
            $routeName = is_array($route) ? $route[0] : $route;
            $routeParams = is_array($route) ? array_slice($route, 1) : [];

            $response = $this
                ->actingAs($user)
                ->get(route($routeName, ...$routeParams));

            $response->assertRedirect(route('home'));
        }
    }
}
