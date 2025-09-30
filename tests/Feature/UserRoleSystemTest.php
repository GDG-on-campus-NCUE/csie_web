<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Person;
use App\Models\Role;
use App\Services\UserRoleProfileSynchronizer;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserRoleSystemTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // 建立基本角色
        Role::create(['name' => 'admin', 'display_name' => '管理員', 'priority' => 100]);
        Role::create(['name' => 'teacher', 'display_name' => '教師', 'priority' => 80]);
        Role::create(['name' => 'staff', 'display_name' => '職員', 'priority' => 60]);
        Role::create(['name' => 'user', 'display_name' => '一般會員', 'priority' => 20]);
    }

    public function test_user_can_have_multiple_roles()
    {
        $user = User::factory()->create();
        $person = Person::factory()->create();

        $synchronizer = new UserRoleProfileSynchronizer();
        $synchronizer->synchronizeUserProfile($user, ['teacher', 'staff'], $person);

        $this->assertTrue($user->hasRole('teacher'));
        $this->assertTrue($user->hasRole('staff'));
        $this->assertFalse($user->hasRole('admin'));

        $roles = $user->getActiveRoles();
        $this->assertContains('teacher', $roles);
        $this->assertContains('staff', $roles);
    }

    public function test_role_hierarchy_works_correctly()
    {
        $user = User::factory()->create();
        $synchronizer = new UserRoleProfileSynchronizer();

        // 設定為教師角色
        $synchronizer->synchronizeUserProfile($user, ['teacher']);

        $this->assertTrue($user->hasRoleOrHigher('user'));
        $this->assertTrue($user->hasRoleOrHigher('teacher'));
        $this->assertFalse($user->hasRoleOrHigher('admin'));
    }

    public function test_person_profiles_are_created_correctly()
    {
        $user = User::factory()->create();
        $person = Person::factory()->create();

        $synchronizer = new UserRoleProfileSynchronizer();
        $synchronizer->synchronizeUserProfile($user, ['teacher', 'staff'], $person);

        $this->assertNotNull($person->teacherProfile);
        $this->assertNotNull($person->staffProfile);
    }

    public function test_role_deactivation_works()
    {
        $user = User::factory()->create();
        $person = Person::factory()->create();

        $synchronizer = new UserRoleProfileSynchronizer();

        // 先指派多個角色
        $synchronizer->synchronizeUserProfile($user, ['teacher', 'staff'], $person);
        $this->assertTrue($user->hasRole('teacher'));
        $this->assertTrue($user->hasRole('staff'));

        // 移除 staff 角色
        $synchronizer->synchronizeUserProfile($user, ['teacher'], $person);
        $this->assertTrue($user->hasRole('teacher'));
        $this->assertFalse($user->hasRole('staff'));
    }

    public function test_person_status_affects_user_roles()
    {
        $user = User::factory()->create();
        $person = Person::factory()->create();

        $synchronizer = new UserRoleProfileSynchronizer();
        $synchronizer->synchronizeUserProfile($user, ['teacher'], $person);

        $this->assertTrue($user->hasRole('teacher'));

        // 停用人員
        $synchronizer->updatePersonStatus($person, 'inactive');

        // 重新載入資料
        $user->refresh();

        // 角色應該被停用
        $this->assertFalse($user->hasRole('teacher'));
    }

    public function test_backward_compatibility_role_attribute()
    {
        $user = User::factory()->create();
        $synchronizer = new UserRoleProfileSynchronizer();

        // 設定為管理員
        $synchronizer->synchronizeUserProfile($user, ['admin']);

        // 應該返回最高權限的角色
        $this->assertEquals('admin', $user->role);

        // 設定多個角色
        $synchronizer->synchronizeUserProfile($user, ['teacher', 'staff']);

        // 應該返回權限較高的教師角色
        $this->assertEquals('teacher', $user->role);
    }
}
