<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * 模型對應的工廠類別。
     *
     * @var class-string<\Illuminate\Database\Eloquent\Model>
     */
    protected $model = Project::class;

    /**
     * 定義模型的預設狀態。
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-2 years', '+6 months');
        $endDate = fake()->optional(0.7)->dateTimeBetween($startDate, '+2 years');

        return [
            'title' => fake()->randomElement([
                '深度學習於醫療影像辨識之應用研究',
                '邊緣運算物聯網架構與安全機制探討',
                '智慧城市感測網路資料分析平台開發',
                '區塊鏈技術於供應鏈管理之研究',
                '自然語言處理於社群媒體情緒分析',
                '量子運算演算法設計與應用',
                '擴增實境於教育訓練之應用研究',
                '網路流量異常偵測系統開發',
            ]),
            'title_en' => fake()->optional(0.6)->sentence(6),
            'sponsor' => fake()->randomElement([
                '科技部',
                '國家科學及技術委員會',
                '教育部',
                '經濟部',
                '產學合作',
                '企業委託',
                '校內研究計畫',
            ]),
            'principal_investigator' => fake()->name(),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_budget' => fake()->optional(0.8)->numberBetween(500000, 10000000),
            'summary' => fake()->optional(0.7)->paragraph(3),
        ];
    }

    /**
     * 建立進行中的計畫。
     */
    public function ongoing(): static
    {
        return $this->state(function (array $attributes) {
            $startDate = fake()->dateTimeBetween('-1 year', '-1 month');

            return [
                'start_date' => $startDate,
                'end_date' => fake()->dateTimeBetween('+1 month', '+1 year'),
            ];
        });
    }

    /**
     * 建立已完成的計畫。
     */
    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            $startDate = fake()->dateTimeBetween('-3 years', '-1 year');
            $endDate = fake()->dateTimeBetween($startDate, '-1 month');

            return [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ];
        });
    }

    /**
     * 建立即將開始的計畫。
     */
    public function upcoming(): static
    {
        return $this->state(function (array $attributes) {
            $startDate = fake()->dateTimeBetween('+1 month', '+6 months');

            return [
                'start_date' => $startDate,
                'end_date' => fake()->dateTimeBetween($startDate, '+2 years'),
            ];
        });
    }

    /**
     * 建立高額經費的計畫。
     */
    public function highBudget(): static
    {
        return $this->state(fn (array $attributes) => [
            'total_budget' => fake()->numberBetween(5000000, 20000000),
        ]);
    }

    /**
     * 建立科技部資助的計畫。
     */
    public function mostSponsored(): static
    {
        return $this->state(fn (array $attributes) => [
            'sponsor' => '科技部',
        ]);
    }
}
