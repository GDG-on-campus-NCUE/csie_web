<?php

namespace Tests\Feature\Manage;

use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class MessageManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_contact_messages(): void
    {
        $admin = User::factory()->admin()->create();
        $message = ContactMessage::factory()->create([
            'subject' => '系統權限問題',
            'name' => '張小明',
            'email' => 'student@example.com',
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('manage.messages.index'));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) =>
            $page->component('manage/admin/messages/index')
                ->has('messages.data', 1, fn (AssertableInertia $item) =>
                    $item
                        ->where('id', $message->id)
                        ->where('subject', '系統權限問題')
                        ->where('email', 'student@example.com')
                        ->etc()
                )
        );
    }

    public function test_messages_can_be_filtered_by_status(): void
    {
        $admin = User::factory()->admin()->create();
        ContactMessage::factory()->create([
            'subject' => '一般諮詢',
            'status' => 'new',
        ]);
        $resolved = ContactMessage::factory()->resolved()->create([
            'subject' => '已結案',
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('manage.messages.index', [
                'status' => 'resolved',
            ]));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) =>
            $page->component('manage/admin/messages/index')
                ->where('messages.meta.total', 1)
                ->where('messages.data.0.id', $resolved->id)
        );
    }
}
