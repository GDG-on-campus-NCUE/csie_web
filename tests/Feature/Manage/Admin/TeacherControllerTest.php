<?php

namespace Tests\Feature\Manage\Admin;

use App\Models\Teacher;
use App\Models\User;
use App\Models\Lab;
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
     * T013: Test TeacherController@create
     * 測試新增教師表單頁面
     */
    public function test_admin_can_view_teacher_create_form(): void
    {
        // 建立一些沒有關聯教師的使用者
        $availableUsers = User::factory()->count(3)->create(['role' => 'teacher']);

        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.teachers.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('manage/admin/teachers/create')
                ->has('users', 3)
        );
    }

    /**
     * T013: Test create form excludes users already associated with teachers
     */
    public function test_teacher_create_form_excludes_associated_users(): void
    {
        $availableUser = User::factory()->create(['role' => 'teacher']);
        $associatedUser = User::factory()->create(['role' => 'teacher']);

        // 建立已關聯的教師
        Teacher::factory()->create(['user_id' => $associatedUser->id]);

        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.teachers.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->has('users', 1)
                ->whereContains('users', fn ($user) => $user['id'] === $availableUser->id)
                ->whereNotContains('users', fn ($user) => $user['id'] === $associatedUser->id)
        );
    }

    /**
     * T013: Test unauthorized access to create form
     */
    public function test_unauthorized_users_cannot_access_teacher_create(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this
            ->actingAs($user)
            ->get(route('manage.teachers.create'));

        $response->assertForbidden();
    }

    /**
     * T014: Test TeacherController@store
     * 測試教師資料建立功能
     */
    public function test_admin_can_create_teacher_with_valid_data(): void
    {
        $user = User::factory()->create(['role' => 'teacher']);

        $teacherData = [
            'user_id' => $user->id,
            'name' => '陳教授',
            'name_en' => 'Prof. Chen',
            'title' => '副教授',
            'title_en' => 'Associate Professor',
            'email' => 'prof.chen@example.com',
            'phone' => '02-12345678',
            'office' => 'E301',
            'job_title' => '系主任',
            'bio' => '專精於資料庫系統研究',
            'bio_en' => 'Specializes in database systems research',
            'expertise' => '資料庫系統,機器學習',
            'expertise_en' => 'Database Systems, Machine Learning',
            'education' => '台灣大學資訊工程博士',
            'education_en' => 'Ph.D. in Computer Science, National Taiwan University',
            'sort_order' => 10,
            'visible' => true,
        ];

        $response = $this
            ->actingAs($this->admin)
            ->post(route('manage.teachers.store'), $teacherData);

        $response->assertRedirect(route('manage.teachers.index'));

        $this->assertDatabaseHas('teachers', [
            'name' => '陳教授',
            'name_en' => 'Prof. Chen',
            'email' => 'prof.chen@example.com',
            'user_id' => $user->id,
        ]);
    }

    /**
     * T014: Test teacher creation without user association
     */
    public function test_admin_can_create_teacher_without_user(): void
    {
        $teacherData = [
            'user_id' => null,
            'name' => '李教授',
            'title' => '教授',
            'email' => 'prof.li@example.com',
            'sort_order' => 0,
            'visible' => true,
        ];

        $response = $this
            ->actingAs($this->admin)
            ->post(route('manage.teachers.store'), $teacherData);

        $response->assertRedirect(route('manage.teachers.index'));

        $this->assertDatabaseHas('teachers', [
            'name' => '李教授',
            'user_id' => null,
        ]);
    }

    /**
     * T014: Test validation requirements
     */
    public function test_teacher_store_validates_required_fields(): void
    {
        $response = $this
            ->actingAs($this->admin)
            ->post(route('manage.teachers.store'), []);

        $response->assertSessionHasErrors(['name', 'title']);
    }

    /**
     * T014: Test email validation
     */
    public function test_teacher_store_validates_email_format(): void
    {
        $teacherData = [
            'name' => '王教授',
            'title' => '助理教授',
            'email' => 'invalid-email-format',
            'sort_order' => 0,
            'visible' => true,
        ];

        $response = $this
            ->actingAs($this->admin)
            ->post(route('manage.teachers.store'), $teacherData);

        $response->assertSessionHasErrors(['email']);
    }

    /**
     * T015: Test TeacherController@show
     * 測試教師詳細資訊頁面
     */
    public function test_admin_can_view_teacher_details(): void
    {
        $user = User::factory()->create();
        $labs = Lab::factory()->count(2)->create();

        $teacher = Teacher::factory()->create(['user_id' => $user->id]);
        $teacher->labs()->attach($labs->pluck('id'));

        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.teachers.show', $teacher));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('manage/admin/teachers/show')
                ->has('teacher')
                ->where('teacher.id', $teacher->id)
                ->has('teacher.user')
                ->has('teacher.labs', 2)
        );
    }

    /**
     * T015: Test show page with non-existent teacher
     */
    public function test_teacher_show_returns_404_for_non_existent_teacher(): void
    {
        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.teachers.show', 999));

        $response->assertNotFound();
    }

    /**
     * T016: Test TeacherController@edit
     * 測試編輯教師表單頁面
     */
    public function test_admin_can_view_teacher_edit_form(): void
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $teacher = Teacher::factory()->create(['user_id' => $user->id]);

        // 建立一些可供選擇的使用者
        $otherUsers = User::factory()->count(2)->create(['role' => 'teacher']);

        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.teachers.edit', $teacher));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('manage/admin/teachers/edit')
                ->has('teacher')
                ->where('teacher.id', $teacher->id)
                ->has('users') // Should include unassigned users + current user
        );
    }

    /**
     * T016: Test edit form includes current user in available users
     */
    public function test_teacher_edit_form_includes_current_user(): void
    {
        $currentUser = User::factory()->create(['role' => 'teacher']);
        $teacher = Teacher::factory()->create(['user_id' => $currentUser->id]);

        // 建立另一個已關聯的教師（不應出現在選項中）
        $otherUser = User::factory()->create(['role' => 'teacher']);
        Teacher::factory()->create(['user_id' => $otherUser->id]);

        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.teachers.edit', $teacher));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->whereContains('users', fn ($user) => $user['id'] === $currentUser->id)
                ->whereNotContains('users', fn ($user) => $user['id'] === $otherUser->id)
        );
    }

    /**
     * T017: Test TeacherController@update
     * 測試教師資料更新功能
     */
    public function test_admin_can_update_teacher_data(): void
    {
        $teacher = Teacher::factory()->create([
            'name' => '原始姓名',
            'email' => 'original@example.com',
        ]);

        $updateData = [
            'name' => '更新姓名',
            'name_en' => 'Updated Name',
            'title' => '更新職稱',
            'title_en' => 'Updated Title',
            'email' => 'updated@example.com',
            'phone' => '02-87654321',
            'expertise' => '更新專長',
            'sort_order' => 0,
            'visible' => true,
        ];

        $response = $this
            ->actingAs($this->admin)
            ->put(route('manage.teachers.update', $teacher), $updateData);

        $response->assertRedirect(route('manage.teachers.index'));

        $teacher->refresh();
        $this->assertEquals('更新姓名', $teacher->name);
        $this->assertEquals('updated@example.com', $teacher->email);
        $this->assertEquals('更新專長', $teacher->expertise);
    }

    /**
     * T017: Test user association update
     */
    public function test_admin_can_update_teacher_user_association(): void
    {
        $oldUser = User::factory()->create(['role' => 'teacher']);
        $newUser = User::factory()->create(['role' => 'teacher']);

        $teacher = Teacher::factory()->create(['user_id' => $oldUser->id]);

        $updateData = [
            'user_id' => $newUser->id,
            'name' => $teacher->name,
            'title' => $teacher->title,
            'sort_order' => 0,
            'visible' => true,
        ];

        $response = $this
            ->actingAs($this->admin)
            ->put(route('manage.teachers.update', $teacher), $updateData);

        $response->assertRedirect(route('manage.teachers.index'));

        $teacher->refresh();
        $this->assertEquals($newUser->id, $teacher->user_id);
    }

    /**
     * T017: Test update validation
     */
    public function test_teacher_update_validates_required_fields(): void
    {
        $teacher = Teacher::factory()->create();

        $response = $this
            ->actingAs($this->admin)
            ->put(route('manage.teachers.update', $teacher), [
                'name' => '', // Required field
                'title' => '', // Required field
            ]);

        $response->assertSessionHasErrors(['name', 'title']);
    }

    /**
     * T018: Test TeacherController@destroy
     * 測試教師刪除功能
     */
    public function test_admin_can_delete_teacher(): void
    {
        $teacher = Teacher::factory()->create();

        $response = $this
            ->actingAs($this->admin)
            ->delete(route('manage.teachers.destroy', $teacher));

        $response->assertRedirect(route('manage.teachers.index'));

        $this->assertDatabaseMissing('teachers', ['id' => $teacher->id]);
    }

    /**
     * T018: Test unauthorized deletion
     */
    public function test_unauthorized_users_cannot_delete_teacher(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $teacher = Teacher::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete(route('manage.teachers.destroy', $teacher));

        $response->assertForbidden();

        $this->assertDatabaseHas('teachers', ['id' => $teacher->id]);
    }

    /**
     * T018: Test deletion with associated user (user should remain)
     */
    public function test_teacher_deletion_preserves_associated_user(): void
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $teacher = Teacher::factory()->create(['user_id' => $user->id]);

        $response = $this
            ->actingAs($this->admin)
            ->delete(route('manage.teachers.destroy', $teacher));

        $response->assertRedirect(route('manage.teachers.index'));

        $this->assertDatabaseMissing('teachers', ['id' => $teacher->id]);
        $this->assertDatabaseHas('users', ['id' => $user->id]); // User should remain
    }

    /**
     * Additional test: HTML sanitization
     */
    public function test_teacher_bio_html_is_sanitized(): void
    {
        $teacherData = [
            'name' => '測試教授',
            'title' => '教授',
            'bio' => '<p>正常內容</p><script>alert("xss")</script>',
            'bio_en' => '<strong>Clean content</strong><iframe src="evil.com"></iframe>',
            'sort_order' => 0,
            'visible' => true,
        ];

        $response = $this
            ->actingAs($this->admin)
            ->post(route('manage.teachers.store'), $teacherData);

        $response->assertRedirect(route('manage.teachers.index'));

        $teacher = Teacher::where('name', '測試教授')->first();
        $this->assertStringNotContainsString('<script>', $teacher->bio);
        $this->assertStringNotContainsString('<iframe>', $teacher->bio_en);
    }

    /**
     * Additional test: Teacher index redirect functionality
     */
    public function test_teacher_index_redirects_to_staff_index_with_teachers_tab(): void
    {
        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.teachers.index'));

        $response->assertRedirect(route('manage.staff.index', ['tab' => 'teachers']));
    }

    /**
     * Additional test: Teacher index redirect preserves query parameters
     */
    public function test_teacher_index_redirect_preserves_query_parameters(): void
    {
        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.teachers.index', ['per_page' => 50, 'search' => 'test']));

        $response->assertRedirect(route('manage.staff.index', [
            'tab' => 'teachers',
            'per_page' => 50,
            'search' => 'test',
        ]));
    }
}
