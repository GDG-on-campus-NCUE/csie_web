<?php

namespace Database\Factories;

use App\Models\SupportFaq;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupportFaqFactory extends Factory
{
    protected $model = SupportFaq::class;

    public function definition(): array
    {
        return [
            'category' => fake()->randomElement(['account', 'technical', 'feature', 'billing', 'other']),
            'question' => fake()->sentence() . '?',
            'answer' => fake()->paragraphs(2, true),
            'status' => SupportFaq::STATUS_PUBLISHED,
            'sort_order' => fake()->numberBetween(0, 100),
            'views' => fake()->numberBetween(0, 1000),
            'is_helpful' => fake()->boolean(80),
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SupportFaq::STATUS_PUBLISHED,
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SupportFaq::STATUS_DRAFT,
        ]);
    }
}
