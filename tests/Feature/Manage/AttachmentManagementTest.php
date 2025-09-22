<?php

namespace Tests\Feature\Manage;

use App\Models\Attachment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AttachmentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_filters_attachments_by_type_and_visibility(): void
    {
        $admin = User::factory()->admin()->create();
        $uploader = User::factory()->teacher()->create();

        $document = Attachment::query()->create([
            'type' => 'document',
            'title' => '期中考注意事項',
            'filename' => 'midterm.pdf',
            'disk_path' => 'attachments/midterm.pdf',
            'mime_type' => 'application/pdf',
            'size' => 2048,
            'visibility' => Attachment::VISIBILITY_AUTHORIZED,
            'uploaded_by' => $uploader->id,
        ]);

        Attachment::query()->create([
            'type' => 'image',
            'title' => '校園宣傳',
            'filename' => 'poster.png',
            'disk_path' => 'attachments/poster.png',
            'mime_type' => 'image/png',
            'size' => 4096,
            'visibility' => Attachment::VISIBILITY_PUBLIC,
            'uploaded_by' => $uploader->id,
        ]);

        $response = $this
            ->actingAs($admin)
            ->withHeaders([
                'X-Inertia' => 'true',
                'Accept' => 'application/json',
            ])
            ->get(route('manage.admin.attachments.index', [
                'type' => 'document',
                'visibility' => Attachment::VISIBILITY_AUTHORIZED,
            ]));

        $response->assertStatus(200);

        $data = collect($response->json('props.attachments.data'));
        $this->assertTrue($data->pluck('id')->contains($document->id));
        $this->assertTrue($data->every(fn ($item) => $item['type'] === 'document'));
        $this->assertTrue($data->every(fn ($item) => $item['visibility'] === Attachment::VISIBILITY_AUTHORIZED));

        $filters = $response->json('props.filters');
        $this->assertSame('document', $filters['type']);
        $this->assertSame(Attachment::VISIBILITY_AUTHORIZED, $filters['visibility']);
    }

    public function test_admin_can_bulk_delete_attachments(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();

        $first = Attachment::query()->create([
            'type' => 'document',
            'title' => '表單下載',
            'filename' => 'form.pdf',
            'disk_path' => 'attachments/form.pdf',
            'mime_type' => 'application/pdf',
            'size' => 1024,
            'visibility' => Attachment::VISIBILITY_PUBLIC,
            'uploaded_by' => $admin->id,
        ]);
        $second = Attachment::query()->create([
            'type' => 'image',
            'title' => '校徽',
            'filename' => 'logo.png',
            'disk_path' => 'attachments/logo.png',
            'mime_type' => 'image/png',
            'size' => 2048,
            'visibility' => Attachment::VISIBILITY_PUBLIC,
            'uploaded_by' => $admin->id,
        ]);

        $response = $this
            ->from(route('manage.admin.attachments.index'))
            ->actingAs($admin)
            ->delete(route('manage.admin.attachments.bulk-destroy'), [
                'ids' => [$first->id, $second->id],
            ]);

        $response->assertRedirect(route('manage.admin.attachments.index'));

        $this->assertSoftDeleted('attachments', ['id' => $first->id]);
        $this->assertSoftDeleted('attachments', ['id' => $second->id]);
    }

    public function test_force_delete_removes_physical_files(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $attachment = Attachment::query()->create([
            'type' => 'document',
            'title' => '隱私權政策',
            'filename' => 'privacy.pdf',
            'disk_path' => 'attachments/privacy.pdf',
            'mime_type' => 'application/pdf',
            'size' => 512,
            'visibility' => Attachment::VISIBILITY_PUBLIC,
            'uploaded_by' => $admin->id,
        ]);

        Storage::disk('public')->put($attachment->disk_path, '測試內容');

        $attachment->delete();

        $response = $this
            ->from(route('manage.admin.attachments.index'))
            ->actingAs($admin)
            ->delete(route('manage.admin.attachments.force-delete', $attachment->id));

        $response->assertRedirect(route('manage.admin.attachments.index'));

        $this->assertDatabaseMissing('attachments', ['id' => $attachment->id]);
        Storage::disk('public')->assertMissing($attachment->disk_path);
    }

    public function test_non_admin_cannot_access_attachment_listing(): void
    {
        $teacher = User::factory()->teacher()->create();

        $response = $this
            ->actingAs($teacher)
            ->withHeaders([
                'X-Inertia' => 'true',
                'Accept' => 'application/json',
            ])
            ->get(route('manage.admin.attachments.index'));

        $response->assertForbidden();
    }
}
