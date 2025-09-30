<?php

namespace Tests\Feature\Manage\Admin;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StaffControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    /**
     * T007: Test StaffController@index
     * 測試職員列表頁面能正確載入
     */
    public function test_admin_can_view_staff_index(): void
    {
        // 建立測試資料
        $activeStaff = Staff::factory()->count(3)->create(['deleted_at' => null]);
        $trashedStaff = Staff::factory()->count(2)->trashed()->create();

        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.staff.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('manage/admin/staff/index')
                ->has('staff.active', 3)
                ->has('staff.trashed', 2)
                ->where('initialTab', 'teachers')
        );
    }

    /**
     * T007: Test tab switching functionality
     */
    public function test_staff_index_respects_tab_parameter(): void
    {
        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.staff.index', ['tab' => 'staff']));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->where('initialTab', 'staff')
        );
    }

    /**
     * T008: Test StaffController@create
     * 測試新增職員表單頁面
     */
    public function test_admin_can_view_staff_create_form(): void
    {
        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.staff.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('manage/admin/staff/create')
        );
    }

    /**
     * T008: Test unauthorized users cannot access create form
     */
    public function test_unauthorized_users_cannot_access_staff_create(): void
    {
        $user = User::factory()->user()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('manage.staff.create'));

        $response->assertRedirect(route('manage.dashboard'));
    }

    /**
     * T009: Test StaffController@store
     * 測試職員資料建立功能
     */
    public function test_admin_can_create_staff_with_valid_data(): void
    {
        $staffData = [
            'name' => '張三',
            'name_en' => 'Zhang San',
            'position' => '系辦職員',
            'position_en' => 'Department Staff',
            'email' => 'zhang.san@example.com',
            'phone' => '02-12345678',
            'bio' => '負責系務行政工作',
            'bio_en' => 'Responsible for administrative work',
            'sort_order' => 10,
            'visible' => true,
        ];

        $response = $this
            ->actingAs($this->admin)
            ->post(route('manage.staff.store'), $staffData);

        $response->assertRedirect(route('manage.staff.index'));

        $this->assertDatabaseHas('staff', [
            'name' => '張三',
            'name_en' => 'Zhang San',
            'email' => 'zhang.san@example.com',
        ]);
    }

    /**
     * T009: Test file upload functionality
     */
    public function test_admin_can_create_staff_with_photo(): void
    {
        Storage::fake('public');

        $staffData = [
            'name' => '李四',
            'name_en' => 'Li Si',
            'position' => '系辦助理',
            'position_en' => 'Department Assistant',
            'photo' => UploadedFile::fake()->image('staff.jpg', 300, 300),
            'visible' => true,
        ];

        $response = $this
            ->actingAs($this->admin)
            ->post(route('manage.staff.store'), $staffData);

        $response->assertRedirect(route('manage.staff.index'));

        $staff = Staff::where('name', '李四')->first();
        $this->assertNotNull($staff);
        $this->assertNotNull($staff->photo_url);
        $this->assertTrue(Storage::disk('public')->exists($staff->photo_url));
    }

    /**
     * T009: Test validation requirements
     */
    public function test_staff_store_validates_required_fields(): void
    {
        $response = $this
            ->actingAs($this->admin)
            ->post(route('manage.staff.store'), []);

        $response->assertSessionHasErrors(['name']);
    }

    /**
     * T009: Test email validation
     */
    public function test_staff_store_validates_email_format(): void
    {
        $staffData = [
            'name' => '王五',
            'email' => 'invalid-email',
        ];

        $response = $this
            ->actingAs($this->admin)
            ->post(route('manage.staff.store'), $staffData);

        $response->assertSessionHasErrors(['email']);
    }

    /**
     * T010: Test StaffController@edit
     * 測試編輯職員表單頁面
     */
    public function test_admin_can_view_staff_edit_form(): void
    {
        $staff = Staff::factory()->create();

        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.staff.edit', $staff));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('manage/admin/staff/edit')
                ->has('staff')
                ->where('staff.id', $staff->id)
        );
    }

    /**
     * T010: Test edit form with non-existent staff
     */
    public function test_staff_edit_returns_404_for_non_existent_staff(): void
    {
        $response = $this
            ->actingAs($this->admin)
            ->get(route('manage.staff.edit', 999));

        $response->assertNotFound();
    }

    /**
     * T011: Test StaffController@update
     * 測試職員資料更新功能
     */
    public function test_admin_can_update_staff_data(): void
    {
        $staff = Staff::factory()->create([
            'name' => '原始姓名',
            'email' => 'original@example.com',
        ]);

        $updateData = [
            'name' => '更新姓名',
            'name_en' => 'Updated Name',
            'position' => '更新職位',
            'position_en' => 'Updated Position',
            'email' => 'updated@example.com',
            'phone' => '02-87654321',
            'visible' => true,
        ];

        $response = $this
            ->actingAs($this->admin)
            ->put(route('manage.staff.update', $staff), $updateData);

        $response->assertRedirect(route('manage.staff.index'));

        $staff->refresh();
        $this->assertEquals('更新姓名', $staff->name);
        $this->assertEquals('updated@example.com', $staff->email);
    }

    /**
     * T011: Test update with photo replacement
     */
    public function test_admin_can_update_staff_photo(): void
    {
        Storage::fake('public');

        $staff = Staff::factory()->create([
            'photo_url' => 'staff/old-photo.jpg',
        ]);

        $updateData = [
            'name' => $staff->name,
            'name_en' => $staff->name_en,
            'position' => $staff->position,
            'position_en' => $staff->position_en,
            'photo' => UploadedFile::fake()->image('new-photo.jpg', 400, 400),
            'visible' => true,
        ];

        $response = $this
            ->actingAs($this->admin)
            ->put(route('manage.staff.update', $staff), $updateData);

        $response->assertRedirect(route('manage.staff.index'));

        $staff->refresh();
        $this->assertNotEquals('staff/old-photo.jpg', $staff->photo_url);
        $this->assertTrue(Storage::disk('public')->exists($staff->photo_url));
    }

    /**
     * T011: Test update validation
     */
    public function test_staff_update_validates_required_fields(): void
    {
        $staff = Staff::factory()->create();

        $response = $this
            ->actingAs($this->admin)
            ->put(route('manage.staff.update', $staff), [
                'name' => '', // Required field
            ]);

        $response->assertSessionHasErrors(['name']);
    }

    /**
     * T012: Test StaffController@destroy
     * 測試職員軟刪除功能
     */
    public function test_admin_can_soft_delete_staff(): void
    {
        $staff = Staff::factory()->create();

        $response = $this
            ->actingAs($this->admin)
            ->delete(route('manage.staff.destroy', $staff));

        $response->assertRedirect(route('manage.staff.index'));

        $this->assertSoftDeleted('staff', ['id' => $staff->id]);
    }

    /**
     * T012: Test restore functionality
     */
    public function test_admin_can_restore_soft_deleted_staff(): void
    {
        $staff = Staff::factory()->trashed()->create();

        $response = $this
            ->actingAs($this->admin)
            ->patch(route('manage.staff.restore', $staff->id));

        $response->assertRedirect(route('manage.staff.index'));

        $this->assertDatabaseHas('staff', [
            'id' => $staff->id,
            'deleted_at' => null,
        ]);
    }

    /**
     * T012: Test force delete functionality
     */
    public function test_admin_can_force_delete_staff(): void
    {
        $staff = Staff::factory()->trashed()->create();

        $response = $this
            ->actingAs($this->admin)
            ->delete(route('manage.staff.force-delete', $staff->id));

        $response->assertRedirect(route('manage.staff.index'));

        $this->assertDatabaseMissing('staff', ['id' => $staff->id]);
    }

    /**
     * T012: Test unauthorized deletion
     */
    public function test_unauthorized_users_cannot_delete_staff(): void
    {
        $user = User::factory()->user()->create();
        $staff = Staff::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete(route('manage.staff.destroy', $staff));

        $response->assertForbidden();

        $this->assertDatabaseHas('staff', [
            'id' => $staff->id,
            'deleted_at' => null,
        ]);
    }

    /**
     * Additional test: HTML sanitization
     */
    public function test_staff_bio_html_is_sanitized(): void
    {
        $staffData = [
            'name' => '測試職員',
            'name_en' => 'Test Staff',
            'position' => '測試職位',
            'position_en' => 'Test Position',
            'bio' => '<p>正常內容</p><script>alert("xss")</script>',
            'bio_en' => '<strong>Clean content</strong><iframe src="evil.com"></iframe>',
            'visible' => true,
        ];

        $response = $this
            ->actingAs($this->admin)
            ->post(route('manage.staff.store'), $staffData);

        $response->assertRedirect(route('manage.staff.index'));

        $staff = Staff::where('name', '測試職員')->first();
        $this->assertStringNotContainsString('<script>', $staff->bio);
        $this->assertStringNotContainsString('<iframe>', $staff->bio_en);
    }
}
