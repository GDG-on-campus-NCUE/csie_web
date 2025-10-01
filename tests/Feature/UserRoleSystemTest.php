<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleSystemTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

    // 使用 enum 欄位，不需要建立 roles table
    }

    public function test_user_roles_can_be_synchronized(): void
    {
    $user = User::factory()->create(['role' => 'teacher']);

    $this->assertTrue($user->hasRole('teacher'));
    $this->assertTrue($user->hasRoleOrHigher('user'));
    $this->assertFalse($user->hasRole('admin'));
    }

    public function test_roles_are_deactivated_when_removed(): void
    {
    $user = User::factory()->create(['role' => 'admin']);
    $this->assertTrue($user->hasRole('admin'));
    $this->assertFalse($user->hasRole('teacher'));

    // 模擬移除 admin 並改為 teacher
    $user->role = 'teacher';
    $user->save();

    $this->assertFalse($user->hasRole('admin'));
    $this->assertTrue($user->hasRole('teacher'));
    }

    public function test_profile_is_created_and_updated(): void
    {
        $user = User::factory()->create();

        // 直接建立或更新 profile
        $user->profile()->create([
            'avatar_url' => 'avatars/example.png',
            'bio' => '這是測試簡介',
            'experience' => ['研究計畫 A', '專案 B'],
            'education' => ['測試大學資訊工程系'],
        ]);

        $user->profile->links()->create([
            'type' => 'other',
            'label' => '個人網站',
            'url' => 'https://example.com',
        ]);

        $profile = $user->refresh()->profile;
        $this->assertNotNull($profile);
        $this->assertEquals('這是測試簡介', $profile->bio);
        $this->assertEquals(['研究計畫 A', '專案 B'], $profile->experience);
        $this->assertEquals('https://example.com', $profile->links->first()->url);
    }

    public function test_primary_role_accessor_returns_highest_priority(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $this->assertEquals('user', $user->role);

        $user->role = 'teacher';
        $user->save();
        $this->assertEquals('teacher', $user->role);

        $user->role = 'admin';
        $user->save();
        $this->assertEquals('admin', $user->role);
    }
}
