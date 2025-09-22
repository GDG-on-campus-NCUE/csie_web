<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Manage\AttachmentResource;
use App\Models\Attachment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AttachmentController extends Controller
{
    /** @var list<int> */
    private array $perPageOptions = [15, 30, 50, 100, 200];

    /**
     * 附件列表。
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Attachment::class);

        $query = Attachment::query()
            ->with(['attachable', 'uploader']);

        $filters = $this->applyFilters($request, $query);
        [$sortColumn, $direction, $sortParam] = $this->resolveSort($request);

        $perPage = $this->resolvePerPage($request);

        $attachments = $query
            ->orderBy($sortColumn, $direction)
            ->paginate($perPage)
            ->withQueryString();

        $resource = AttachmentResource::collection($attachments);
        $payload = $resource->response()->getData(true);

        $attachedTypes = Attachment::query()
            ->withTrashed()
            ->select('attached_to_type')
            ->distinct()
            ->pluck('attached_to_type')
            ->filter()
            ->values();

        return Inertia::render('manage/attachments/index', [
            'attachments' => $payload,
            'filters' => array_merge($filters, [
                'sort' => $sortParam,
                'per_page' => (string) $perPage,
            ]),
            'typeOptions' => ['image', 'document', 'link'],
            'visibilityOptions' => ['public', 'private'],
            'attachedTypeOptions' => $attachedTypes,
            'perPageOptions' => $this->perPageOptions,
            'sortOptions' => $this->sortOptions(),
        ]);
    }

    public function destroy(Request $request, Attachment $attachment): RedirectResponse
    {
        $this->authorize('delete', $attachment);

        $attachment->delete();

        return redirect()
            ->route('manage.attachments.index', $request->only(['page']))
            ->with('success', '附件已移至回收桶');
    }

    public function restore(Request $request, int $attachment): RedirectResponse
    {
        $record = Attachment::withTrashed()->findOrFail($attachment);

        $this->authorize('restore', $record);

        $record->restore();

        return redirect()
            ->route('manage.attachments.index', $request->only(['page']))
            ->with('success', '附件已復原');
    }

    public function forceDelete(Request $request, int $attachment): RedirectResponse
    {
        $record = Attachment::withTrashed()->findOrFail($attachment);

        $this->authorize('forceDelete', $record);

        $record->deleteFileFromDisk();
        $record->forceDelete();

        return redirect()
            ->route('manage.attachments.index', $request->only(['page']))
            ->with('success', '附件已永久刪除');
    }

    public function bulk(Request $request): RedirectResponse
    {
        $this->authorize('viewAny', Attachment::class);

        $data = $request->validate([
            'action' => ['required', Rule::in(['delete', 'force'])],
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:attachments,id'],
        ]);

        $ids = collect($data['ids'])->unique()->values();
        $attachments = Attachment::withTrashed()->whereIn('id', $ids)->get();

        if ($attachments->isEmpty()) {
            return back()->with('info', '未找到選取的附件');
        }

        if ($data['action'] === 'delete') {
            foreach ($attachments as $attachment) {
                $this->authorize('delete', $attachment);
                if (! $attachment->trashed()) {
                    $attachment->delete();
                }
            }

            return redirect()
                ->route('manage.attachments.index')
                ->with('success', '已將選取的附件移至回收桶');
        }

        foreach ($attachments as $attachment) {
            $this->authorize('forceDelete', $attachment);
            $attachment->deleteFileFromDisk();
            $attachment->forceDelete();
        }

        return redirect()
            ->route('manage.attachments.index')
            ->with('success', '已永久刪除選取的附件');
    }

    /**
     * @return array{search: string, type: string, attached_to_type: string, attached_to_id: string, visibility: string, trashed: string}
     */
    private function applyFilters(Request $request, Builder $query): array
    {
        $search = trim((string) $request->input('search', ''));
        if ($search !== '') {
            $query->where(function (Builder $inner) use ($search) {
                $inner->where('title', 'like', "%{$search}%")
                    ->orWhere('filename', 'like', "%{$search}%")
                    ->orWhere('external_url', 'like', "%{$search}%")
                    ->orWhere('mime_type', 'like', "%{$search}%");
            });
        }

        $type = $request->input('type');
        if (in_array($type, ['image', 'document', 'link'], true)) {
            $query->where('type', $type);
        } else {
            $type = '';
        }

        $attachedType = $request->input('attached_to_type');
        if (is_string($attachedType) && $attachedType !== '') {
            $query->where('attached_to_type', $attachedType);
        } else {
            $attachedType = '';
        }

        $attachedId = '';
        if ($request->filled('attached_to_id')) {
            $value = $request->input('attached_to_id');
            if (is_numeric($value)) {
                $attachedId = (string) $value;
                $query->where('attached_to_id', (int) $value);
            }
        }

        $visibility = $request->input('visibility');
        if (in_array($visibility, ['public', 'private'], true)) {
            $query->where('visibility', $visibility);
        } else {
            $visibility = '';
        }

        $trashed = $request->input('trashed');
        if ($trashed === 'with') {
            $query->withTrashed();
        } elseif ($trashed === 'only') {
            $query->onlyTrashed();
        } else {
            $trashed = '';
        }

        return [
            'search' => $search,
            'type' => is_string($type) ? $type : '',
            'attached_to_type' => $attachedType,
            'attached_to_id' => $attachedId,
            'visibility' => is_string($visibility) ? $visibility : '',
            'trashed' => $trashed,
        ];
    }

    /**
     * @return array{0: string, 1: 'asc'|'desc', 2: string}
     */
    private function resolveSort(Request $request): array
    {
        $sort = (string) $request->input('sort', '-created_at');
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $columnKey = ltrim($sort, '-');

        $allowed = [
            'created_at' => 'created_at',
            'filename' => 'filename',
            'size' => 'size',
            'type' => 'type',
        ];

        if (! array_key_exists($columnKey, $allowed)) {
            $columnKey = 'created_at';
            $direction = 'desc';
            $sort = '-created_at';
        }

        return [$allowed[$columnKey], $direction, $sort];
    }

    private function resolvePerPage(Request $request): int
    {
        $perPage = (int) $request->input('per_page', 15);

        if ($perPage < 1) {
            $perPage = 15;
        }

        if ($perPage > 200) {
            $perPage = 200;
        }

        return $perPage;
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function sortOptions(): array
    {
        return [
            ['value' => '-created_at', 'label' => '上傳時間（新到舊）'],
            ['value' => 'created_at', 'label' => '上傳時間（舊到新）'],
            ['value' => 'filename', 'label' => '檔名（A → Z）'],
            ['value' => '-filename', 'label' => '檔名（Z → A）'],
            ['value' => '-size', 'label' => '檔案大小（大到小）'],
            ['value' => 'size', 'label' => '檔案大小（小到大）'],
        ];
    }
}
