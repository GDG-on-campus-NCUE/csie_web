<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'locale' => 'en',
            'status' => 'active',
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create an admin user.
     */
    public function admin(): static
    {
        return $this->withRoles(['admin']);
    }

    /**
     * Create a teacher user.
     */
    public function teacher(): static
    {
        return $this->withRoles(['teacher']);
    }

    /**
     * Create a regular user.
     */
    public function user(): static
    {
        return $this->withRoles(['user']);
    }

    public function withRoles(array $roles): static
    {
        return $this->afterCreating(function (User $user) use ($roles) {
            foreach ($roles as $roleName) {
                $role = Role::where('name', $roleName)->first();
                if (! $role) {
                    continue;
                }

                UserRole::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'role_id' => $role->id,
                    ],
                    [
                        'status' => 'active',
                        'assigned_at' => now(),
                    ]
                );
            }
        });
    }
}
