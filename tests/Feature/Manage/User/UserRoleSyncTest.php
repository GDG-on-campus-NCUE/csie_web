<?php

namespace Tests\Feature\Manage\User;

use App\Events\UserRoleProfilesSynced;
use App\Models\Staff;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class UserRoleSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_admin_user_creates_staff_profile(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this
            ->actingAs($admin)
            ->post(route('manage.users.store'), [
                'name' => '管理員甲',
                'email' => 'admin-sync@example.com',
                'role' => 'admin',
                'status' => 'active',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'email_verified' => true,
            ]);

        $response->assertRedirect(route('manage.users.index'));

        $user = User::where('email', 'admin-sync@example.com')->first();
        $this->assertNotNull($user);

        $staffProfile = $user->staff()->first();
        $this->assertNotNull($staffProfile);
        $this->assertSame('active', $staffProfile->employment_status);
        $this->assertTrue($staffProfile->visible);
        $this->assertNotNull($staffProfile->employment_started_at);
        $this->assertNull($staffProfile->employment_ended_at);
        $this->assertSame('admin-sync@example.com', $staffProfile->email);
    }

    public function test_creating_teacher_user_creates_teacher_profile(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this
            ->actingAs($admin)
            ->post(route('manage.users.store'), [
                'name' => '教師乙',
                'email' => 'teacher-sync@example.com',
                'role' => 'teacher',
                'status' => 'active',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertRedirect(route('manage.users.index'));

        $user = User::where('email', 'teacher-sync@example.com')->first();
        $this->assertNotNull($user);

        $teacherProfile = $user->teacher()->first();
        $this->assertNotNull($teacherProfile);
        $this->assertSame('active', $teacherProfile->employment_status);
        $this->assertTrue($teacherProfile->visible);
        $this->assertNotNull($teacherProfile->employment_started_at);
        $this->assertNull($teacherProfile->employment_ended_at);
        $this->assertSame('teacher-sync@example.com', $teacherProfile->email);

        $this->assertFalse($user->staff()->exists());
    }

    public function test_role_transitions_update_related_profiles(): void
    {
        $admin = User::factory()->admin()->create();

        $this
            ->actingAs($admin)
            ->post(route('manage.users.store'), [
                'name' => '角色測試',
                'email' => 'role-sync@example.com',
                'role' => 'admin',
                'status' => 'active',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $user = User::where('email', 'role-sync@example.com')->firstOrFail();

        // 轉換為教師角色
        $this
            ->actingAs($admin)
            ->put(route('manage.users.update', $user), [
                'name' => '角色測試',
                'email' => 'role-sync@example.com',
                'role' => 'teacher',
                'status' => 'active',
                'email_verified' => true,
            ]);

        $teacherProfile = $user->fresh()->teacher()->first();
        $this->assertNotNull($teacherProfile);
        $this->assertSame('active', $teacherProfile->employment_status);
        $this->assertTrue($teacherProfile->visible);
        $this->assertNotNull($teacherProfile->employment_started_at);
        $this->assertNull($teacherProfile->employment_ended_at);

        $staffProfile = Staff::where('user_id', $user->id)->first();
        $this->assertNotNull($staffProfile);
        $this->assertSame('inactive', $staffProfile->employment_status);
        $this->assertFalse($staffProfile->visible);
        $this->assertNull($staffProfile->employment_ended_at);

        // 轉換為一般會員
        $this
            ->actingAs($admin)
            ->put(route('manage.users.update', $user), [
                'name' => '角色測試',
                'email' => 'role-sync@example.com',
                'role' => 'user',
                'status' => 'active',
            ]);

        $teacherProfile = Teacher::where('user_id', $user->id)->first();
        $this->assertNotNull($teacherProfile);
        $this->assertSame('retired', $teacherProfile->employment_status);
        $this->assertFalse($teacherProfile->visible);
        $this->assertNotNull($teacherProfile->employment_ended_at);

        $staffProfile = Staff::where('user_id', $user->id)->first();
        $this->assertNotNull($staffProfile);
        $this->assertSame('retired', $staffProfile->employment_status);
        $this->assertFalse($staffProfile->visible);
        $this->assertNotNull($staffProfile->employment_ended_at);

        // 再次升為管理員
        $this
            ->actingAs($admin)
            ->put(route('manage.users.update', $user), [
                'name' => '角色測試',
                'email' => 'role-sync@example.com',
                'role' => 'admin',
                'status' => 'active',
            ]);

        $staffProfile = Staff::where('user_id', $user->id)->first();
        $this->assertNotNull($staffProfile);
        $this->assertSame('active', $staffProfile->employment_status);
        $this->assertTrue($staffProfile->visible);
        $this->assertNull($staffProfile->employment_ended_at);

        $teacherProfile = Teacher::where('user_id', $user->id)->first();
        $this->assertNotNull($teacherProfile);
        $this->assertSame('inactive', $teacherProfile->employment_status);
        $this->assertFalse($teacherProfile->visible);
    }

    public function test_soft_delete_and_restore_updates_profiles_and_dispatches_events(): void
    {
        $admin = User::factory()->admin()->create();

        $this
            ->actingAs($admin)
            ->post(route('manage.users.store'), [
                'name' => '刪除測試',
                'email' => 'deletion-sync@example.com',
                'role' => 'teacher',
                'status' => 'active',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $user = User::where('email', 'deletion-sync@example.com')->firstOrFail();
        $teacherProfile = $user->teacher()->first();
        $this->assertNotNull($teacherProfile);
        $this->assertSame('active', $teacherProfile->employment_status);

        Event::fake([UserRoleProfilesSynced::class]);

        $this
            ->actingAs($admin)
            ->delete(route('manage.users.destroy', $user));

        Event::assertDispatchedTimes(UserRoleProfilesSynced::class, 1);

        $teacherProfile = Teacher::withTrashed()->where('user_id', $user->id)->first();
        $this->assertNotNull($teacherProfile);
        $this->assertSame('retired', $teacherProfile->employment_status);
        $this->assertFalse($teacherProfile->visible);
        $this->assertNotNull($teacherProfile->employment_ended_at);

        $staffProfile = Staff::withTrashed()->where('user_id', $user->id)->first();
        if ($staffProfile) {
            $this->assertSame('retired', $staffProfile->employment_status);
            $this->assertFalse($staffProfile->visible);
        }

        $user = User::withTrashed()->findOrFail($user->id);
        $this->assertTrue($user->trashed());
        $this->assertSame('suspended', $user->status);

        Event::fake([UserRoleProfilesSynced::class]);

        $this
            ->actingAs($admin)
            ->post(route('manage.users.restore', $user->id));

        Event::assertDispatchedTimes(UserRoleProfilesSynced::class, 1);

        $user = $user->fresh();
        $this->assertFalse($user->trashed());
        $this->assertSame('active', $user->status);

        $teacherProfile = Teacher::where('user_id', $user->id)->first();
        $this->assertNotNull($teacherProfile);
        $this->assertSame('active', $teacherProfile->employment_status);
        $this->assertTrue($teacherProfile->visible);
        $this->assertNull($teacherProfile->employment_ended_at);

        $staffProfile = Staff::where('user_id', $user->id)->first();
        if ($staffProfile) {
            $this->assertSame($user->role === 'admin' ? 'active' : 'retired', $staffProfile->employment_status);
        }
    }
}
