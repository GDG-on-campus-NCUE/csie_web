<?php

namespace Tests\Feature\Manage\User;

use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class SupportTicketTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['role' => 'user']);
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    /**
     * 測試：使用者可以查看自己的工單列表
     */
    public function test_user_can_view_own_tickets(): void
    {
        SupportTicket::factory()->count(3)->create(['user_id' => $this->user->id]);
        SupportTicket::factory()->count(2)->create(); // 其他使用者的工單

        $response = $this->actingAs($this->user)
            ->get(route('manage.user.support.tickets.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('manage/user/support/tickets/index')
            ->has('tickets.data', 3)
        );
    }

    /**
     * 測試：使用者可以建立工單
     */
    public function test_user_can_create_ticket(): void
    {
        $data = [
            'subject' => 'Test Subject',
            'category' => 'technical',
            'priority' => 'medium',
            'message' => $this->faker->paragraph(3),
        ];

        $response = $this->actingAs($this->user)
            ->post(route('manage.user.support.tickets.store'), $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('support_tickets', [
            'user_id' => $this->user->id,
            'subject' => 'Test Subject',
            'category' => 'technical',
        ]);
    }

    /**
     * 測試：工單建立時需要必填欄位
     */
    public function test_ticket_creation_requires_fields(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('manage.user.support.tickets.store'), []);

        $response->assertSessionHasErrors(['subject', 'category', 'message']);
    }

    /**
     * 測試：工單訊息需要最少字數
     */
    public function test_ticket_message_has_minimum_length(): void
    {
        $data = [
            'subject' => 'Test',
            'category' => 'technical',
            'message' => 'Too short',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('manage.user.support.tickets.store'), $data);

        $response->assertSessionHasErrors(['message']);
    }

    /**
     * 測試：使用者可以查看自己的工單
     */
    public function test_user_can_view_own_ticket(): void
    {
        $ticket = SupportTicket::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->get(route('manage.user.support.tickets.show', $ticket));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('manage/user/support/tickets/show')
            ->has('ticket')
        );
    }

    /**
     * 測試：使用者不能查看其他人的工單
     */
    public function test_user_cannot_view_others_ticket(): void
    {
        $otherTicket = SupportTicket::factory()->create();

        $response = $this->actingAs($this->user)
            ->get(route('manage.user.support.tickets.show', $otherTicket));

        $response->assertForbidden();
    }

    /**
     * 測試：使用者可以回覆自己的工單
     */
    public function test_user_can_reply_to_own_ticket(): void
    {
        $ticket = SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('manage.user.support.tickets.reply', $ticket), [
                'message' => $this->faker->paragraph,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('support_ticket_replies', [
            'ticket_id' => $ticket->id,
            'user_id' => $this->user->id,
        ]);
    }

    /**
     * 測試：不能回覆已關閉的工單
     */
    public function test_cannot_reply_to_closed_ticket(): void
    {
        $ticket = SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'closed',
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('manage.user.support.tickets.reply', $ticket), [
                'message' => $this->faker->paragraph,
            ]);

        $response->assertSessionHasErrors();
    }

    /**
     * 測試：使用者可以關閉自己的工單
     */
    public function test_user_can_close_own_ticket(): void
    {
        $ticket = SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->user)
            ->put(route('manage.user.support.tickets.close', $ticket));

        $response->assertRedirect();
        $this->assertDatabaseHas('support_tickets', [
            'id' => $ticket->id,
            'status' => 'closed',
        ]);
    }

    /**
     * 測試：可以依狀態篩選工單
     */
    public function test_can_filter_tickets_by_status(): void
    {
        SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'open',
        ]);
        SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'closed',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('manage.user.support.tickets.index', ['status' => 'open']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('tickets.data', 1)
        );
    }

    /**
     * 測試：可以依優先級篩選工單
     */
    public function test_can_filter_tickets_by_priority(): void
    {
        SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'priority' => 'urgent',
        ]);
        SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'priority' => 'low',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('manage.user.support.tickets.index', ['priority' => 'urgent']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('tickets.data', 1)
        );
    }

    /**
     * 測試：可以依分類篩選工單
     */
    public function test_can_filter_tickets_by_category(): void
    {
        SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'category' => 'technical',
        ]);
        SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'category' => 'account',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('manage.user.support.tickets.index', ['category' => 'technical']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('tickets.data', 1)
        );
    }

    /**
     * 測試：可以搜尋工單
     */
    public function test_can_search_tickets(): void
    {
        SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => 'Unique Search Term',
        ]);
        SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => 'Other Subject',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('manage.user.support.tickets.index', ['search' => 'Unique']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('tickets.data', 1)
        );
    }

    /**
     * 測試：工單列表有分頁
     */
    public function test_tickets_are_paginated(): void
    {
        SupportTicket::factory()->count(20)->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->get(route('manage.user.support.tickets.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('tickets.data', 15)
            ->has('tickets.pagination')
        );
    }

    /**
     * 測試：管理員可以查看所有工單
     */
    public function test_admin_can_view_all_tickets(): void
    {
        SupportTicket::factory()->count(3)->create(['user_id' => $this->user->id]);
        SupportTicket::factory()->count(2)->create();

        $response = $this->actingAs($this->admin)
            ->get(route('manage.user.support.tickets.index'));

        $response->assertOk();
    }

    /**
     * 測試：工單狀態工作流
     */
    public function test_ticket_status_workflow(): void
    {
        $ticket = SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'open',
        ]);

        // 標記為處理中
        $ticket->markInProgress();
        $this->assertEquals('in_progress', $ticket->status);

        // 標記為已解決
        $ticket->markResolved();
        $this->assertEquals('resolved', $ticket->status);
        $this->assertNotNull($ticket->resolved_at);

        // 關閉
        $ticket->close();
        $this->assertEquals('closed', $ticket->status);
        $this->assertNotNull($ticket->closed_at);
    }

    /**
     * 測試：工單編號唯一性
     */
    public function test_ticket_number_is_unique(): void
    {
        $ticket1 = SupportTicket::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $ticket2 = SupportTicket::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $this->assertNotEquals($ticket1->ticket_number, $ticket2->ticket_number);
    }

    /**
     * 測試：工單可以附加標籤
     */
    public function test_can_attach_tags_to_ticket(): void
    {
        $tags = Tag::factory()->count(3)->create(['context' => 'support']);

        $data = [
            'subject' => $this->faker->sentence,
            'category' => 'technical',
            'priority' => 'medium',
            'message' => $this->faker->paragraph,
            'tag_ids' => $tags->pluck('id')->toArray(),
        ];

        $response = $this->actingAs($this->user)
            ->post(route('manage.user.support.tickets.store'), $data);

        $response->assertRedirect();

        $ticket = SupportTicket::where('subject', $data['subject'])->first();
        $this->assertCount(3, $ticket->tags);
    }

    /**
     * 測試：工單標籤數量限制
     */
    public function test_ticket_tags_limit(): void
    {
        $tags = Tag::factory()->count(6)->create(['context' => 'support']);

        $data = [
            'subject' => $this->faker->sentence,
            'category' => 'technical',
            'priority' => 'medium',
            'message' => $this->faker->paragraph,
            'tag_ids' => $tags->pluck('id')->toArray(),
        ];

        $response = $this->actingAs($this->user)
            ->post(route('manage.user.support.tickets.store'), $data);

        $response->assertSessionHasErrors(['tag_ids']);
    }

    /**
     * 測試：回覆訊息是必填的
     */
    public function test_reply_message_is_required(): void
    {
        $ticket = SupportTicket::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('manage.user.support.tickets.reply', $ticket), [
                'message' => '',
            ]);

        $response->assertSessionHasErrors(['message']);
    }

    /**
     * 測試：可以查看工單回覆歷史
     */
    public function test_can_view_ticket_reply_history(): void
    {
        $ticket = SupportTicket::factory()->create(['user_id' => $this->user->id]);

        SupportTicketReply::factory()->count(3)->create([
            'ticket_id' => $ticket->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('manage.user.support.tickets.show', $ticket));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('ticket.replies', 3)
        );
    }
}
