<?php

namespace Tests\Browser\Manage\User;

use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class NotificationSystemTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'user@example.com',
            'role' => 'user',
            'status' => 1,
        ]);
    }

    /**
     * 建立測試通知
     */
    protected function createNotification(User $user, array $data = []): DatabaseNotification
    {
        return $user->notifications()->create([
            'id' => Str::uuid(),
            'type' => 'App\\Notifications\\PostPublishedNotification',
            'data' => array_merge([
                'title' => '新公告發布',
                'message' => '系統管理員發布了新公告',
                'action_url' => '/manage/posts/1',
                'priority' => 'normal',
            ], $data),
            'read_at' => null,
        ]);
    }

    /**
     * 測試：查看通知中心
     */
    public function test_view_notification_center(): void
    {
        // 建立測試通知
        $this->createNotification($this->user, [
            'title' => '測試通知 1',
        ]);

        $this->createNotification($this->user, [
            'title' => '測試通知 2',
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/notifications')
                ->assertSee('通知中心')
                ->assertSee('測試通知 1')
                ->assertSee('測試通知 2');
        });
    }

    /**
     * 測試：標記單一通知為已讀
     */
    public function test_mark_notification_as_read(): void
    {
        $notification = $this->createNotification($this->user, [
            'title' => '未讀通知',
        ]);

        $this->browse(function (Browser $browser) use ($notification) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/notifications')
                ->assertSee('未讀通知')
                // 點擊標記已讀按鈕
                ->press('標記已讀')
                ->waitForText('已標記為已讀')
                ->pause(500);

            // 驗證資料庫
            $this->assertNotNull($notification->fresh()->read_at);
        });
    }

    /**
     * 測試：標記所有通知為已讀
     */
    public function test_mark_all_notifications_as_read(): void
    {
        $this->createNotification($this->user, ['title' => '通知 1']);
        $this->createNotification($this->user, ['title' => '通知 2']);
        $this->createNotification($this->user, ['title' => '通知 3']);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/notifications')
                ->press('全部標記已讀')
                ->waitForText('所有通知已標記為已讀')
                ->pause(500);

            // 驗證所有通知都已讀
            $unreadCount = $this->user->fresh()->unreadNotifications()->count();
            $this->assertEquals(0, $unreadCount);
        });
    }

    /**
     * 測試：刪除單一通知
     */
    public function test_delete_notification(): void
    {
        $notification = $this->createNotification($this->user, [
            'title' => '要刪除的通知',
        ]);

        $this->browse(function (Browser $browser) use ($notification) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/notifications')
                ->assertSee('要刪除的通知')
                ->press('刪除')
                ->waitForText('通知已刪除')
                ->assertDontSee('要刪除的通知');

            // 驗證資料庫
            $this->assertDatabaseMissing('notifications', [
                'id' => $notification->id,
            ]);
        });
    }

    /**
     * 測試：清除所有已讀通知
     */
    public function test_clear_all_read_notifications(): void
    {
        // 建立已讀通知
        $read1 = $this->createNotification($this->user, ['title' => '已讀 1']);
        $read1->update(['read_at' => now()]);

        $read2 = $this->createNotification($this->user, ['title' => '已讀 2']);
        $read2->update(['read_at' => now()]);

        // 建立未讀通知
        $this->createNotification($this->user, ['title' => '未讀']);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/notifications')
                ->press('清除已讀')
                ->waitForText('已讀通知已清除')
                ->assertDontSee('已讀 1')
                ->assertDontSee('已讀 2')
                ->assertSee('未讀');
        });
    }

    /**
     * 測試：點擊通知動作連結
     */
    public function test_click_notification_action_link(): void
    {
        $this->createNotification($this->user, [
            'title' => '新公告',
            'action_url' => '/manage/posts/1',
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/notifications')
                ->assertSee('新公告')
                ->clickLink('查看')
                ->assertPathIs('/manage/posts/1');
        });
    }

    /**
     * 測試：通知優先級顯示
     */
    public function test_notification_priority_display(): void
    {
        $this->createNotification($this->user, [
            'title' => '緊急通知',
            'priority' => 'urgent',
        ]);

        $this->createNotification($this->user, [
            'title' => '一般通知',
            'priority' => 'normal',
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/notifications')
                ->assertSee('緊急')
                ->assertSee('一般');
        });
    }

    /**
     * 測試：通知分頁功能
     */
    public function test_notification_pagination(): void
    {
        // 建立 15 個通知
        for ($i = 1; $i <= 15; $i++) {
            $this->createNotification($this->user, [
                'title' => "通知 {$i}",
            ]);
        }

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/notifications')
                ->assertSee('通知 1')
                ->assertSee('1')
                ->assertSee('2')
                ->clickLink('2')
                ->pause(500)
                ->assertQueryStringHas('page', '2');
        });
    }

    /**
     * 測試：查看通知偏好設定
     */
    public function test_view_notification_preferences(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/settings/notifications')
                ->assertSee('通知偏好設定')
                ->assertSee('公告發布')
                ->assertSee('公告更新')
                ->assertSee('Email')
                ->assertSee('站內通知')
                ->assertSee('LINE');
        });
    }

    /**
     * 測試：更新通知偏好設定
     */
    public function test_update_notification_preferences(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/settings/notifications')
                // 停用公告發布通知
                ->uncheck('post_published_enabled')
                // 只選擇 Email 頻道
                ->check('post_published_email')
                ->uncheck('post_published_app')
                ->uncheck('post_published_line')
                ->press('儲存設定')
                ->waitForText('設定已更新');

            // 驗證資料庫
            $this->assertDatabaseHas('notification_preferences', [
                'user_id' => $this->user->id,
                'notification_type' => 'post_published',
                'is_enabled' => false,
            ]);
        });
    }

    /**
     * 測試：切換所有通知類型
     */
    public function test_toggle_all_notification_types(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/settings/notifications')
                // 停用所有通知
                ->uncheck('post_published_enabled')
                ->uncheck('post_updated_enabled')
                ->uncheck('space_sync_failed_enabled')
                ->uncheck('permission_changed_enabled')
                ->uncheck('support_ticket_reply_enabled')
                ->uncheck('support_ticket_resolved_enabled')
                ->uncheck('lab_member_added_enabled')
                ->uncheck('project_milestone_enabled')
                ->press('儲存設定')
                ->waitForText('設定已更新');

            // 驗證所有類型都已停用
            $enabledCount = NotificationPreference::where('user_id', $this->user->id)
                ->where('is_enabled', true)
                ->count();

            $this->assertEquals(0, $enabledCount);
        });
    }

    /**
     * 測試：選擇多個通知頻道
     */
    public function test_select_multiple_notification_channels(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/settings/notifications')
                // 為公告發布選擇所有頻道
                ->check('post_published_email')
                ->check('post_published_app')
                ->check('post_published_line')
                ->press('儲存設定')
                ->waitForText('設定已更新');

            // 驗證
            $preference = NotificationPreference::where([
                'user_id' => $this->user->id,
                'notification_type' => 'post_published',
            ])->first();

            $this->assertContains('email', $preference->channels);
            $this->assertContains('app', $preference->channels);
            $this->assertContains('line', $preference->channels);
        });
    }

    /**
     * 測試：空的通知列表顯示
     */
    public function test_empty_notifications_display(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/notifications')
                ->assertSee('目前沒有通知')
                ->assertSee('暫無通知');
        });
    }

    /**
     * 測試：未讀通知高亮顯示
     */
    public function test_unread_notifications_highlighted(): void
    {
        // 建立未讀通知
        $this->createNotification($this->user, ['title' => '未讀']);

        // 建立已讀通知
        $read = $this->createNotification($this->user, ['title' => '已讀']);
        $read->update(['read_at' => now()]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/notifications')
                ->assertSee('未讀')
                ->assertSee('已讀')
                // 檢查 CSS class（未讀通知應該有特殊樣式）
                ->assertPresent('.border-l-primary'); // 未讀標記
        });
    }

    /**
     * 測試：通知中心與偏好設定頁面切換
     */
    public function test_navigate_between_notifications_and_preferences(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/notifications')
                ->assertSee('通知中心')
                ->clickLink('偏好設定')
                ->assertPathIs('/manage/settings/notifications')
                ->assertSee('通知偏好設定')
                ->clickLink('返回通知中心')
                ->assertPathIs('/manage/user/notifications');
        });
    }

    /**
     * 測試：即時通知計數更新
     */
    public function test_realtime_notification_count_updates(): void
    {
        $this->createNotification($this->user, ['title' => '通知 1']);
        $this->createNotification($this->user, ['title' => '通知 2']);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/notifications')
                ->assertSee('2') // 未讀計數
                ->press('全部標記已讀')
                ->waitForText('所有通知已標記為已讀')
                ->pause(500)
                ->assertSee('0'); // 計數應該變為 0
        });
    }
}
