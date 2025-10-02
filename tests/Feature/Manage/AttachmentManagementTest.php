<?php

namespace Tests\Feature\Manage;

use App\Models\Attachment;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Space;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AttachmentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_attachment_list(): void
    {
        $admin = User::factory()->admin()->create();
        $space = Space::create([
            'code' => 'LAB-01',
            'space_type' => 1,
            'name' => '資訊系實驗室',
        ]);
        $post = Post::factory()->create([
            'space_id' => $space->id,
        ]);

        $attachment = Attachment::factory()->create([
            'attached_to_id' => $post->id,
            'attached_to_type' => $post->getMorphClass(),
            'title' => '課程簡章',
            'filename' => 'brochure.pdf',
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('manage.attachments.index'));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) =>
            $page->component('manage/admin/attachments/index')
                ->has('attachments.data', 1, fn (AssertableInertia $item) =>
                    $item
                        ->where('id', $attachment->id)
                        ->where('title', '課程簡章')
                        ->where('filename', 'brochure.pdf')
                        ->where('attachable.space.name', '資訊系實驗室')
                        ->etc()
                )
        );
    }

    public function test_attachments_can_be_filtered_by_type_and_keyword(): void
    {
        $admin = User::factory()->admin()->create();
        $category = PostCategory::factory()->create();
        $post = Post::factory()->for($category, 'category')->create();

        Attachment::factory()->create([
            'attached_to_id' => $post->id,
            'attached_to_type' => $post->getMorphClass(),
            'type' => 'document',
            'title' => '系務公告附件',
        ]);

        $imageAttachment = Attachment::factory()->create([
            'attached_to_id' => $post->id,
            'attached_to_type' => $post->getMorphClass(),
            'type' => 'image',
            'title' => '活動照片',
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('manage.attachments.index', [
                'keyword' => '照片',
                'type' => 'image',
            ]));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) =>
            $page->component('manage/admin/attachments/index')
                ->where('attachments.meta.total', 1)
                ->where('attachments.data.0.id', $imageAttachment->id)
        );
    }
}
