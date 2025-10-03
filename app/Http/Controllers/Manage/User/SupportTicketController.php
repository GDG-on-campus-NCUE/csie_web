<?php

namespace App\Http\Controllers\Manage\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manage\User\StoreSupportTicketRequest;
use App\Models\ManageActivity;
use App\Models\SupportTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupportTicketController extends Controller
{
    /**
     * 顯示工單列表
     */
    public function index(Request $request): Response
    {
        $query = SupportTicket::query()
            ->with(['user:id,name', 'assignedTo:id,name', 'tags:id,name,slug'])
            ->where('user_id', $request->user()->id);

        // 搜尋
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        // 狀態篩選
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // 分類篩選
        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        // 優先級篩選
        if ($priority = $request->input('priority')) {
            $query->where('priority', $priority);
        }

        $tickets = $query->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15))
            ->withQueryString();

        return Inertia::render('manage/user/support/tickets/index', [
            'tickets' => [
                'data' => $tickets->items(),
                'pagination' => [
                    'current_page' => $tickets->currentPage(),
                    'last_page' => $tickets->lastPage(),
                    'per_page' => $tickets->perPage(),
                    'total' => $tickets->total(),
                ],
            ],
            'filters' => $request->only(['search', 'status', 'priority', 'category']),
        ]);
    }

    /**
     * 顯示建立工單表單
     */
    public function create(): Response
    {
        return Inertia::render('manage/user/support/tickets/create', [
            'categoryOptions' => $this->getCategoryOptions(),
            'priorityOptions' => $this->getPriorityOptions(),
        ]);
    }

    /**
     * 儲存新工單
     */
    public function store(StoreSupportTicketRequest $request): RedirectResponse
    {
        $ticket = SupportTicket::create([
            'user_id' => $request->user()->id,
            'ticket_number' => SupportTicket::generateTicketNumber(),
            'subject' => $request->validated('subject'),
            'category' => $request->validated('category'),
            'priority' => $request->validated('priority', 'medium'),
            'message' => $request->validated('message'),
            'status' => SupportTicket::STATUS_OPEN,
        ]);

        // 附件處理
        if ($attachmentIds = $request->validated('attachment_ids')) {
            $ticket->attachments()->sync($attachmentIds);
        }

        // 標籤處理
        if ($tagIds = $request->validated('tag_ids')) {
            $ticket->tags()->sync($tagIds);
        }

        // 記錄活動
        ManageActivity::log(
            $request->user(),
            'create',
            $ticket,
            [],
            "建立支援工單：{$ticket->subject}"
        );

        return redirect()
            ->route('manage.user.support.tickets.show', $ticket)
            ->with('success', '工單已成功建立');
    }

    /**
     * 顯示工單詳情
     */
    public function show(SupportTicket $ticket): Response
    {
        // 確保只能查看自己的工單
        $this->authorize('view', $ticket);

        $ticket->load([
            'user:id,name,email',
            'assignedTo:id,name',
            'replies.user:id,name',
            'attachments',
            'tags:id,name,slug',
        ]);

        return Inertia::render('manage/user/support/tickets/show', [
            'ticket' => array_merge($ticket->toArray(), [
                'can_reply' => $ticket->canReply(),
            ]),
        ]);
    }

    /**
     * 回覆工單
     */
    public function reply(Request $request, SupportTicket $ticket): RedirectResponse
    {
        $this->authorize('view', $ticket);

        $request->validate([
            'message' => 'required|string|min:10',
        ]);

        if (!$ticket->canReply()) {
            return back()->withErrors(['message' => '此工單已關閉，無法回覆']);
        }

        $ticket->replies()->create([
            'user_id' => $request->user()->id,
            'message' => $request->input('message'),
            'is_staff_reply' => false,
        ]);

        // 記錄活動
        ManageActivity::log(
            $request->user(),
            'reply',
            $ticket,
            [],
            "回覆工單：{$ticket->ticket_number}"
        );

        return back()->with('success', '回覆已送出');
    }

    /**
     * 關閉工單
     */
    public function close(SupportTicket $ticket): RedirectResponse
    {
        $this->authorize('update', $ticket);

        $ticket->close();

        // 記錄活動
        ManageActivity::log(
            auth()->user(),
            'close',
            $ticket,
            [],
            "關閉工單：{$ticket->ticket_number}"
        );

        return back()->with('success', '工單已關閉');
    }

    /**
     * 取得狀態選項
     */
    private function getStatusOptions(): array
    {
        return [
            ['value' => SupportTicket::STATUS_OPEN, 'label' => '開啟中'],
            ['value' => SupportTicket::STATUS_IN_PROGRESS, 'label' => '處理中'],
            ['value' => SupportTicket::STATUS_RESOLVED, 'label' => '已解決'],
            ['value' => SupportTicket::STATUS_CLOSED, 'label' => '已關閉'],
        ];
    }

    /**
     * 取得分類選項
     */
    private function getCategoryOptions(): array
    {
        return [
            ['value' => SupportTicket::CATEGORY_TECHNICAL, 'label' => '技術問題'],
            ['value' => SupportTicket::CATEGORY_ACCOUNT, 'label' => '帳號問題'],
            ['value' => SupportTicket::CATEGORY_FEATURE, 'label' => '功能建議'],
            ['value' => SupportTicket::CATEGORY_OTHER, 'label' => '其他'],
        ];
    }

    /**
     * 取得優先級選項
     */
    private function getPriorityOptions(): array
    {
        return [
            ['value' => SupportTicket::PRIORITY_LOW, 'label' => '低'],
            ['value' => SupportTicket::PRIORITY_MEDIUM, 'label' => '中'],
            ['value' => SupportTicket::PRIORITY_HIGH, 'label' => '高'],
            ['value' => SupportTicket::PRIORITY_URGENT, 'label' => '緊急'],
        ];
    }
}
