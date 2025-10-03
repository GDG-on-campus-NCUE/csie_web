<?php

namespace Database\Factories;

use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupportTicketFactory extends Factory
{
    protected $model = SupportTicket::class;

    public function definition(): array
    {
        $status = fake()->randomElement([
            SupportTicket::STATUS_OPEN,
            SupportTicket::STATUS_IN_PROGRESS,
            SupportTicket::STATUS_RESOLVED,
            SupportTicket::STATUS_CLOSED,
        ]);

        return [
            'user_id' => User::factory(),
            'ticket_number' => 'ST-' . now()->format('Ymd') . '-' . str_pad(fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'subject' => fake()->sentence(),
            'category' => fake()->randomElement([
                SupportTicket::CATEGORY_TECHNICAL,
                SupportTicket::CATEGORY_ACCOUNT,
                SupportTicket::CATEGORY_FEATURE,
                SupportTicket::CATEGORY_OTHER,
            ]),
            'priority' => fake()->randomElement([
                SupportTicket::PRIORITY_LOW,
                SupportTicket::PRIORITY_MEDIUM,
                SupportTicket::PRIORITY_HIGH,
                SupportTicket::PRIORITY_URGENT,
            ]),
            'message' => fake()->paragraphs(3, true),
            'status' => $status,
            'assigned_to' => $status !== SupportTicket::STATUS_OPEN ? User::factory() : null,
            'resolved_at' => in_array($status, [SupportTicket::STATUS_RESOLVED, SupportTicket::STATUS_CLOSED]) ? fake()->dateTimeBetween('-1 week', 'now') : null,
            'closed_at' => $status === SupportTicket::STATUS_CLOSED ? fake()->dateTimeBetween('-1 week', 'now') : null,
        ];
    }

    public function open(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SupportTicket::STATUS_OPEN,
            'assigned_to' => null,
            'resolved_at' => null,
            'closed_at' => null,
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SupportTicket::STATUS_IN_PROGRESS,
            'assigned_to' => User::factory(),
            'resolved_at' => null,
            'closed_at' => null,
        ]);
    }

    public function resolved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SupportTicket::STATUS_RESOLVED,
            'assigned_to' => User::factory(),
            'resolved_at' => now(),
            'closed_at' => null,
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SupportTicket::STATUS_CLOSED,
            'assigned_to' => User::factory(),
            'resolved_at' => now()->subDay(),
            'closed_at' => now(),
        ]);
    }
}
