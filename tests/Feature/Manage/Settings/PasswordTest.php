<?php

namespace Tests\Feature\Manage\Settings;

use App\Models\User;
use App\Models\ManageActivity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create([
            'password' => Hash::make('old-password'),
        ]);
    }

    public function test_password_page_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get(route('manage.settings.password.edit'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('manage/settings/password')
        );
    }

    public function test_password_can_be_updated(): void
    {
        $response = $this->actingAs($this->user)->put(route('manage.settings.password.update'), [
            'current_password' => 'old-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertRedirect(route('manage.settings.password.edit'));
        $response->assertSessionHas('success');

        $this->assertTrue(Hash::check('new-password', $this->user->fresh()->password));
    }

    public function test_password_update_logs_activity(): void
    {
        $this->actingAs($this->user)->put(route('manage.settings.password.update'), [
            'current_password' => 'old-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $this->user->id,
            'activity_type' => 'password',
            'action' => 'update',
        ]);
    }

    public function test_current_password_must_be_correct(): void
    {
        $response = $this->actingAs($this->user)->put(route('manage.settings.password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertSessionHasErrors('current_password');
    }

    public function test_new_password_must_be_confirmed(): void
    {
        $response = $this->actingAs($this->user)->put(route('manage.settings.password.update'), [
            'current_password' => 'old-password',
            'password' => 'new-password',
            'password_confirmation' => 'different-password',
        ]);

        $response->assertSessionHasErrors('password');
    }

    public function test_new_password_must_meet_requirements(): void
    {
        $response = $this->actingAs($this->user)->put(route('manage.settings.password.update'), [
            'current_password' => 'old-password',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertSessionHasErrors('password');
    }

    public function test_password_update_requires_authentication(): void
    {
        $response = $this->put(route('manage.settings.password.update'), [
            'current_password' => 'old-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertRedirect(route('login'));
    }

    public function test_password_validation_rules(): void
    {
        // 缺少必填欄位
        $response = $this->actingAs($this->user)->put(route('manage.settings.password.update'), []);
        $response->assertSessionHasErrors(['current_password', 'password']);

        // 密碼太短
        $response = $this->actingAs($this->user)->put(route('manage.settings.password.update'), [
            'current_password' => 'old-password',
            'password' => '123',
            'password_confirmation' => '123',
        ]);
        $response->assertSessionHasErrors('password');
    }

    public function test_current_password_is_required(): void
    {
        $response = $this->actingAs($this->user)->put(route('manage.settings.password.update'), [
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertSessionHasErrors('current_password');
    }

    public function test_new_password_is_required(): void
    {
        $response = $this->actingAs($this->user)->put(route('manage.settings.password.update'), [
            'current_password' => 'old-password',
        ]);

        $response->assertSessionHasErrors('password');
    }
}
