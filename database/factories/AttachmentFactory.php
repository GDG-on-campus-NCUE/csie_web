<?php

namespace Database\Factories;

use App\Models\Attachment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\Attachment>
 */
class AttachmentFactory extends Factory
{
    protected $model = Attachment::class;

    public function definition(): array
    {
        $filename = $this->faker->lexify('attachment-????.pdf');
        $path = 'attachments/'.Str::uuid().'.pdf';

        $postMorphAlias = (new Post())->getMorphClass();

        return [
            'attached_to_type' => $postMorphAlias,
            'attached_to_id' => Post::factory(),
            'type' => 'document',
            'title' => $filename,
            'filename' => $filename,
            'disk' => 'public',
            'disk_path' => $path,
            'file_url' => '/storage/'.$path,
            'external_url' => null,
            'mime_type' => 'application/pdf',
            'size' => $this->faker->numberBetween(1024, 2048),
            'uploaded_by' => User::factory(),
            'visibility' => 'public',
            'sort_order' => 0,
        ];
    }

    public function private(): static
    {
        return $this->state(fn () => [
            'visibility' => 'private',
        ]);
    }

    public function link(): static
    {
        return $this->state(fn () => [
            'type' => 'link',
            'disk' => null,
            'disk_path' => null,
            'file_url' => null,
            'external_url' => $this->faker->url(),
            'mime_type' => null,
            'size' => null,
        ]);
    }
}
