<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Services\UserRoleProfileSynchronizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleSystemTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin', 'display_name' => '管理員', 'priority' => 100]);
        Role::create(['name' => 'teacher', 'display_name' => '教師', 'priority' => 80]);
        Role::create(['name' => 'user', 'display_name' => '一般會員', 'priority' => 20]);
    }

    public function test_user_roles_can_be_synchronized(): void
    {
        $user = User::factory()->create();
        $synchronizer = new UserRoleProfileSynchronizer();

        $synchronizer->synchronizeUserProfile($user, ['teacher']);

        $this->assertTrue($user->hasRole('teacher'));
        $this->assertTrue($user->hasRoleOrHigher('user'));
        $this->assertFalse($user->hasRole('admin'));
    }

    public function test_roles_are_deactivated_when_removed(): void
    {
        $user = User::factory()->create();
        $synchronizer = new UserRoleProfileSynchronizer();

        $synchronizer->synchronizeUserProfile($user, ['admin', 'teacher']);
        $this->assertTrue($user->hasRole('admin'));
        $this->assertTrue($user->hasRole('teacher'));

        $synchronizer->synchronizeUserProfile($user, ['teacher']);
        $this->assertFalse($user->hasRole('admin'));
        $this->assertTrue($user->hasRole('teacher'));
    }

    public function test_profile_is_created_and_updated(): void
    {
        $user = User::factory()->create();
        $synchronizer = new UserRoleProfileSynchronizer();

        $synchronizer->synchronizeUserProfile($user, ['user'], [
            'avatar_url' => 'avatars/example.png',
            'bio' => '這是測試簡介',
            'experience' => ['研究計畫 A', '專案 B'],
            'education' => ['測試大學資訊工程系'],
            'links' => [
                ['url' => 'https://example.com', 'label' => '個人網站'],
            ],
        ]);

        $profile = $user->refresh()->profile;
        $this->assertNotNull($profile);
        $this->assertEquals('這是測試簡介', $profile->bio);
        $this->assertEquals(['研究計畫 A', '專案 B'], $profile->experience);
        $this->assertEquals('https://example.com', $profile->links->first()->url);
    }

    public function test_primary_role_accessor_returns_highest_priority(): void
    {
        $user = User::factory()->create();
        $synchronizer = new UserRoleProfileSynchronizer();

        $synchronizer->synchronizeUserProfile($user, ['user']);
        $this->assertEquals('user', $user->role);

        $synchronizer->synchronizeUserProfile($user, ['teacher', 'user']);
        $this->assertEquals('teacher', $user->role);

        $synchronizer->synchronizeUserProfile($user, ['admin', 'teacher']);
        $this->assertEquals('admin', $user->role);
    }
}
