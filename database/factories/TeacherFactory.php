<?php

namespace Database\Factories;

use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Teacher>
 */
class TeacherFactory extends Factory
{
    /**
     * 定義模型預設狀態。
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startedAt = Carbon::instance($this->faker->dateTimeBetween('-10 years', 'now'));

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
                'Information Systems',
            ]),
            'expertise_en' => $this->faker->optional()->randomElement([
                'Computer Science',
                'Software Engineering',
                'Data Science',
            ]),
            'bio' => $this->faker->optional()->paragraph(3),
            'bio_en' => $this->faker->optional()->paragraph(3),
            'education' => $this->faker->optional()->paragraph(2),
            'education_en' => $this->faker->optional()->paragraph(2),
            'sort_order' => $this->faker->numberBetween(0, 100),
            'visible' => $this->faker->randomElement([true, true, true, false]),
            'user_id' => null,
            'employment_status' => 'active',
            'employment_started_at' => $startedAt,
            'employment_ended_at' => null,
        ];
    }

    /**
     * 標記教師為顯示狀態。
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'visible' => true,
            'employment_status' => 'active',
            'employment_ended_at' => null,
        ]);
    }

    /**
     * 標記教師為隱藏狀態。
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'visible' => false,
            'employment_status' => 'inactive',
        ]);
    }

    /**
     * 指定專長領域。
     */
    public function withSpecialty(string $specialty): static
    {
        return $this->state(fn (array $attributes) => [
            'expertise' => $specialty,
        ]);
    }

    /**
     * 產生完整教師資料。
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
                'Data Science',
            ]),
            'expertise_en' => $this->faker->randomElement([
                'Computer Science',
                'Software Engineering',
                'Data Science',
            ]),
            'bio' => $this->faker->paragraph(3),
            'bio_en' => $this->faker->paragraph(3),
            'education' => $this->faker->paragraph(2),
            'education_en' => $this->faker->paragraph(2),
            'visible' => true,
            'employment_status' => 'active',
            'employment_ended_at' => null,
        ]);
    }

    /**
     * 標記教師為退休或離職。
     */
    public function former(string $status = 'retired'): static
    {
        return $this->state(function (array $attributes) use ($status) {
            $endedAt = Carbon::instance($this->faker->dateTimeBetween('-2 years', 'now'));

            return [
                'employment_status' => $status,
                'employment_ended_at' => $endedAt,
                'employment_started_at' => Carbon::instance(
                    $this->faker->dateTimeBetween('-20 years', $endedAt->copy()->subMonths(6))
                ),
            ];
        });
    }
}
