<?php

namespace Database\Factories;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Tag>
 */
class TagFactory extends Factory
{
    protected $model = Tag::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true);

        return [
            'context' => $this->faker->randomElement(array_keys(Tag::CONTEXTS)),
            'name' => $name,
            'slug' => Str::slug($name) ?: Str::slug($this->faker->unique()->word()),
            'description' => $this->faker->optional()->sentence(),
            'sort_order' => $this->faker->numberBetween(0, 999),
        ];
    }
}
