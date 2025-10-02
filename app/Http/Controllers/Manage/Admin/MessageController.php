<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Manage\ContactMessageResource;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    /**
     * 顯示聯絡表單訊息。
     */
    public function index(Request $request): Response
    {
        $filters = [
            'keyword' => $request->string('keyword')->trim()->toString() ?: null,
            'status' => Str::lower($request->string('status')->toString()) ?: null,
            'from' => $request->string('from')->trim()->toString() ?: null,
            'to' => $request->string('to')->trim()->toString() ?: null,
            'per_page' => $request->integer('per_page') ?: null,
        ];

        $perPage = $filters['per_page'] ?? 15;
        $perPage = max(5, min(60, $perPage));

        $query = ContactMessage::query()
            ->with('processor:id,name');

        if ($filters['keyword']) {
            $keyword = '%' . Str::lower($filters['keyword']) . '%';
            $query->where(function ($builder) use ($keyword) {
                $builder->whereRaw('LOWER(subject) LIKE ?', [$keyword])
                    ->orWhereRaw('LOWER(name) LIKE ?', [$keyword])
                    ->orWhereRaw('LOWER(email) LIKE ?', [$keyword]);
            });
        }

        if ($filters['status'] && isset(ContactMessage::STATUS_MAP[$filters['status']])) {
            $query->where('status', ContactMessage::STATUS_MAP[$filters['status']]);
        }

        if ($filters['from']) {
            try {
                $from = Carbon::parse($filters['from'])->startOfDay();
                $query->where('created_at', '>=', $from);
            } catch (\Throwable $exception) {
                // ignore invalid date
            }
        }

        if ($filters['to']) {
            try {
                $to = Carbon::parse($filters['to'])->endOfDay();
                $query->where('created_at', '<=', $to);
            } catch (\Throwable $exception) {
                // ignore invalid date
            }
        }

        $messages = $query->orderByDesc('created_at')->paginate($perPage)->withQueryString();

        $messageData = [
            'data' => collect($messages->items())
                ->map(fn (ContactMessage $message) => ContactMessageResource::make($message)->resolve())
                ->all(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'from' => $messages->firstItem(),
                'last_page' => $messages->lastPage(),
                'path' => $messages->path(),
                'per_page' => $messages->perPage(),
                'to' => $messages->lastItem(),
                'total' => $messages->total(),
                'links' => Arr::get($messages->toArray(), 'links', []),
            ],
        ];

        $statusSummary = ContactMessage::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->mapWithKeys(fn ($count, $status) => [array_flip(ContactMessage::STATUS_MAP)[$status] ?? $status => (int) $count])
            ->all();

        $filterOptions = [
            'statuses' => collect(ContactMessage::STATUS_MAP)
                ->keys()
                ->map(fn (string $status) => [
                    'value' => $status,
                    'label' => __('manage.messages.status.' . $status, ['status' => $status]),
                    'count' => $statusSummary[$status] ?? 0,
                ])->values()->all(),
        ];

        return Inertia::render('manage/admin/messages/index', [
            'messages' => $messageData,
            'filters' => [
                'keyword' => $filters['keyword'],
                'status' => $filters['status'],
                'from' => $filters['from'],
                'to' => $filters['to'],
                'per_page' => $perPage,
            ],
            'filterOptions' => $filterOptions,
            'statusSummary' => $statusSummary,
        ]);
    }

    /**
     * 顯示建立訊息頁面。
     */
    public function create(): Response
    {
        return Inertia::render('manage/admin/messages/index');
    }

    /**
     * 儲存新訊息。
     */
    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('manage.messages.index');
    }

    /**
     * 顯示訊息內容。
     */
    public function show(string $message): Response
    {
        return Inertia::render('manage/admin/messages/index');
    }

    /**
     * 顯示編輯訊息頁面。
     */
    public function edit(string $message): Response
    {
        return Inertia::render('manage/admin/messages/index');
    }

    /**
     * 更新訊息。
     */
    public function update(Request $request, string $message): RedirectResponse
    {
        return redirect()->route('manage.messages.index');
    }

    /**
     * 刪除訊息。
     */
    public function destroy(string $message): RedirectResponse
    {
        return redirect()->route('manage.messages.index');
    }
}
