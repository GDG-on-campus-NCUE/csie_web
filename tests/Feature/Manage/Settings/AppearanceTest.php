<?php

namespace Tests\Feature\Manage\Settings;

use App\Models\User;
use App\Models\ManageActivity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppearanceTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_appearance_page_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get(route('manage.settings.appearance.edit'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('manage/settings/appearance')
            ->has('currentTheme')
            ->has('currentFontSize')
            ->has('currentLanguage')
            ->has('sidebarPinned')
        );
    }

    public function test_appearance_settings_can_be_updated(): void
    {
        $response = $this->actingAs($this->user)->put(route('manage.settings.appearance.update'), [
            'theme' => 'dark',
            'font_size' => 'large',
            'language' => 'en',
            'sidebar_pinned' => false,
        ]);

        $response->assertRedirect(route('manage.settings.appearance.edit'));
        $response->assertSessionHas('success');

        $preferences = $this->user->fresh()->preferences;
        $this->assertEquals('dark', $preferences['theme']);
        $this->assertEquals('large', $preferences['font_size']);
        $this->assertEquals('en', $preferences['language']);
        $this->assertFalse($preferences['sidebar_pinned']);
    }

    public function test_appearance_update_logs_activity(): void
    {
        $this->actingAs($this->user)->put(route('manage.settings.appearance.update'), [
            'theme' => 'dark',
        ]);

        $this->assertDatabaseHas('manage_activities', [
            'user_id' => $this->user->id,
            'activity_type' => 'appearance',
            'action' => 'update',
        ]);
    }

    public function test_theme_must_be_valid(): void
    {
        $response = $this->actingAs($this->user)->put(route('manage.settings.appearance.update'), [
            'theme' => 'invalid-theme',
        ]);

        $response->assertSessionHasErrors('theme');
    }

    public function test_font_size_must_be_valid(): void
    {
        $response = $this->actingAs($this->user)->put(route('manage.settings.appearance.update'), [
            'font_size' => 'invalid-size',
        ]);

        $response->assertSessionHasErrors('font_size');
    }

    public function test_language_must_be_valid(): void
    {
        $response = $this->actingAs($this->user)->put(route('manage.settings.appearance.update'), [
            'language' => 'invalid-lang',
        ]);

        $response->assertSessionHasErrors('language');
    }

    public function test_sidebar_pinned_must_be_boolean(): void
    {
        $response = $this->actingAs($this->user)->put(route('manage.settings.appearance.update'), [
            'sidebar_pinned' => 'not-a-boolean',
        ]);

        $response->assertSessionHasErrors('sidebar_pinned');
    }

    public function test_appearance_settings_are_optional(): void
    {
        $response = $this->actingAs($this->user)->put(route('manage.settings.appearance.update'), []);

        $response->assertSessionHasNoErrors();
    }

    public function test_appearance_update_merges_with_existing_preferences(): void
    {
        // 設定初始偏好
        $this->user->update([
            'preferences' => [
                'theme' => 'light',
                'font_size' => 'medium',
                'other_setting' => 'value',
            ],
        ]);

        // 只更新 theme
        $this->actingAs($this->user)->put(route('manage.settings.appearance.update'), [
            'theme' => 'dark',
        ]);

        $preferences = $this->user->fresh()->preferences;
        $this->assertEquals('dark', $preferences['theme']);
        $this->assertEquals('medium', $preferences['font_size']);
        $this->assertEquals('value', $preferences['other_setting']);
    }

    public function test_appearance_update_requires_authentication(): void
    {
        $response = $this->put(route('manage.settings.appearance.update'), [
            'theme' => 'dark',
        ]);

        $response->assertRedirect(route('login'));
    }

    public function test_default_values_are_shown_when_no_preferences(): void
    {
        $response = $this->actingAs($this->user)->get(route('manage.settings.appearance.edit'));

        $response->assertInertia(fn ($page) => $page
            ->where('currentTheme', 'system')
            ->where('currentFontSize', 'medium')
            ->where('currentLanguage', 'zh-TW')
            ->where('sidebarPinned', true)
        );
    }

    public function test_valid_theme_options_are_accepted(): void
    {
        $themes = ['light', 'dark', 'system'];

        foreach ($themes as $theme) {
            $response = $this->actingAs($this->user)->put(route('manage.settings.appearance.update'), [
                'theme' => $theme,
            ]);

            $response->assertSessionHasNoErrors();
        }
    }

    public function test_valid_font_size_options_are_accepted(): void
    {
        $sizes = ['small', 'medium', 'large'];

        foreach ($sizes as $size) {
            $response = $this->actingAs($this->user)->put(route('manage.settings.appearance.update'), [
                'font_size' => $size,
            ]);

            $response->assertSessionHasNoErrors();
        }
    }

    public function test_valid_language_options_are_accepted(): void
    {
        $languages = ['zh-TW', 'en'];

        foreach ($languages as $language) {
            $response = $this->actingAs($this->user)->put(route('manage.settings.appearance.update'), [
                'language' => $language,
            ]);

            $response->assertSessionHasNoErrors();
        }
    }
}
