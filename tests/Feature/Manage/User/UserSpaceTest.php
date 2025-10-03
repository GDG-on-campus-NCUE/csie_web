<?php

namespace Tests\Feature\Manage\User;

use App\Models\User;
use App\Models\Space;
use App\Models\ManageActivity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserSpaceTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Space $space;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->space = Space::factory()->create();
    }

    public function test_spaces_index_page_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get(route('manage.user.spaces.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('manage/user/spaces/index')
            ->has('userSpaces')
            ->has('availableSpaces')
        );
    }

    public function test_user_can_bind_to_space(): void
    {
        $response = $this->actingAs($this->user)->post(route('manage.user.spaces.store'), [
            'space_id' => $this->space->id,
            'role' => 'member',
            'access_level' => 'read',
        ]);

        $response->assertRedirect(route('manage.user.spaces.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('space_user', [
            'user_id' => $this->user->id,
            'space_id' => $this->space->id,
            'role' => 'member',
            'access_level' => 'read',
        ]);
    }

    public function test_space_binding_logs_activity(): void
    {
        $this->actingAs($this->user)->post(route('manage.user.spaces.store'), [
            'space_id' => $this->space->id,
            'role' => 'member',
            'access_level' => 'read',
        ]);

        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $this->user->id,
            'activity_type' => 'space',
            'action' => 'bind',
        ]);
    }

    public function test_user_can_update_space_binding(): void
    {
        $this->user->spaces()->attach($this->space->id, [
            'role' => 'member',
            'access_level' => 'read',
            'is_active' => true,
            'joined_at' => now(),
        ]);

        $binding = $this->user->spaces()->first()->pivot;

        $response = $this->actingAs($this->user)->put(route('manage.user.spaces.update', $binding->id), [
            'role' => 'collaborator',
            'access_level' => 'write',
        ]);

        $response->assertRedirect(route('manage.user.spaces.index'));

        $this->assertDatabaseHas('space_user', [
            'user_id' => $this->user->id,
            'space_id' => $this->space->id,
            'role' => 'collaborator',
            'access_level' => 'write',
        ]);
    }

    public function test_user_can_unbind_from_space(): void
    {
        $this->user->spaces()->attach($this->space->id, [
            'role' => 'member',
            'access_level' => 'read',
            'is_active' => true,
            'joined_at' => now(),
        ]);

        $binding = $this->user->spaces()->first()->pivot;

        $response = $this->actingAs($this->user)->delete(route('manage.user.spaces.destroy', $binding->id));

        $response->assertRedirect(route('manage.user.spaces.index'));

        $this->assertDatabaseMissing('space_user', [
            'user_id' => $this->user->id,
            'space_id' => $this->space->id,
        ]);
    }

    public function test_space_unbinding_logs_activity(): void
    {
        $this->user->spaces()->attach($this->space->id, [
            'role' => 'member',
            'access_level' => 'read',
            'is_active' => true,
            'joined_at' => now(),
        ]);

        $binding = $this->user->spaces()->first()->pivot;

        $this->actingAs($this->user)->delete(route('manage.user.spaces.destroy', $binding->id));

        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $this->user->id,
            'activity_type' => 'space',
            'action' => 'unbind',
        ]);
    }

    public function test_space_id_is_required_for_binding(): void
    {
        $response = $this->actingAs($this->user)->post(route('manage.user.spaces.store'), [
            'role' => 'member',
            'access_level' => 'read',
        ]);

        $response->assertSessionHasErrors('space_id');
    }

    public function test_role_is_required_for_binding(): void
    {
        $response = $this->actingAs($this->user)->post(route('manage.user.spaces.store'), [
            'space_id' => $this->space->id,
            'access_level' => 'read',
        ]);

        $response->assertSessionHasErrors('role');
    }

    public function test_role_must_be_valid(): void
    {
        $response = $this->actingAs($this->user)->post(route('manage.user.spaces.store'), [
            'space_id' => $this->space->id,
            'role' => 'invalid-role',
            'access_level' => 'read',
        ]);

        $response->assertSessionHasErrors('role');
    }

    public function test_access_level_must_be_valid(): void
    {
        $response = $this->actingAs($this->user)->post(route('manage.user.spaces.store'), [
            'space_id' => $this->space->id,
            'role' => 'member',
            'access_level' => 'invalid-level',
        ]);

        $response->assertSessionHasErrors('access_level');
    }

    public function test_user_cannot_bind_to_same_space_twice(): void
    {
        $this->user->spaces()->attach($this->space->id, [
            'role' => 'member',
            'access_level' => 'read',
            'is_active' => true,
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->post(route('manage.user.spaces.store'), [
            'space_id' => $this->space->id,
            'role' => 'member',
            'access_level' => 'read',
        ]);

        $response->assertSessionHasErrors();
    }

    public function test_spaces_require_authentication(): void
    {
        $response = $this->get(route('manage.user.spaces.index'));
        $response->assertRedirect(route('login'));

        $response = $this->post(route('manage.user.spaces.store'), []);
        $response->assertRedirect(route('login'));
    }

    public function test_available_spaces_excludes_bound_spaces(): void
    {
        $space1 = Space::factory()->create();
        $space2 = Space::factory()->create();

        // 綁定第一個空間
        $this->user->spaces()->attach($space1->id, [
            'role' => 'member',
            'access_level' => 'read',
            'is_active' => true,
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->get(route('manage.user.spaces.index'));

        $response->assertInertia(fn ($page) => $page
            ->has('userSpaces', 1)
            ->has('availableSpaces', fn ($spaces) =>
                $spaces->where('id', $space2->id)->etc()
            )
        );
    }

    public function test_valid_roles_are_accepted(): void
    {
        $roles = ['member', 'collaborator', 'manager'];

        foreach ($roles as $role) {
            $space = Space::factory()->create();
            $response = $this->actingAs($this->user)->post(route('manage.user.spaces.store'), [
                'space_id' => $space->id,
                'role' => $role,
                'access_level' => 'read',
            ]);

            $response->assertSessionHasNoErrors();
        }
    }

    public function test_valid_access_levels_are_accepted(): void
    {
        $levels = ['read', 'write', 'admin'];

        foreach ($levels as $level) {
            $space = Space::factory()->create();
            $response = $this->actingAs($this->user)->post(route('manage.user.spaces.store'), [
                'space_id' => $space->id,
                'role' => 'member',
                'access_level' => $level,
            ]);

            $response->assertSessionHasNoErrors();
        }
    }
}
