<?php

namespace Tests\Unit\Services;

use App\Models\ManageActivity;
use App\Models\Post;
use App\Models\Tag;
use App\Services\TagService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TagServiceTest extends TestCase
{
    use RefreshDatabase;

    public function testMergeTagsReassignsPostsAndLogsActivity(): void
    {
        $target = Tag::factory()->create([
            'context' => 'posts',
            'is_active' => true,
        ]);

        $sources = Tag::factory()->count(2)->create([
            'context' => 'posts',
            'is_active' => true,
        ]);

        $posts = Post::factory()->count(3)->create();

        // Attach tags to posts in various combinations.
        $posts[0]->tags()->attach($sources[0]->id);
        $posts[1]->tags()->attach([$sources[0]->id, $sources[1]->id]);
        $posts[2]->tags()->attach($sources[1]->id);

        $service = app(TagService::class);

        $result = $service->mergeTags($target->id, $sources->pluck('id')->all());

        $this->assertSame(3, $result['affected_resources']);
        $this->assertSame(2, $result['deactivated_tags']);

        $target->refresh();
        $this->assertTrue($target->is_active);

        foreach ($sources as $source) {
            $source->refresh();
            $this->assertFalse($source->is_active);
        }

        foreach ($posts as $post) {
            $post->refresh();
            $this->assertTrue($post->tags()->whereKey($target->id)->exists());
            $this->assertSame(1, DB::table('post_tag')->where('post_id', $post->id)->count());
        }

        $this->assertDatabaseCount('manage_activities', 1);

        $activity = ManageActivity::query()->latest('id')->first();
        $this->assertNotNull($activity);
        $this->assertSame('tag.merged', $activity->action);
        $this->assertSame($target->id, $activity->subject_id);
        $this->assertSame('App\\Models\\Tag', $activity->subject_type);
        $this->assertSame([
            'target_id' => $target->id,
            'source_ids' => $sources->pluck('id')->all(),
            'context' => 'posts',
            'affected_resources' => 3,
            'deactivated' => 2,
        ], $activity->properties->getArrayCopy());
    }

    public function testMergeTagsThrowsWhenContextsDiffer(): void
    {
        $target = Tag::factory()->create([
            'context' => 'posts',
        ]);

        $source = Tag::factory()->create([
            'context' => 'labs',
        ]);

        $service = app(TagService::class);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Merge requires tags in the same context.');

        $service->mergeTags($target->id, [$source->id]);
    }

    public function testSplitTagCreatesUniqueTagsAndDeactivatesOriginalWhenRequested(): void
    {
        $tag = Tag::factory()->create([
            'context' => 'posts',
            'is_active' => true,
            'color' => '#112233',
        ]);

        Tag::factory()->create([
            'context' => 'posts',
            'name' => 'Existing',
            'slug' => 'existing',
        ]);

        $service = app(TagService::class);

        $result = $service->splitTag($tag, [' New Tag ', 'existing', 'Another', 'New Tag'], false, '#445566');

        $this->assertTrue($result['deactivated_original']);

        $tag->refresh();
        $this->assertFalse($tag->is_active);

        $this->assertCount(2, $result['created']);

        $createdNames = collect($result['created'])->map->name->all();
        $this->assertEqualsCanonicalizing(['New Tag', 'Another'], $createdNames);

        foreach ($result['created'] as $created) {
            $this->assertSame('posts', $created->context);
            $this->assertSame('#445566', $created->color);
            $this->assertTrue($created->is_active);
        }

        $this->assertDatabaseCount('manage_activities', 1);
        $activity = ManageActivity::query()->latest('id')->first();
        $this->assertNotNull($activity);
        $this->assertSame('tag.split', $activity->action);
        $this->assertSame($tag->id, $activity->subject_id);
        $this->assertSame([
            'context' => 'posts',
            'keep_original' => false,
            'created_tag_ids' => collect($result['created'])->pluck('id')->all(),
        ], $activity->properties->getArrayCopy());
    }
}
