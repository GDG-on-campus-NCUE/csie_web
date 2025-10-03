<?php

namespace Database\Factories;

use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupportTicketReplyFactory extends Factory
{
    protected $model = SupportTicketReply::class;

    public function definition(): array
    {
        return [
            'ticket_id' => SupportTicket::factory(),
            'user_id' => User::factory(),
            'message' => fake()->paragraphs(2, true),
            'is_staff_reply' => fake()->boolean(30), // 30% 機率是員工回覆
        ];
    }

    /**
     * 員工回覆
     */
    public function staffReply(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_staff_reply' => true,
        ]);
    }

    /**
     * 使用者回覆
     */
    public function userReply(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_staff_reply' => false,
        ]);
    }
}
