<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\Manage\AttachmentResource;
use App\Models\Attachment;
use App\Models\Space;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttachmentResourceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 確認資源轉換時會輸出描述、標籤與 Space 資訊。
     */
    public function test_resource_contains_metadata_fields(): void
    {
        $space = Space::query()->create([
            'code' => 'LAB-001',
            'space_type' => 1,
            'name' => '系上實驗室',
        ]);

        $attachment = Attachment::factory()->create([
            'space_id' => $space->id,
            'description' => '課程投影片',
            'tags' => ['slides', 'course'],
        ]);

        $attachment->setRelation('space', $space);

        $payload = AttachmentResource::make($attachment)->resolve();

        $this->assertSame('課程投影片', $payload['description']);
        $this->assertSame(['slides', 'course'], $payload['tags']);
        $this->assertSame(['id' => $space->id, 'name' => $space->name], $payload['space']);
    }
}
