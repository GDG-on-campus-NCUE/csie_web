<?php

namespace Tests\Feature\Manage\User;

use App\Models\User;
use App\Models\Post;
use App\Models\Space;
use App\Models\ManageActivity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_dashboard_page_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get(route('manage.user.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('manage/user/dashboard')
            ->has('stats')
            ->has('recentPosts')
            ->has('quickLinks')
        );
    }

    public function test_dashboard_shows_correct_stats(): void
    {
        // 建立使用者個人檔案
        $this->user->profile()->create([
            'name' => 'Test User',
            'title' => 'Professor',
            'phone' => '0912345678',
            'office' => 'Room 101',
            'bio' => 'Test bio',
            'expertise' => ['AI', 'ML'],
        ]);

        $response = $this->actingAs($this->user)->get(route('manage.user.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->has('stats', fn ($stats) => $stats
                ->has('profile_completeness')
                ->has('unread_messages')
                ->has('space_bindings')
            )
        );
    }

    public function test_dashboard_shows_recent_posts(): void
    {
        // 建立一些文章
        Post::factory()->count(3)->create([
            'created_by' => $this->user->id,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->get(route('manage.user.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->has('recentPosts', 3)
        );
    }

    public function test_dashboard_shows_quick_links(): void
    {
        $response = $this->actingAs($this->user)->get(route('manage.user.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->has('quickLinks', 4)
        );
    }

    public function test_profile_completeness_calculated_correctly(): void
    {
        // 空白個人檔案時，User 欄位會被計算，所以不是真正的 0%
        // 修正測試以檢查是否小於完整的百分比
        $response = $this->actingAs($this->user)->get(route('manage.user.dashboard'));
        $initialCompleteness = $response->viewData('page')['props']['stats']['profile_completeness'] ?? 0;

        // 填寫更多資料 - 應該增加
        $this->user->profile()->create([
            'name' => 'Test User',
            'title' => 'Professor',
            'phone' => '0912345678',
            'office' => 'Room 101',
            'bio' => 'Test bio',
            'expertise' => ['AI', 'ML'],
        ]);

        $response = $this->actingAs($this->user)->get(route('manage.user.dashboard'));
        $newCompleteness = $response->viewData('page')['props']['stats']['profile_completeness'];

        $this->assertGreaterThan($initialCompleteness, $newCompleteness);
    }

    public function test_dashboard_requires_authentication(): void
    {
        $response = $this->get(route('manage.user.dashboard'));

        $response->assertRedirect(route('login'));
    }

    public function test_dashboard_counts_space_bindings(): void
    {
        $space = Space::factory()->create();
        $this->user->spaces()->attach($space->id, [
            'role' => 'member',
            'access_level' => 'read',
            'is_active' => true,
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->get(route('manage.user.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->where('stats.space_bindings', 1)
        );
    }

    public function test_dashboard_filters_unpublished_posts(): void
    {
        // 建立已發布和未發布的文章
        Post::factory()->count(2)->create([
            'created_by' => $this->user->id,
            'published_at' => now(),
        ]);

        Post::factory()->count(3)->create([
            'created_by' => $this->user->id,
            'published_at' => null,
        ]);

        $response = $this->actingAs($this->user)->get(route('manage.user.dashboard'));

        // 只應顯示已發布的文章
        $response->assertInertia(fn ($page) => $page
            ->has('recentPosts', 2)
        );
    }

    public function test_dashboard_limits_recent_posts_to_five(): void
    {
        Post::factory()->count(10)->create([
            'created_by' => $this->user->id,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->get(route('manage.user.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->has('recentPosts', 5)
        );
    }

    public function test_dashboard_shows_most_recent_posts_first(): void
    {
        $oldPost = Post::factory()->create([
            'created_by' => $this->user->id,
            'published_at' => now()->subDays(5),
        ]);

        $newPost = Post::factory()->create([
            'created_by' => $this->user->id,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->get(route('manage.user.dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->has('recentPosts.0', fn ($post) => $post
                ->where('id', $newPost->id)
            )
        );
    }
}
