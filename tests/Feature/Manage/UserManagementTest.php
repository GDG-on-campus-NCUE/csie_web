<?php

namespace Tests\Feature\Manage;

use App\Models\Attachment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_filter_users_by_role_status_and_date(): void
    {
        $admin = User::factory()->admin()->create();

        $matching = User::factory()->teacher()->create([
            'status' => 'active',
            'created_at' => Carbon::parse('2024-01-15'),
        ]);

        User::factory()->teacher()->create([
            'status' => 'suspended',
            'created_at' => Carbon::parse('2024-01-20'),
        ]);

        User::factory()->user()->create([
            'status' => 'active',
            'created_at' => Carbon::parse('2024-02-01'),
        ]);

        $response = $this
            ->actingAs($admin)
            ->withHeaders([
                'X-Inertia' => 'true',
                'Accept' => 'application/json',
            ])
            ->get(route('manage.admin.users.index', [
                'role' => 'teacher',
                'status' => 'active',
                'created_from' => '2024-01-01',
                'created_to' => '2024-01-31',
                'sort' => 'name',
                'per_page' => 10,
            ]));

        $response->assertStatus(200);

        $data = collect($response->json('props.users.data'));
        $this->assertCount(1, $data);
        $this->assertSame($matching->id, $data->first()['id']);

        $filters = $response->json('props.filters');
        $this->assertSame('teacher', $filters['role']);
        $this->assertSame('active', $filters['status']);
    }

    public function test_deleting_user_reassigns_related_records(): void
    {
        $admin = User::factory()->admin()->create();
        $target = User::factory()->teacher()->create();

        $post = Post::factory()->create([
            'created_by' => $target->id,
            'updated_by' => $target->id,
        ]);

        $attachment = Attachment::query()->create([
            'type' => 'document',
            'title' => '申請表',
            'filename' => 'apply.pdf',
            'disk_path' => 'attachments/apply.pdf',
            'mime_type' => 'application/pdf',
            'size' => 2048,
            'visibility' => Attachment::VISIBILITY_PUBLIC,
            'uploaded_by' => $target->id,
            'attached_to_type' => Post::class,
            'attached_to_id' => $post->id,
        ]);

        $response = $this
            ->actingAs($admin)
            ->from(route('manage.admin.users.index'))
            ->delete(route('manage.admin.users.destroy', $target->id));

        $response->assertRedirect(route('manage.admin.users.index'));

        $this->assertSoftDeleted('users', ['id' => $target->id]);
        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);
        $this->assertDatabaseHas('attachments', [
            'id' => $attachment->id,
            'uploaded_by' => $admin->id,
        ]);
    }

    public function test_cannot_delete_last_active_admin(): void
    {
        $actingAdmin = User::factory()->admin()->create();
        $lastAdmin = User::factory()->admin()->create();

        $actingAdmin->delete();

        $response = $this
            ->actingAs($actingAdmin)
            ->from(route('manage.admin.users.index'))
            ->delete(route('manage.admin.users.destroy', $lastAdmin->id));

        $response->assertRedirect(route('manage.admin.users.index'));
        $response->assertSessionHas('error');

        $lastAdmin->refresh();
        $this->assertNull($lastAdmin->deleted_at);
    }
}
