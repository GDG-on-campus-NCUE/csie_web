<?php

namespace Database\Factories;

use App\Models\Staff;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Staff>
 */
class StaffFactory extends Factory
{
    /**
     * 指定對應的模型。
     *
     * @var class-string<\App\Models\Staff>
     */
    protected $model = Staff::class;

    /**
     * 定義預設狀態。
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startedAt = Carbon::instance($this->faker->dateTimeBetween('-5 years', 'now'));

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
            'user_id' => null,
            'employment_status' => 'active',
            'employment_started_at' => $startedAt,
            'employment_ended_at' => null,
        ];
    }

    /**
     * 標記為隱藏。
     */
    public function invisible(): static
    {
        return $this->state(fn (array $attributes) => [
            'visible' => false,
        ]);
    }

    /**
     * 標記為顯示。
     */
    public function visible(): static
    {
        return $this->state(fn (array $attributes) => [
            'visible' => true,
        ]);
    }

    /**
     * 指定職稱（含英文）。
     */
    public function withPosition(string $position, ?string $positionEn = null): static
    {
        return $this->state(fn (array $attributes) => [
            'position' => $position,
            'position_en' => $positionEn ?? $position,
        ]);
    }

    /**
     * 產生完整資料（含圖片與雙語簡介）。
     */
    public function complete(): static
    {
        return $this->state(fn (array $attributes) => [
            'photo_url' => $this->faker->imageUrl(200, 200, 'people'),
            'bio' => $this->faker->paragraphs(3, true),
            'bio_en' => $this->faker->paragraphs(3, true),
        ]);
    }

    /**
     * 標記為已離職或非在職狀態。
     */
    public function former(string $status = 'left'): static
    {
        return $this->state(function (array $attributes) use ($status) {
            $endedAt = Carbon::instance($this->faker->dateTimeBetween('-1 year', 'now'));

            return [
                'employment_status' => $status,
                'employment_ended_at' => $endedAt,
                'employment_started_at' => Carbon::instance(
                    $this->faker->dateTimeBetween('-10 years', $endedAt->copy()->subMonths(1))
                ),
            ];
        });
    }
}
