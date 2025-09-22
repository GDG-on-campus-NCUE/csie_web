<?php

namespace Tests\Feature\Manage;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffManagementTest extends TestCase
{
    use RefreshDatabase;

    // T007: 職員列表頁面可以正確顯示並支援分頁
    public function test_staff_index_displays_paginated_staff_list(): void
    {
        $admin = User::factory()->admin()->create();

        // 建立測試資料
        Staff::factory()->count(15)->create();

        $response = $this
            ->actingAs($admin)
            ->get(route('manage.staff.index'));

        $response->assertSuccessful();
        $response->assertInertia(function ($page) {
            $page->component('Manage/Staff/Index')
                ->has('staff.data', 10) // 預設分頁大小
                ->has('staff.meta')
                ->where('staff.meta.total', 15);
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
            $page->component('Manage/Staff/Create')
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
            'position' => ['zh-TW' => '測試職位', 'en' => 'Test Position']
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('manage.staff.edit', $staff));

        $response->assertSuccessful();
        $response->assertInertia(function ($page) use ($staff) {
            $page->component('Manage/Staff/Edit')
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

        $this->assertDatabaseMissing('staff', ['id' => $staff->id]);
    }

    // 額外測試：職員詳情頁面顯示完整資訊
    public function test_staff_show_displays_complete_information(): void
    {
        $admin = User::factory()->admin()->create();
        $staff = Staff::factory()->create([
            'name' => ['zh-TW' => '詳情測試', 'en' => 'Detail Test'],
            'position' => ['zh-TW' => '測試職位', 'en' => 'Test Position'],
            'bio' => ['zh-TW' => '詳細簡介', 'en' => 'Detailed Bio']
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('manage.staff.show', $staff));

        $response->assertSuccessful();
        $response->assertInertia(function ($page) use ($staff) {
            $page->component('Manage/Staff/Show')
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

            $response->assertForbidden();
        }
    }
}
