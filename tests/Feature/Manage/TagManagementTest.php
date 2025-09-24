<?php

namespace Tests\Feature\Manage;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class TagManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_tag_index(): void
    {
        $admin = User::factory()->admin()->create();
        Tag::factory()->count(2)->create(['context' => 'posts']);

        $response = $this->actingAs($admin)->get(route('manage.tags.index'));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) =>
            $page->component('manage/admin/tags/index')
                ->has('tags', 2)
                ->has('contextOptions')
                ->where('tableReady', true)
        );
    }

    public function test_tag_index_handles_missing_table_gracefully(): void
    {
        $admin = User::factory()->admin()->create();

        Schema::dropIfExists('tags');

        $response = $this->actingAs($admin)->get(route('manage.tags.index'));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) =>
            $page->component('manage/admin/tags/index')
                ->where('tableReady', false)
                ->where('tags', [])
        );
    }

    public function test_admin_can_create_tag(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('manage.tags.store'), [
            'context' => 'posts',
            'name' => '系務公告',
            'slug' => '',
            'description' => '系務相關公告',
            'sort_order' => 3,
        ]);

        $response->assertRedirect(route('manage.tags.index'));

        $this->assertDatabaseHas('tags', [
            'context' => 'posts',
            'name' => '系務公告',
            'description' => '系務相關公告',
            'sort_order' => 3,
        ]);

        $tag = Tag::where('name', '系務公告')->first();
        $this->assertNotNull($tag);
        $this->assertNotEmpty($tag->slug);
    }

    public function test_admin_can_update_tag(): void
    {
        $admin = User::factory()->admin()->create();
        $tag = Tag::factory()->create([
            'context' => 'posts',
            'name' => '舊標籤',
            'slug' => 'old-tag',
        ]);

        $response = $this->actingAs($admin)->put(route('manage.tags.update', $tag), [
            'context' => 'posts',
            'name' => '最新公告',
            'slug' => '',
            'description' => '更新後的說明',
            'sort_order' => 8,
        ]);

        $response->assertRedirect(route('manage.tags.index'));

        $tag->refresh();
        $this->assertSame('posts', $tag->context);
        $this->assertSame('最新公告', $tag->name);
        $this->assertSame('更新後的說明', $tag->description);
        $this->assertSame(8, $tag->sort_order);
        $this->assertNotEmpty($tag->slug);
        $this->assertNotSame('old-tag', $tag->slug);
    }

    public function test_admin_can_delete_tag(): void
    {
        $admin = User::factory()->admin()->create();
        $tag = Tag::factory()->create();

        $response = $this->actingAs($admin)->delete(route('manage.tags.destroy', $tag));

        $response->assertRedirect(route('manage.tags.index'));
        $this->assertDatabaseMissing('tags', ['id' => $tag->id]);
    }

    public function test_teacher_cannot_access_tag_index(): void
    {
        $teacher = User::factory()->teacher()->create();

        $response = $this->actingAs($teacher)->get(route('manage.tags.index'));

        $response->assertForbidden();
    }

    public function test_available_tags_are_included_in_post_forms(): void
    {
        $admin = User::factory()->admin()->create();
        Tag::factory()->create([
            'context' => 'posts',
            'name' => '招生',
            'slug' => 'enrollment',
        ]);

        $response = $this->actingAs($admin)->get(route('manage.posts.create'));

        $response->assertInertia(fn (AssertableInertia $page) =>
            $page->component('manage/posts/create')
                ->has('availableTags', 1, fn (AssertableInertia $tags) =>
                    $tags->where('0.name', '招生')
                )
        );
    }
}
