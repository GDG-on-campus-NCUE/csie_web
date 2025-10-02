<?php

namespace Tests\Feature\Manage\Admin;

use App\Models\Attachment;
use App\Models\ManageActivity;
use App\Models\Post;
use App\Models\Space;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * 附件資源管理功能測試。
 * 測試管理員對附件的查看、篩選、批次操作與稽核日誌。
 */
class AttachmentManagementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 測試管理員可以查看附件列表。
     */
    public function test_admin_can_view_attachment_list(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $attachments = Attachment::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get('/manage/admin/attachments');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('manage/admin/attachments/index')
            ->has('attachments.data', 3)
        );
    }

    /**
     * 測試一般使用者無法存取附件管理頁面。
     */
    public function test_non_admin_cannot_access_attachment_management(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)->get('/manage/admin/attachments');

        $response->assertForbidden();
    }

    /**
     * 測試管理員可以批次刪除附件。
     */
    public function test_admin_can_bulk_delete_attachments(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $attachments = Attachment::factory()->count(3)->create();

        $response = $this->actingAs($admin)->postJson('/manage/admin/attachments/bulk-delete', [
            'attachment_ids' => $attachments->pluck('id')->toArray(),
        ]);

        $response->assertOk();
        $response->assertJson(['affected' => 3]);

        // 驗證附件已被軟刪除
        foreach ($attachments as $attachment) {
            $this->assertSoftDeleted('attachments', ['id' => $attachment->id]);
        }

        // 驗證操作已記錄到稽核日誌
        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $admin->id,
            'action' => 'attachment.bulk_deleted',
        ]);
    }

    /**
     * 測試批次刪除需要有效的附件 ID。
     */
    public function test_bulk_delete_requires_valid_attachment_ids(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/manage/admin/attachments/bulk-delete', [
            'attachment_ids' => [99999], // 不存在的 ID
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('attachment_ids.0');
    }

    /**
     * 測試附件列表支援類型篩選。
     */
    public function test_attachment_list_supports_type_filter(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Attachment::factory()->count(2)->create(['type' => Attachment::TYPE_MAP['document']]);
        Attachment::factory()->count(3)->create(['type' => Attachment::TYPE_MAP['image']]);

        $response = $this->actingAs($admin)->get('/manage/admin/attachments?type=document');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('attachments.data', 2)
        );
    }

    /**
     * 測試附件列表支援可見性篩選。
     */
    public function test_attachment_list_supports_visibility_filter(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Attachment::factory()->count(2)->create(['visibility' => Attachment::VISIBILITY_MAP['public']]);
        Attachment::factory()->count(3)->create(['visibility' => Attachment::VISIBILITY_MAP['private']]);

        $response = $this->actingAs($admin)->get('/manage/admin/attachments?visibility=public');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('attachments.data', 2)
        );
    }

    /**
     * 測試附件列表支援 Space 篩選。
     */
    public function test_attachment_list_supports_space_filter(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $space = Space::factory()->create();
        Attachment::factory()->count(2)->create(['space_id' => $space->id]);
        Attachment::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get("/manage/admin/attachments?space={$space->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('attachments.data', 2)
        );
    }

    /**
     * 測試附件列表支援標籤篩選。
     */
    public function test_attachment_list_supports_tag_filter(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $tag = Tag::factory()->create(['slug' => 'test-tag', 'context' => 'attachments']);
        $post = Post::factory()->create();
        $post->tags()->attach($tag);

        // 建立綁定到 post 的附件
        $attachment = Attachment::factory()->create([
            'attachable_type' => Post::class,
            'attachable_id' => $post->id,
        ]);

        Attachment::factory()->count(2)->create(); // 其他附件

        $response = $this->actingAs($admin)->get('/manage/admin/attachments?tag=test-tag');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('attachments.data', 1)
        );
    }

    /**
     * 測試附件列表支援關鍵字搜尋。
     */
    public function test_attachment_list_supports_keyword_search(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $targetAttachment = Attachment::factory()->create(['title' => 'Important Document']);
        Attachment::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get('/manage/admin/attachments?keyword=Important');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('attachments.data', 1)
            ->where('attachments.data.0.title', 'Important Document')
        );
    }

    /**
     * 測試附件列表支援日期範圍篩選。
     */
    public function test_attachment_list_supports_date_range_filter(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // 建立不同日期的附件
        $oldAttachment = Attachment::factory()->create(['created_at' => now()->subDays(10)]);
        $recentAttachment = Attachment::factory()->create(['created_at' => now()->subDay()]);

        $from = now()->subDays(2)->format('Y-m-d');
        $to = now()->format('Y-m-d');

        $response = $this->actingAs($admin)->get("/manage/admin/attachments?from={$from}&to={$to}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('attachments.data', 1)
            ->where('attachments.data.0.id', $recentAttachment->id)
        );
    }

    /**
     * 測試附件列表支援排序。
     */
    public function test_attachment_list_supports_sorting(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        Attachment::factory()->create(['title' => 'Apple', 'created_at' => now()->subDay()]);
        Attachment::factory()->create(['title' => 'Zebra', 'created_at' => now()]);
        Attachment::factory()->create(['title' => 'Banana', 'created_at' => now()->subDays(2)]);

        // 按名稱升冪排序
        $response = $this->actingAs($admin)->get('/manage/admin/attachments?sort=title&direction=asc');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('attachments.data', 3)
            ->where('attachments.data.0.title', 'Apple')
            ->where('attachments.data.2.title', 'Zebra')
        );
    }

    /**
     * 測試附件列表支援 Grid/List 檢視模式切換。
     */
    public function test_attachment_list_supports_view_mode(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Attachment::factory()->count(3)->create();

        // 測試 Grid 模式
        $response = $this->actingAs($admin)->get('/manage/admin/attachments?view=grid');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('viewMode', 'grid')
        );

        // 測試 List 模式
        $response = $this->actingAs($admin)->get('/manage/admin/attachments?view=list');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('viewMode', 'list')
        );
    }

    /**
     * 測試附件列表顯示關聯資訊。
     */
    public function test_attachment_list_displays_relationship_info(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $space = Space::factory()->create(['name' => 'Test Space']);
        $post = Post::factory()->create(['space_id' => $space->id, 'title' => 'Test Post']);
        $uploader = User::factory()->create(['name' => 'John Doe']);

        $attachment = Attachment::factory()->create([
            'uploader_id' => $uploader->id,
            'space_id' => $space->id,
            'attachable_type' => Post::class,
            'attachable_id' => $post->id,
        ]);

        $response = $this->actingAs($admin)->get('/manage/admin/attachments');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('attachments.data', 1)
            ->where('attachments.data.0.uploader.name', 'John Doe')
            ->where('attachments.data.0.space.name', 'Test Space')
            ->where('attachments.data.0.attachable.title', 'Test Post')
        );
    }

    /**
     * 測試附件列表分頁功能。
     */
    public function test_attachment_list_supports_pagination(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Attachment::factory()->count(25)->create();

        // 請求每頁 10 筆
        $response = $this->actingAs($admin)->get('/manage/admin/attachments?per_page=10');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('attachments.data', 10)
            ->where('attachments.meta.per_page', 10)
            ->where('attachments.meta.total', 25)
            ->where('attachments.meta.last_page', 3)
        );
    }

    /**
     * 測試：管理員可以上傳附件。
     */
    public function test_admin_can_upload_attachment(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $file = \Illuminate\Http\UploadedFile::fake()->create('test-document.pdf', 100, 'application/pdf');

        $response = $this->actingAs($admin)
            ->postJson('/manage/admin/attachments/upload', [
                'file' => $file,
                'title' => 'Test Document',
                'description' => 'This is a test document.',
                'visibility' => 'public',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'title',
                    'filename',
                    'mime_type',
                    'size',
                    'file_url',
                ],
            ]);

        $this->assertDatabaseHas('attachments', [
            'title' => 'Test Document',
            'description' => 'This is a test document.',
            'mime_type' => 'application/pdf',
            'visibility' => Attachment::VISIBILITY_PUBLIC,
            'uploader_id' => $admin->id,
        ]);

        // 檢查檔案是否實際儲存
        $attachment = Attachment::where('title', 'Test Document')->first();
        $this->assertNotNull($attachment);
        Storage::disk('local')->assertExists('attachments/' . $attachment->filename);
    }

    /**
     * 測試：上傳時驗證檔案必填。
     */
    public function test_upload_requires_file(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $response = $this->actingAs($admin)
            ->postJson('/manage/admin/attachments/upload', [
                'title' => 'Test Without File',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    /**
     * 測試：上傳時自動根據 MIME 類型判斷附件類型。
     */
    public function test_upload_auto_determines_attachment_type(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $imageFile = \Illuminate\Http\UploadedFile::fake()->image('test-image.jpg');
        $videoFile = \Illuminate\Http\UploadedFile::fake()->create('test-video.mp4', 100, 'video/mp4');
        $pdfFile = \Illuminate\Http\UploadedFile::fake()->create('test.pdf', 100, 'application/pdf');

        // 上傳圖片
        $response1 = $this->actingAs($admin)->postJson('/manage/admin/attachments/upload', [
            'file' => $imageFile,
            'title' => 'Image File',
        ]);
        $response1->assertStatus(201);
        $this->assertDatabaseHas('attachments', [
            'title' => 'Image File',
            'type' => Attachment::TYPE_IMAGE,
        ]);

        // 上傳影片
        $response2 = $this->actingAs($admin)->postJson('/manage/admin/attachments/upload', [
            'file' => $videoFile,
            'title' => 'Video File',
        ]);
        $response2->assertStatus(201);
        $this->assertDatabaseHas('attachments', [
            'title' => 'Video File',
            'type' => Attachment::TYPE_VIDEO,
        ]);

        // 上傳文件
        $response3 = $this->actingAs($admin)->postJson('/manage/admin/attachments/upload', [
            'file' => $pdfFile,
            'title' => 'PDF File',
        ]);
        $response3->assertStatus(201);
        $this->assertDatabaseHas('attachments', [
            'title' => 'PDF File',
            'type' => Attachment::TYPE_DOCUMENT,
        ]);
    }

    /**
     * 測試：管理員可以更新附件資訊。
     */
    public function test_admin_can_update_attachment_info(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $space = Space::factory()->create();
        $attachment = Attachment::factory()->create([
            'title' => 'Original Title',
            'visibility' => Attachment::VISIBILITY_PUBLIC,
        ]);

        $response = $this->actingAs($admin)
            ->putJson("/manage/admin/attachments/{$attachment->id}", [
                'title' => 'Updated Title',
                'description' => 'Updated description.',
                'visibility' => 'private',
                'space_id' => $space->id,
                'tags' => ['important', 'archived'],
            ]);

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'data' => ['id', 'title', 'description', 'visibility'],
            ]);

        $this->assertDatabaseHas('attachments', [
            'id' => $attachment->id,
            'title' => 'Updated Title',
            'description' => 'Updated description.',
            'visibility' => Attachment::VISIBILITY_PRIVATE,
            'space_id' => $space->id,
        ]);

        $attachment->refresh();
        $this->assertEquals(['important', 'archived'], $attachment->tags);
    }

    /**
     * 測試：更新附件時記錄操作紀錄。
     */
    public function test_update_attachment_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $attachment = Attachment::factory()->create(['title' => 'Original']);

        $this->actingAs($admin)
            ->putJson("/manage/admin/attachments/{$attachment->id}", [
                'title' => 'Modified Title',
            ]);

        $this->assertDatabaseHas('manage_activities', [
            'model_type' => Attachment::class,
            'model_id' => $attachment->id,
            'action' => ManageActivity::ACTION_UPDATED,
            'user_id' => $admin->id,
        ]);

        $activity = ManageActivity::where('model_id', $attachment->id)
            ->where('action', ManageActivity::ACTION_UPDATED)
            ->first();

        $this->assertNotNull($activity);
        $this->assertStringContainsString('更新附件資訊', $activity->description);
    }

    /**
     * 測試：上傳時記錄操作紀錄。
     */
    public function test_upload_attachment_logs_activity(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $file = \Illuminate\Http\UploadedFile::fake()->create('test.pdf', 100);

        $response = $this->actingAs($admin)
            ->postJson('/manage/admin/attachments/upload', [
                'file' => $file,
                'title' => 'Test Upload',
            ]);

        $response->assertStatus(201);

        $attachment = Attachment::where('title', 'Test Upload')->first();

        $this->assertDatabaseHas('manage_activities', [
            'model_type' => Attachment::class,
            'model_id' => $attachment->id,
            'action' => ManageActivity::ACTION_CREATED,
            'user_id' => $admin->id,
        ]);
    }
}
