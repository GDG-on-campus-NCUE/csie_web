<?php

namespace Database\Factories;

use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Teacher>
 */
class TeacherFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'office' => $this->faker->optional()->regexify('Room [0-9]{3}'),
            'phone' => $this->faker->optional()->phoneNumber(),
            'name' => $this->faker->name(),
            'name_en' => $this->faker->name(),
            'title' => $this->faker->jobTitle(),
            'title_en' => $this->faker->jobTitle(),
            'expertise' => $this->faker->optional()->randomElement([
                'Computer Science',
                'Software Engineering',
                'Data Science',
                'Artificial Intelligence',
                'Cybersecurity',
                'Web Development',
                'Mobile Development',
                'Database Systems',
                'Network Administration',
                'Information Systems'
            ]),
            'expertise_en' => $this->faker->optional()->randomElement([
                'Computer Science',
                'Software Engineering',
                'Data Science'
            ]),
            'bio' => $this->faker->optional()->paragraph(3),
            'bio_en' => $this->faker->optional()->paragraph(3),
            'education' => $this->faker->optional()->paragraph(2),
            'education_en' => $this->faker->optional()->paragraph(2),
            'sort_order' => $this->faker->numberBetween(0, 100),
            'visible' => $this->faker->randomElement([true, true, true, false]), // 75% visible
        ];
    }

    /**
     * Indicate that the teacher is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'visible' => true,
        ]);
    }

    /**
     * Indicate that the teacher is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'visible' => false,
        ]);
    }

    /**
     * Create a teacher with a specific specialty (mapped to expertise).
     */
    public function withSpecialty(string $specialty): static
    {
        return $this->state(fn (array $attributes) => [
            'expertise' => $specialty,
        ]);
    }

    /**
     * Create a teacher with complete information.
     */
    public function complete(): static
    {
        return $this->state(fn (array $attributes) => [
            'office' => $this->faker->regexify('Room [0-9]{3}'),
            'phone' => $this->faker->phoneNumber(),
            'name' => $this->faker->name(),
            'name_en' => $this->faker->name(),
            'title' => $this->faker->jobTitle(),
            'title_en' => $this->faker->jobTitle(),
            'expertise' => $this->faker->randomElement([
                'Computer Science',
                'Software Engineering',
                'Data Science'
            ]),
            'expertise_en' => $this->faker->randomElement([
                'Computer Science',
                'Software Engineering',
                'Data Science'
            ]),
            'bio' => $this->faker->paragraph(3),
            'bio_en' => $this->faker->paragraph(3),
            'education' => $this->faker->paragraph(2),
            'education_en' => $this->faker->paragraph(2),
            'visible' => true,
        ]);
    }
}
