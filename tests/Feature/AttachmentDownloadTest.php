<?php

namespace Tests\Feature;

use App\Models\Attachment;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AttachmentDownloadTest extends TestCase
{
    use RefreshDatabase;

    public function test_private_attachment_requires_authorization(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $category = PostCategory::factory()->create();
        $post = Post::factory()->for($category, 'category')->create([
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $path = 'attachments/private.pdf';
        Storage::disk('public')->put($path, 'secret');

        $attachment = Attachment::factory()
            ->private()
            ->for($post, 'attachable')
            ->create([
                'disk_path' => $path,
                'file_url' => '/storage/'.$path,
                'uploaded_by' => $admin->id,
            ]);

        $guestResponse = $this->get(route('public.attachments.download', $attachment));
        $guestResponse->assertForbidden();

        $authResponse = $this->actingAs($admin)->get(route('public.attachments.download', $attachment));
        $authResponse->assertOk();
        $authResponse->assertHeader('content-disposition');
    }

    public function test_clean_orphaned_attachments_removes_records_and_files(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $category = PostCategory::factory()->create();
        $post = Post::factory()->for($category, 'category')->create([
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $path = 'attachments/orphan.pdf';
        Storage::disk('public')->put($path, 'orphan');

        $attachment = Attachment::factory()->for($post, 'attachable')->create([
            'disk_path' => $path,
            'file_url' => '/storage/'.$path,
            'uploaded_by' => $admin->id,
        ]);

        $post->forceDelete();
        $this->assertDatabaseHas('attachments', ['id' => $attachment->id]);
        $this->assertTrue(Storage::disk('public')->exists($path));

        Artisan::call('attachments:clean-orphans');

        $cleaned = Attachment::withTrashed()->find($attachment->id);
        $this->assertNotNull($cleaned);
        $this->assertTrue($cleaned->trashed());
        $this->assertFalse(Storage::disk('public')->exists($path));
    }
}
