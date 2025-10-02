<?php

namespace Database\Factories;

use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\ContactMessage>
 */
class ContactMessageFactory extends Factory
{
    protected $model = ContactMessage::class;

    public function definition(): array
    {
        return [
            'locale' => $this->faker->randomElement(['zh-TW', 'en']),
            'name' => $this->faker->name(),
            'email' => $this->faker->safeEmail(),
            'subject' => $this->faker->sentence(6),
            'message' => $this->faker->paragraphs(2, true),
            'file_url' => null,
            'status' => 'new',
            'processed_by' => null,
            'processed_at' => null,
        ];
    }

    public function processing(): static
    {
        return $this->state(fn () => [
            'status' => 'processing',
            'processed_by' => User::factory(),
            'processed_at' => now(),
        ]);
    }

    public function resolved(): static
    {
        return $this->state(fn () => [
            'status' => 'resolved',
            'processed_by' => User::factory(),
            'processed_at' => now(),
        ]);
    }

    public function spam(): static
    {
        return $this->state(fn () => [
            'status' => 'spam',
        ]);
    }
}
