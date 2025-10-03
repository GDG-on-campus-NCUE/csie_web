<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\PostCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Post>
 */
class PostFactory extends Factory
{
    protected $model = Post::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'category_id' => PostCategory::factory(),
            'space_id' => null,
            'title' => $title = $this->faker->sentence(),
            'title_en' => $title,
            'excerpt' => $excerpt = $this->faker->sentences(2, true),
            'excerpt_en' => $excerpt,
            'summary' => $summary = $this->faker->sentence(),
            'summary_en' => $summary,
            'content' => $content = $this->faker->paragraphs(3, true),
            'content_en' => $content,
            'target_audience' => $this->faker->randomElement(['大三學生', '資工系全體教師', '跨領域選修同學']),
            'slug' => $this->faker->slug(),
            'status' => 'draft',
            'visibility' => 'public',
            'source_type' => 'manual',
            'pinned' => false,
            'published_at' => null,
            'course_start_at' => $courseStart = $this->faker->dateTimeBetween('+1 day', '+1 month'),
            'course_end_at' => $this->faker->dateTimeBetween($courseStart, '+2 months'),
            'views' => 0,
            'tags' => [],
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'published_at' => null,
        ]);
    }
}
