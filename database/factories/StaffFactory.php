<?php

namespace Database\Factories;

use App\Models\Staff;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Staff>
 */
class StaffFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Staff::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => $this->faker->unique()->email(),
            'phone' => $this->faker->phoneNumber(),
            'photo_url' => null,
            'name' => $this->faker->name(),
            'name_en' => $this->faker->name(),
            'position' => $this->faker->jobTitle(),
            'position_en' => $this->faker->jobTitle(),
            'bio' => $this->faker->paragraph(3),
            'bio_en' => $this->faker->paragraph(3),
            'sort_order' => $this->faker->numberBetween(1, 100),
            'visible' => true,
        ];
    }

    /**
     * Indicate that the staff is not visible.
     */
    public function invisible(): static
    {
        return $this->state(fn (array $attributes) => [
            'visible' => false,
        ]);
    }

    /**
     * Indicate that the staff is visible.
     */
    public function visible(): static
    {
        return $this->state(fn (array $attributes) => [
            'visible' => true,
        ]);
    }

    /**
     * Create a staff with specific position.
     */
    public function withPosition(string $position, string $positionEn = null): static
    {
        return $this->state(fn (array $attributes) => [
            'position' => $position,
            'position_en' => $positionEn ?? $position,
        ]);
    }

    /**
     * Create complete staff profile with all fields.
     */
    public function complete(): static
    {
        return $this->state(fn (array $attributes) => [
            'photo_url' => $this->faker->imageUrl(200, 200, 'people'),
            'bio' => $this->faker->paragraphs(3, true),
            'bio_en' => $this->faker->paragraphs(3, true),
        ]);
    }
}
