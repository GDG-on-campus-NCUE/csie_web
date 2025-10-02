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
            'slug' => $this->faker->slug(),
            'status' => 'draft',
            'visibility' => 'public',
            'source_type' => 'manual',
            'pinned' => false,
            'published_at' => null,
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
