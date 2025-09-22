<?php

namespace Tests\Feature\Manage;

use App\Models\Lab;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherManagementTest extends TestCase
{
    use RefreshDatabase;

    // T014: 教師列表頁面可以正確顯示並支援分頁和篩選
    public function test_teacher_index_displays_paginated_teacher_list_with_filters(): void
    {
        $admin = User::factory()->admin()->create();

        // 建立測試資料
        Teacher::factory()->count(15)->create();
        Teacher::factory()->count(5)->create(['visible' => false]);

        $response = $this
            ->actingAs($admin)
            ->get(route('manage.teachers.index'));

        $response->assertSuccessful();
        $response->assertInertia(function ($page) {
            $page->component('Manage/Teacher/Index')
                ->has('teachers.data', 10) // 預設分頁大小
                ->has('teachers.meta')
                ->where('teachers.meta.total', 20);
        });

        // 測試可見性篩選
        $response = $this
            ->actingAs($admin)
            ->get(route('manage.teachers.index', ['visible' => 'false']));

        $response->assertInertia(function ($page) {
            $page->has('teachers.data', 5);
        });
    }

    // T015: 教師新增表單包含所有必要欄位和關聯選項
    public function test_teacher_create_form_displays_all_required_fields_and_relations(): void
    {
        $admin = User::factory()->admin()->create();

        // 建立關聯資料
        $users = User::factory()->count(3)->create();
        $labs = Lab::factory()->count(2)->create();

        $response = $this
            ->actingAs($admin)
            ->get(route('manage.teachers.create'));

        $response->assertSuccessful();
        $response->assertInertia(function ($page) {
            $page->component('Manage/Teacher/Create')
                ->has('teacher') // 應該包含空的 teacher 物件
                ->has('users', 3) // 可用的使用者選項
                ->has('labs', 2); // 可用的實驗室選項
        });
    }

    // T016: 教師資料可以成功新增並建立關聯
    public function test_teacher_can_be_created_with_relations(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        $lab = Lab::factory()->create();

        $teacherData = [
            'user_id' => $user->id,
            'lab_id' => $lab->id,
            'name' => [
                'zh-TW' => '張教授',
                'en' => 'Prof. Zhang'
            ],
            'title' => [
                'zh-TW' => '教授',
                'en' => 'Professor'
            ],
            'email' => 'prof.zhang@example.com',
            'phone' => '02-1234-5678',
            'office' => 'C301',
            'bio' => [
                'zh-TW' => '專精於計算機科學',
                'en' => 'Specializes in Computer Science'
            ],
            'specialties' => [
                ['zh-TW' => '機器學習', 'en' => 'Machine Learning'],
                ['zh-TW' => '資料探勘', 'en' => 'Data Mining']
            ],
            'education' => [
                ['zh-TW' => '國立台灣大學資訊工程博士', 'en' => 'Ph.D. in Computer Science, National Taiwan University'],
                ['zh-TW' => '國立清華大學資訊工程碩士', 'en' => 'M.S. in Computer Science, National Tsing Hua University']
            ],
            'website' => 'https://prof-zhang.example.com',
            'visible' => true,
            'sort_order' => 1
        ];

        $response = $this
            ->actingAs($admin)
            ->post(route('manage.teachers.store'), $teacherData);

        $response->assertRedirect(route('manage.teachers.index'));

        $teacher = Teacher::where('email', 'prof.zhang@example.com')->first();
        $this->assertNotNull($teacher);
        $this->assertEquals($user->id, $teacher->user_id);
        $this->assertEquals($lab->id, $teacher->lab_id);
        $this->assertEquals('張教授', $teacher->name['zh-TW']);
        $this->assertEquals('Prof. Zhang', $teacher->name['en']);
        $this->assertEquals('機器學習', $teacher->specialties[0]['zh-TW']);
        $this->assertEquals('Machine Learning', $teacher->specialties[0]['en']);
    }

    // T017: 教師資料驗證規則包含必填欄位和格式驗證
    public function test_teacher_validation_rules_work_correctly(): void
    {
        $admin = User::factory()->admin()->create();

        // 測試必填欄位
        $response = $this
            ->actingAs($admin)
            ->post(route('manage.teachers.store'), []);

        $response->assertSessionHasErrors(['name.zh-TW', 'title.zh-TW', 'email']);

        // 測試 email 格式驗證
        $response = $this
            ->actingAs($admin)
            ->post(route('manage.teachers.store'), [
                'name' => ['zh-TW' => '測試教師'],
                'title' => ['zh-TW' => '測試職稱'],
                'email' => 'invalid-email'
            ]);

        $response->assertSessionHasErrors(['email']);

        // 測試 website URL 格式驗證
        $response = $this
            ->actingAs($admin)
            ->post(route('manage.teachers.store'), [
                'name' => ['zh-TW' => '測試教師'],
                'title' => ['zh-TW' => '測試職稱'],
                'email' => 'test@example.com',
                'website' => 'not-a-url'
            ]);

        $response->assertSessionHasErrors(['website']);

        // 測試 email 唯一性
        $existingTeacher = Teacher::factory()->create(['email' => 'existing@example.com']);

        $response = $this
            ->actingAs($admin)
            ->post(route('manage.teachers.store'), [
                'name' => ['zh-TW' => '測試教師'],
                'title' => ['zh-TW' => '測試職稱'],
                'email' => 'existing@example.com'
            ]);

        $response->assertSessionHasErrors(['email']);
    }

    // T018: 教師編輯表單正確載入現有資料和關聯
    public function test_teacher_edit_form_loads_existing_data_and_relations(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        $lab = Lab::factory()->create();

        $teacher = Teacher::factory()->create([
            'user_id' => $user->id,
            'lab_id' => $lab->id,
            'name' => ['zh-TW' => '測試教師', 'en' => 'Test Teacher'],
            'title' => ['zh-TW' => '助理教授', 'en' => 'Assistant Professor'],
            'specialties' => [
                ['zh-TW' => '人工智慧', 'en' => 'Artificial Intelligence']
            ]
        ]);

        // 建立額外的選項資料
        $additionalUsers = User::factory()->count(2)->create();
        $additionalLabs = Lab::factory()->count(2)->create();

        $response = $this
            ->actingAs($admin)
            ->get(route('manage.teachers.edit', $teacher));

        $response->assertSuccessful();
        $response->assertInertia(function ($page) use ($teacher, $user, $lab) {
            $page->component('Manage/Teacher/Edit')
                ->where('teacher.id', $teacher->id)
                ->where('teacher.user_id', $user->id)
                ->where('teacher.lab_id', $lab->id)
                ->where('teacher.name.zh-TW', '測試教師')
                ->where('teacher.specialties.0.zh-TW', '人工智慧')
                ->has('users', 3) // 包含關聯的 user 和額外的 users
                ->has('labs', 3); // 包含關聯的 lab 和額外的 labs
        });
    }

    // T019: 教師資料可以成功更新包含關聯變更
    public function test_teacher_can_be_updated_with_relation_changes(): void
    {
        $admin = User::factory()->admin()->create();
        $originalUser = User::factory()->create();
        $originalLab = Lab::factory()->create();
        $newUser = User::factory()->create();
        $newLab = Lab::factory()->create();

        $teacher = Teacher::factory()->create([
            'user_id' => $originalUser->id,
            'lab_id' => $originalLab->id
        ]);

        $updatedData = [
            'user_id' => $newUser->id,
            'lab_id' => $newLab->id,
            'name' => [
                'zh-TW' => '更新後的教師',
                'en' => 'Updated Teacher'
            ],
            'title' => [
                'zh-TW' => '副教授',
                'en' => 'Associate Professor'
            ],
            'email' => 'updated@example.com',
            'phone' => '02-9876-5432',
            'office' => 'D401',
            'bio' => [
                'zh-TW' => '更新後的簡介',
                'en' => 'Updated Bio'
            ],
            'specialties' => [
                ['zh-TW' => '深度學習', 'en' => 'Deep Learning'],
                ['zh-TW' => '自然語言處理', 'en' => 'Natural Language Processing']
            ],
            'education' => [
                ['zh-TW' => '更新後的學歷', 'en' => 'Updated Education']
            ],
            'website' => 'https://updated.example.com',
            'visible' => false,
            'sort_order' => 10
        ];

        $response = $this
            ->actingAs($admin)
            ->put(route('manage.teachers.update', $teacher), $updatedData);

        $response->assertRedirect(route('manage.teachers.index'));

        $teacher->refresh();
        $this->assertEquals($newUser->id, $teacher->user_id);
        $this->assertEquals($newLab->id, $teacher->lab_id);
        $this->assertEquals('更新後的教師', $teacher->name['zh-TW']);
        $this->assertEquals('Updated Teacher', $teacher->name['en']);
        $this->assertEquals('副教授', $teacher->title['zh-TW']);
        $this->assertEquals('深度學習', $teacher->specialties[0]['zh-TW']);
        $this->assertEquals('Deep Learning', $teacher->specialties[0]['en']);
        $this->assertEquals('自然語言處理', $teacher->specialties[1]['zh-TW']);
        $this->assertEquals('updated@example.com', $teacher->email);
        $this->assertFalse($teacher->visible);
        $this->assertEquals(10, $teacher->sort_order);
    }

    // T020: 教師資料可以成功刪除
    public function test_teacher_can_be_deleted(): void
    {
        $admin = User::factory()->admin()->create();
        $teacher = Teacher::factory()->create();

        $response = $this
            ->actingAs($admin)
            ->delete(route('manage.teachers.destroy', $teacher));

        $response->assertRedirect(route('manage.teachers.index'));

        $this->assertDatabaseMissing('teachers', ['id' => $teacher->id]);
    }

    // 額外測試：教師詳情頁面顯示完整資訊和關聯
    public function test_teacher_show_displays_complete_information_with_relations(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create(['name' => '關聯使用者']);
        $lab = Lab::factory()->create([
            'name' => ['zh-TW' => '人工智慧實驗室', 'en' => 'AI Lab']
        ]);

        $teacher = Teacher::factory()->create([
            'user_id' => $user->id,
            'lab_id' => $lab->id,
            'name' => ['zh-TW' => '詳情測試教師', 'en' => 'Detail Test Teacher'],
            'title' => ['zh-TW' => '教授', 'en' => 'Professor'],
            'specialties' => [
                ['zh-TW' => '機器學習', 'en' => 'Machine Learning']
            ]
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('manage.teachers.show', $teacher));

        $response->assertSuccessful();
        $response->assertInertia(function ($page) use ($teacher, $user, $lab) {
            $page->component('Manage/Teacher/Show')
                ->where('teacher.id', $teacher->id)
                ->where('teacher.name.zh-TW', '詳情測試教師')
                ->where('teacher.user.name', '關聯使用者')
                ->where('teacher.lab.name.zh-TW', '人工智慧實驗室');
        });
    }

    // 額外測試：非管理員用戶無法訪問教師管理功能
    public function test_non_admin_cannot_access_teacher_management(): void
    {
        $user = User::factory()->create(); // 非管理員用戶
        $teacher = Teacher::factory()->create();

        $routes = [
            'manage.teachers.index',
            'manage.teachers.create',
            ['manage.teachers.show', $teacher],
            ['manage.teachers.edit', $teacher]
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

    // 額外測試：教師可以不關聯 user 和 lab（可選關聯）
    public function test_teacher_can_be_created_without_user_and_lab_relations(): void
    {
        $admin = User::factory()->admin()->create();

        $teacherData = [
            'user_id' => null,
            'lab_id' => null,
            'name' => [
                'zh-TW' => '獨立教師',
                'en' => 'Independent Teacher'
            ],
            'title' => [
                'zh-TW' => '講師',
                'en' => 'Lecturer'
            ],
            'email' => 'independent@example.com',
            'visible' => true,
            'sort_order' => 1
        ];

        $response = $this
            ->actingAs($admin)
            ->post(route('manage.teachers.store'), $teacherData);

        $response->assertRedirect(route('manage.teachers.index'));

        $teacher = Teacher::where('email', 'independent@example.com')->first();
        $this->assertNotNull($teacher);
        $this->assertNull($teacher->user_id);
        $this->assertNull($teacher->lab_id);
        $this->assertEquals('獨立教師', $teacher->name['zh-TW']);
    }
}
