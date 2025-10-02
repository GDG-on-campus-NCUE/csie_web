<?php

namespace Tests\Feature\Manage\Admin;

use App\Models\ManageActivity;
use App\Models\Space;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * 使用者管理功能測試。
 * 測試管理員對使用者的 CRUD 操作、權限驗證、批次狀態更新與稽核日誌。
 */
class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 測試管理員可以查看使用者列表。
     */
    public function test_admin_can_view_user_list(): void
    {
        // 準備測試資料
        $admin = User::factory()->create(['role' => 'admin']);
        $users = User::factory()->count(3)->create();

        // 執行請求
        $response = $this->actingAs($admin)->get('/manage/admin/users');

        // 驗證回應
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('manage/admin/users/index')
            ->has('users.data', 4) // 包含 admin 本身
        );
    }

    /**
     * 測試一般使用者無法存取使用者管理頁面。
     */
    public function test_non_admin_cannot_access_user_management(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)->get('/manage/admin/users');

        $response->assertForbidden();
    }

    /**
     * 測試管理員可以更新使用者資料。
     */
    public function test_admin_can_update_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user', 'status' => 'active']);

        $response = $this->actingAs($admin)->putJson("/manage/admin/users/{$user->id}", [
            'name' => 'Updated Name',
            'email' => $user->email,
            'role' => 'teacher',
            'status' => 'active',
            'locale' => 'zh-TW',
            'spaces' => [],
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'role' => 'teacher',
        ]);

        // 驗證操作已記錄到稽核日誌
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $admin->id,
            'action' => 'user.updated',
            'subject_type' => User::class,
            'subject_id' => $user->id,
        ]);
    }

    /**
     * 測試管理員可以批次更新使用者狀態。
     */
    public function test_admin_can_bulk_update_user_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $users = User::factory()->count(3)->create(['status' => 'active']);

        $response = $this->actingAs($admin)->postJson('/manage/admin/users/bulk-status', [
            'user_ids' => $users->pluck('id')->toArray(),
            'status' => 'inactive',
        ]);

        $response->assertOk();
        $response->assertJson(['affected' => 3]);

        foreach ($users as $user) {
            $this->assertDatabaseHas('users', [
                'id' => $user->id,
                'status' => 0, // inactive
            ]);
        }

        // 驗證批次操作已記錄
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $admin->id,
            'action' => 'user.bulk_status_updated',
        ]);
    }

    /**
     * 測試管理員可以發送密碼重設連結。
     */
    public function test_admin_can_send_password_reset_link(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        $response = $this->actingAs($admin)->postJson("/manage/admin/users/{$user->id}/password-reset");

        $response->assertOk();

        // 驗證操作已記錄
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $admin->id,
            'action' => 'user.password_reset_link',
            'subject_type' => User::class,
            'subject_id' => $user->id,
        ]);
    }

    /**
     * 測試管理員可以模擬登入其他使用者。
     */
    public function test_admin_can_impersonate_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($admin)->post("/manage/admin/users/{$user->id}/impersonate");

        $response->assertRedirect('/manage/admin/dashboard');
        $this->assertEquals($user->id, auth()->id());

        // 驗證操作已記錄
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $admin->id,
            'action' => 'user.impersonated',
            'subject_type' => User::class,
            'subject_id' => $user->id,
        ]);
    }

    /**
     * 測試管理員可以為使用者綁定 Space。
     */
    public function test_admin_can_assign_spaces_to_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $spaces = Space::factory()->count(2)->create();

        $response = $this->actingAs($admin)->putJson("/manage/admin/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
            'locale' => $user->locale,
            'spaces' => $spaces->pluck('id')->toArray(),
        ]);

        $response->assertOk();

        // 驗證 Space 關聯已建立
        foreach ($spaces as $space) {
            $this->assertTrue($user->fresh()->spaces->contains($space->id));
        }
    }

    /**
     * 測試使用者列表支援角色篩選。
     */
    public function test_user_list_supports_role_filter(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(2)->create(['role' => 'teacher']);
        User::factory()->count(3)->create(['role' => 'user']);

        $response = $this->actingAs($admin)->get('/manage/admin/users?roles=teacher');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('users.data', 2)
        );
    }

    /**
     * 測試使用者列表支援狀態篩選。
     */
    public function test_user_list_supports_status_filter(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(2)->create(['status' => 'active']);
        User::factory()->count(3)->create(['status' => 'inactive']);

        $response = $this->actingAs($admin)->get('/manage/admin/users?statuses=active');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('users.data', 3) // 2 active + 1 admin (預設 active)
        );
    }

    /**
     * 測試使用者列表支援關鍵字搜尋。
     */
    public function test_user_list_supports_keyword_search(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $targetUser = User::factory()->create(['name' => 'John Doe']);
        User::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get('/manage/admin/users?keyword=John');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('users.data', 1)
            ->where('users.data.0.name', 'John Doe')
        );
    }

    /**
     * 測試使用者停用功能。
     */
    public function test_admin_can_deactivate_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['status' => 'active']);

        $response = $this->actingAs($admin)->delete("/manage/admin/users/{$user->id}");

        $response->assertRedirect();
        $this->assertSoftDeleted('users', ['id' => $user->id]);

        // 驗證操作已記錄
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $admin->id,
            'action' => 'user.deactivated',
            'subject_type' => User::class,
            'subject_id' => $user->id,
        ]);
    }

    /**
     * 測試查看使用者詳細資料。
     */
    public function test_admin_can_view_user_details(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        // 建立一些活動紀錄
        ManageActivity::log($admin, 'test.action', $user);

        $response = $this->actingAs($admin)->getJson("/manage/admin/users/{$user->id}");

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                'id',
                'name',
                'email',
                'role',
                'status',
                'recent_activities',
            ],
        ]);
    }
}
