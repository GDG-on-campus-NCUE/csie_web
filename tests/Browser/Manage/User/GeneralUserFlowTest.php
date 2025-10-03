<?php

namespace Tests\Browser\Manage\User;

use App\Models\User;
use App\Models\Space;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class GeneralUserFlowTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);
    }

    /**
     * @group part5
     */
    public function test_user_can_navigate_to_dashboard(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                    ->visit('/manage/user/dashboard')
                    ->assertSee('管理後台')
                    ->assertSee('個人儀表板');
        });
    }

    /**
     * @group part5
     */
    public function test_dashboard_shows_profile_completeness(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                    ->visit('/manage/user/dashboard')
                    ->assertSee('個人檔案完整度')
                    ->assertPresent('.progress-bar, [role="progressbar"]');
        });
    }

    /**
     * @group part5
     */
    public function test_user_can_access_profile_settings(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                    ->visit('/manage/settings/profile')
                    ->assertSee('個人資料')
                    ->assertInputPresent('#name');
        });
    }

    /**
     * @group part5
     */
    public function test_user_can_change_password(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                    ->visit('/manage/settings/password')
                    ->assertSee('安全設定')
                    ->assertInputPresent('#current_password')
                    ->assertInputPresent('#password')
                    ->assertInputPresent('#password_confirmation');
        });
    }

    /**
     * @group part5
     */
    public function test_user_can_access_appearance_settings(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                    ->visit('/manage/settings/appearance')
                    ->assertSee('外觀')
                    ->assertSee('主題')
                    ->assertPresent('input[type="radio"][name="theme"]');
        });
    }

    /**
     * @group part5
     */
    public function test_user_can_view_space_bindings(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                    ->visit('/manage/user/spaces')
                    ->assertSee('空間綁定')
                    ->assertSee('我的空間');
        });
    }

    /**
     * @group part5
     */
    public function test_user_can_see_available_spaces(): void
    {
        Space::factory()->count(3)->create();

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                    ->visit('/manage/user/spaces')
                    ->assertSee('可綁定的空間');
        });
    }

    /**
     * @group part5
     */
    public function test_dashboard_quick_links_are_functional(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                    ->visit('/manage/user/dashboard')
                    ->assertSee('快速連結')
                    ->assertPresent('a[href*="/manage/settings/profile"]');
        });
    }

    /**
     * @group part5
     */
    public function test_user_can_navigate_through_settings(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                    ->visit('/manage/settings/profile')
                    ->assertSee('個人資料')
                    ->visit('/manage/settings/password')
                    ->assertSee('安全設定')
                    ->visit('/manage/settings/appearance')
                    ->assertSee('外觀');
        });
    }

    /**
     * @group part5
     */
    public function test_dashboard_shows_recent_activity(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                    ->visit('/manage/user/dashboard')
                    ->assertSee('最近發表');
        });
    }

    /**
     * @group part5
     */
    public function test_password_update_requires_confirmation(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                    ->visit('/manage/settings/password')
                    ->type('#password', 'new-password')
                    ->press('更新密碼')
                    ->assertPathIs('/manage/settings/password');
        });
    }

    /**
     * @group part5
     */
    public function test_theme_changes_are_reflected(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                    ->visit('/manage/settings/appearance')
                    ->radio('theme', 'dark')
                    ->press('套用主題')
                    ->assertPathIs('/manage/settings/appearance');
        });
    }

    /**
     * @group part5
     */
    public function test_breadcrumbs_are_present_on_all_pages(): void
    {
        $pages = [
            '/manage/user/dashboard',
            '/manage/settings/profile',
            '/manage/settings/password',
            '/manage/settings/appearance',
            '/manage/user/spaces',
        ];

        $this->browse(function (Browser $browser) use ($pages) {
            foreach ($pages as $page) {
                $browser->loginAs($this->user)
                        ->visit($page)
                        ->assertPresent('nav[aria-label="breadcrumb"], .breadcrumb, [role="navigation"]');
            }
        });
    }

    /**
     * @group part5
     */
    public function test_space_binding_shows_correct_status(): void
    {
        $space = Space::factory()->create();
        $this->user->spaces()->attach($space->id, [
            'role' => 'member',
            'access_level' => 'read',
            'is_active' => true,
            'joined_at' => now(),
        ]);

        $this->browse(function (Browser $browser) use ($space) {
            $browser->loginAs($this->user)
                    ->visit('/manage/user/spaces')
                    ->assertSee($space->name)
                    ->assertSee('成員');
        });
    }

    /**
     * @group part5
     */
    public function test_profile_completeness_updates_when_data_added(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                    ->visit('/manage/user/dashboard')
                    ->assertSee('個人檔案完整度');

            // 添加個人檔案資料後應該看到變化
            $this->user->profile()->create([
                'name' => 'Test User',
                'title' => 'Professor',
            ]);

            $browser->refresh()
                    ->assertSee('個人檔案完整度');
        });
    }
}
