<?php

namespace Tests\Browser\Manage\User;

use App\Models\SupportTicket;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class SupportSystemTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected User $user;
    protected User $staff;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'user@example.com',
            'role' => 'user',
            'status' => 1,
        ]);

        $this->staff = User::factory()->create([
            'name' => 'Staff User',
            'email' => 'staff@example.com',
            'role' => 'admin',
            'status' => 1,
        ]);
    }

    /**
     * 測試：完整的建立工單流程
     */
    public function test_complete_ticket_creation_flow(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/support/tickets')
                ->assertSee('支援工單')
                ->clickLink('建立工單')
                ->assertPathIs('/manage/user/support/tickets/create')
                ->type('subject', '測試工單標題')
                ->select('category', 'technical')
                ->select('priority', 'normal')
                ->type('message', '這是測試訊息內容')
                ->press('送出')
                ->waitForText('工單已建立')
                ->assertPathBeginsWith('/manage/user/support/tickets/');

            // 驗證資料庫
            $this->assertDatabaseHas('support_tickets', [
                'user_id' => $this->user->id,
                'subject' => '測試工單標題',
                'category' => 'technical',
                'priority' => 'normal',
                'status' => 'open',
            ]);
        });
    }

    /**
     * 測試：工單列表顯示與篩選
     */
    public function test_ticket_list_and_filters(): void
    {
        // 建立測試資料
        SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => '技術問題',
            'category' => 'technical',
            'status' => 'open',
        ]);

        SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => '帳號問題',
            'category' => 'account',
            'status' => 'resolved',
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/support/tickets')
                ->assertSee('技術問題')
                ->assertSee('帳號問題')
                // 依狀態篩選
                ->select('status', 'open')
                ->pause(500)
                ->assertSee('技術問題')
                ->assertDontSee('帳號問題')
                // 清除篩選
                ->select('status', '')
                ->pause(500)
                ->assertSee('技術問題')
                ->assertSee('帳號問題');
        });
    }

    /**
     * 測試：查看工單詳情並回覆
     */
    public function test_view_ticket_and_reply(): void
    {
        $ticket = SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => '需要協助',
            'status' => 'open',
        ]);

        $this->browse(function (Browser $browser) use ($ticket) {
            $browser->loginAs($this->user)
                ->visit("/manage/user/support/tickets/{$ticket->id}")
                ->assertSee('需要協助')
                ->assertSee($ticket->ticket_number)
                // 新增回覆
                ->type('message', '我需要更多說明')
                ->press('送出回覆')
                ->waitForText('回覆已送出')
                ->assertSee('我需要更多說明');

            // 驗證資料庫
            $this->assertDatabaseHas('support_ticket_replies', [
                'support_ticket_id' => $ticket->id,
                'user_id' => $this->user->id,
                'message' => '我需要更多說明',
                'is_staff' => false,
            ]);
        });
    }

    /**
     * 測試：客服人員回覆工單
     */
    public function test_staff_can_reply_to_ticket(): void
    {
        $ticket = SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => '需要協助',
            'status' => 'open',
        ]);

        $this->browse(function (Browser $browser) use ($ticket) {
            $browser->loginAs($this->staff)
                ->visit("/manage/user/support/tickets/{$ticket->id}")
                ->assertSee('需要協助')
                ->type('message', '我們會盡快處理您的問題')
                ->press('送出回覆')
                ->waitForText('回覆已送出')
                ->assertSee('我們會盡快處理您的問題');

            // 驗證 is_staff 標記
            $this->assertDatabaseHas('support_ticket_replies', [
                'support_ticket_id' => $ticket->id,
                'user_id' => $this->staff->id,
                'is_staff' => true,
            ]);
        });
    }

    /**
     * 測試：關閉工單流程
     */
    public function test_close_ticket_flow(): void
    {
        $ticket = SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => '已解決的問題',
            'status' => 'resolved',
        ]);

        $this->browse(function (Browser $browser) use ($ticket) {
            $browser->loginAs($this->user)
                ->visit("/manage/user/support/tickets/{$ticket->id}")
                ->assertSee('已解決的問題')
                ->press('關閉工單')
                ->waitForText('工單已關閉')
                ->assertSee('已關閉');

            // 驗證狀態變更
            $this->assertDatabaseHas('support_tickets', [
                'id' => $ticket->id,
                'status' => 'closed',
            ]);
        });
    }

    /**
     * 測試：已關閉的工單無法回覆
     */
    public function test_cannot_reply_to_closed_ticket(): void
    {
        $ticket = SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => '已關閉的工單',
            'status' => 'closed',
        ]);

        $this->browse(function (Browser $browser) use ($ticket) {
            $browser->loginAs($this->user)
                ->visit("/manage/user/support/tickets/{$ticket->id}")
                ->assertSee('已關閉的工單')
                ->assertMissing('textarea[name="message"]'); // 回覆表單應該隱藏
        });
    }

    /**
     * 測試：表單驗證錯誤顯示
     */
    public function test_form_validation_errors_are_displayed(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/support/tickets/create')
                ->press('送出')
                ->waitForText('此欄位為必填')
                ->assertSee('此欄位為必填');
        });
    }

    /**
     * 測試：搜尋工單功能
     */
    public function test_search_tickets(): void
    {
        SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => '密碼重設問題',
        ]);

        SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => '附件上傳問題',
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/support/tickets')
                ->type('search', '密碼')
                ->pause(500)
                ->assertSee('密碼重設問題')
                ->assertDontSee('附件上傳問題');
        });
    }

    /**
     * 測試：FAQ 列表瀏覽
     */
    public function test_browse_faq_list(): void
    {
        $this->seed(\Database\Seeders\SupportFaqSeeder::class);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/support/faqs')
                ->assertSee('常見問題')
                ->assertSee('帳號相關')
                ->assertSee('技術問題');
        });
    }

    /**
     * 測試：查看 FAQ 詳情
     */
    public function test_view_faq_details(): void
    {
        $this->seed(\Database\Seeders\SupportFaqSeeder::class);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/support/faqs')
                // 點擊第一個 FAQ
                ->clickLink('如何重設密碼')
                ->assertPathBeginsWith('/manage/user/support/faqs/')
                ->assertSee('如何重設密碼')
                ->assertSee('相關問題'); // 確認有相關問題區塊
        });
    }

    /**
     * 測試：FAQ 搜尋功能
     */
    public function test_search_faqs(): void
    {
        $this->seed(\Database\Seeders\SupportFaqSeeder::class);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/support/faqs')
                ->type('search', '密碼')
                ->pause(500)
                ->assertSee('密碼')
                ->assertDontSee('上傳');
        });
    }

    /**
     * 測試：FAQ 分類篩選
     */
    public function test_filter_faqs_by_category(): void
    {
        $this->seed(\Database\Seeders\SupportFaqSeeder::class);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/support/faqs')
                ->select('category', 'account')
                ->pause(500)
                ->assertSee('帳號')
                ->assertDontSee('Space');
        });
    }

    /**
     * 測試：從 FAQ 建立工單
     */
    public function test_create_ticket_from_faq(): void
    {
        $this->seed(\Database\Seeders\SupportFaqSeeder::class);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/support/faqs')
                ->assertSee('找不到答案')
                ->clickLink('建立支援工單')
                ->assertPathIs('/manage/user/support/tickets/create');
        });
    }

    /**
     * 測試：工單狀態徽章顯示
     */
    public function test_ticket_status_badges_display(): void
    {
        SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => 'Open Ticket',
            'status' => 'open',
        ]);

        SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => 'Resolved Ticket',
            'status' => 'resolved',
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/support/tickets')
                ->assertSee('待處理')
                ->assertSee('已解決');
        });
    }

    /**
     * 測試：優先級徽章顯示
     */
    public function test_priority_badges_display(): void
    {
        SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => 'Urgent Issue',
            'priority' => 'urgent',
        ]);

        SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => 'Normal Issue',
            'priority' => 'normal',
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/support/tickets')
                ->assertSee('緊急')
                ->assertSee('一般');
        });
    }

    /**
     * 測試：分頁功能
     */
    public function test_pagination_works(): void
    {
        // 建立 15 個工單
        SupportTicket::factory()->count(15)->create([
            'user_id' => $this->user->id,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->user)
                ->visit('/manage/user/support/tickets')
                ->assertSee('1')
                ->assertSee('2')
                ->clickLink('2')
                ->pause(500)
                ->assertQueryStringHas('page', '2');
        });
    }
}
