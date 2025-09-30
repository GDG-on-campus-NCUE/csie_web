<?php

namespace Database\Factories;

use App\Models\Person;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonFactory extends Factory
{
    protected $model = Person::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'name_en' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'photo_url' => fake()->imageUrl(200, 200, 'people'),
            'bio' => fake()->paragraph(3),
            'bio_en' => fake()->paragraph(3),
            'status' => fake()->randomElement(['active', 'inactive', 'retired']),
            'sort_order' => fake()->numberBetween(0, 100),
            'visible' => fake()->boolean(80), // 80% 機率為可見
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'visible' => true,
        ]);
    }

    public function teacher(): static
    {
        return $this->active()
            ->afterCreating(function (Person $person) {
                $person->teacherProfile()->create([
                    'office' => fake()->address(),
                    'job_title' => fake()->jobTitle(),
                    'title' => fake()->title(),
                    'title_en' => fake()->title(),
                    'expertise' => json_encode([fake()->word(), fake()->word()]),
                    'expertise_en' => json_encode([fake()->word(), fake()->word()]),
                    'education' => json_encode([fake()->sentence(), fake()->sentence()]),
                    'education_en' => json_encode([fake()->sentence(), fake()->sentence()]),
                ]);
            });
    }

    public function staff(): static
    {
        return $this->active()
            ->afterCreating(function (Person $person) {
                $person->staffProfile()->create([
                    'position' => fake()->jobTitle(),
                    'position_en' => fake()->jobTitle(),
                    'department' => fake()->company(),
                    'department_en' => fake()->company(),
                ]);
            });
    }
}
