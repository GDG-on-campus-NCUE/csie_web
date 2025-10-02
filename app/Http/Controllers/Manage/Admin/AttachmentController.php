<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manage\Admin\StoreAttachmentRequest;
use App\Http\Resources\Manage\AttachmentResource;
use App\Models\Attachment;
use App\Models\ManageActivity;
use App\Models\Post;
use App\Models\Space;
use App\Models\Tag;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AttachmentController extends Controller
{
    /**
     * 顯示附件資源列表。
     * 支援多維度篩選（關鍵字、類型、可見性、Space、標籤、日期範圍）、
     * 排序（建立時間、名稱、檔案大小）、以及 Grid/List 兩種檢視模式。
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Attachment::class);

        $filters = [
            'keyword' => $request->string('keyword')->trim()->toString() ?: null,
            'type' => Str::lower($request->string('type')->toString()) ?: null,
            'visibility' => Str::lower($request->string('visibility')->toString()) ?: null,
            'space' => $request->integer('space') ?: null,
            'tag' => $request->string('tag')->trim()->toString() ?: null,
            'from' => $request->string('from')->trim()->toString() ?: null,
            'to' => $request->string('to')->trim()->toString() ?: null,
            'sort' => $request->string('sort')->trim()->toString() ?: 'created_at',
            'direction' => Str::lower($request->string('direction')->toString()) ?: 'desc',
            'per_page' => $request->integer('per_page') ?: null,
            'view' => $request->string('view')->trim()->toString() ?: null,
        ];

        $perPage = $filters['per_page'] ?? 15;
        $perPage = max(5, min(60, $perPage));

        $viewMode = in_array($filters['view'], ['grid', 'list'], true) ? $filters['view'] : 'list';

        // 建立附件查詢並載入關聯資料（上傳者、Space、所屬資源）
        $query = Attachment::query()
            ->with([
                'uploader:id,name,email',
                'space:id,name',
                'attachable' => function (MorphTo $morphTo) {
                    $morphTo->morphWith([
                        Post::class => ['space:id,name'],
                    ]);
                },
            ]);

        // 關鍵字搜尋：標題或檔名（不區分大小寫）
        if ($filters['keyword']) {
            $keyword = '%' . Str::lower($filters['keyword']) . '%';
            $query->where(function ($builder) use ($keyword) {
                $builder->whereRaw('LOWER(title) LIKE ?', [$keyword])
                    ->orWhereRaw('LOWER(filename) LIKE ?', [$keyword]);
            });
        }

        // 類型篩選：依 TYPE_MAP 對應的數值進行查詢
        if ($filters['type'] && isset(Attachment::TYPE_MAP[$filters['type']])) {
            $query->where('type', Attachment::TYPE_MAP[$filters['type']]);
        }

        // 可見性篩選：public / private
        if ($filters['visibility'] && isset(Attachment::VISIBILITY_MAP[$filters['visibility']])) {
            $query->where('visibility', Attachment::VISIBILITY_MAP[$filters['visibility']]);
        }

        // Space 篩選：查詢直接綁定或透過關聯資源綁定的 Space
        if ($filters['space']) {
            $spaceId = $filters['space'];

            $query->where(function ($builder) use ($spaceId) {
                // 以欄位與關聯雙重條件篩選，確保舊資料仍可被查詢
                $builder->where('space_id', $spaceId)
                    ->orWhereHasMorph('attachable', [Post::class], function ($postQuery) use ($spaceId) {
                        $postQuery->where('space_id', $spaceId);
                    });
            });
        }

        // 標籤篩選：支援 JSON 欄位與關聯標籤查詢
        if ($filters['tag']) {
            $tagValue = Str::lower($filters['tag']);
            $query->where(function ($builder) use ($tagValue) {
                $builder->whereJsonContains('tags', $tagValue)
                    ->orWhereHasMorph('attachable', [Post::class], function ($postQuery) use ($tagValue) {
                        $postQuery->whereHas('tags', function ($tagQuery) use ($tagValue) {
                            $tagQuery->whereRaw('LOWER(tags.slug) = ?', [$tagValue])
                                ->orWhereRaw('LOWER(tags.name) = ?', [$tagValue])
                                ->orWhere('tags.id', $tagValue);
                        });
                    });
            });
        }

        // 日期範圍篩選：起始日期
        if ($filters['from']) {
            try {
                $from = Carbon::parse($filters['from'])->startOfDay();
                $query->where('created_at', '>=', $from);
            } catch (\Throwable $exception) {
                // ignore invalid date
            }
        }

        // 日期範圍篩選：結束日期
        if ($filters['to']) {
            try {
                $to = Carbon::parse($filters['to'])->endOfDay();
                $query->where('created_at', '<=', $to);
            } catch (\Throwable $exception) {
                // ignore invalid date
            }
        }

        // 排序：支援建立時間、名稱、檔案大小
        $sortField = in_array($filters['sort'], ['created_at', 'title', 'size'], true) ? $filters['sort'] : 'created_at';
        $direction = $filters['direction'] === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortField, $direction)->orderBy('id', 'desc');

        $attachments = $query->paginate($perPage)->withQueryString();

        // 格式化分頁資料為標準結構
        $attachmentData = [
            'data' => collect($attachments->items())
                ->map(fn (Attachment $attachment) => AttachmentResource::make($attachment)->resolve())
                ->all(),
            'meta' => [
                'current_page' => $attachments->currentPage(),
                'from' => $attachments->firstItem(),
                'last_page' => $attachments->lastPage(),
                'path' => $attachments->path(),
                'per_page' => $attachments->perPage(),
                'to' => $attachments->lastItem(),
                'total' => $attachments->total(),
                'links' => Arr::get($attachments->toArray(), 'links', []),
            ],
        ];

        // 準備篩選選項資料
        $filterOptions = [
            'types' => collect(Attachment::TYPE_MAP)
                ->keys()
                ->map(fn (string $type) => [
                    'value' => $type,
                    'label' => __('manage.attachments.type.' . $type, ['type' => $type]),
                ])->values()->all(),
            'visibilities' => collect(Attachment::VISIBILITY_MAP)
                ->keys()
                ->map(fn (string $visibility) => [
                    'value' => $visibility,
                    'label' => __('manage.attachments.visibility.' . $visibility, ['visibility' => $visibility]),
                ])->values()->all(),
            'spaces' => class_exists(Space::class)
                ? Space::query()
                    ->select(['id', 'name'])
                    ->orderBy('name')
                    ->get()
                    ->map(fn (Space $space) => [
                        'value' => $space->id,
                        'label' => $space->name,
                    ])->all()
                : [],
            'tags' => Tag::tableExists()
                ? Tag::query()
                    ->whereIn('context', ['attachments', 'posts'])
                    ->select(['id', 'name', 'slug'])
                    ->orderBy('name')
                    ->limit(40)
                    ->get()
                    ->map(fn (Tag $tag) => [
                        'value' => $tag->slug ?? (string) $tag->id,
                        'label' => $tag->name,
                        'id' => $tag->id,
                    ])->all()
                : [],
        ];

        return Inertia::render('manage/admin/attachments/index', [
            'attachments' => $attachmentData,
            'filters' => [
                'keyword' => $filters['keyword'],
                'type' => $filters['type'],
                'visibility' => $filters['visibility'],
                'space' => $filters['space'],
                'tag' => $filters['tag'],
                'from' => $filters['from'],
                'to' => $filters['to'],
                'per_page' => $perPage,
                'sort' => $sortField,
                'direction' => $direction,
                'view' => $viewMode,
            ],
            'filterOptions' => $filterOptions,
            'viewMode' => $viewMode,
            'abilities' => [
                'canUpload' => $request->user()?->can('create', Attachment::class) ?? false,
                'canDelete' => $request->user()?->can('delete', new Attachment()) ?? false,
            ],
        ]);
    }

    /**
     * 顯示新增附件頁面。
     */
    public function create(): Response
    {
        return Inertia::render('manage/admin/attachments/index');
    }

    /**
     * 儲存新附件。
     * 處理檔案上傳、儲存到 storage，並建立 Attachment 記錄。
     * 支援標題、描述、可見性、Space 綁定與標籤設定。
     *
     * @param StoreAttachmentRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreAttachmentRequest $request): \Illuminate\Http\JsonResponse
    {
        $this->authorize('create', Attachment::class);

        DB::beginTransaction();

        try {
            /** @var \Illuminate\Http\UploadedFile $file */
            $file = $request->file('file');

            // 產生唯一檔名並儲存到 storage/app/attachments
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('attachments', $filename, 'local');

            if (!$path) {
                throw new \RuntimeException('檔案儲存失敗。');
            }

            // 提取檔案資訊：MIME 類型、大小、原始檔名
            $mimeType = $file->getMimeType();
            $size = $file->getSize();
            $originalName = $file->getClientOriginalName();

            // 根據 MIME 類型判斷附件類型
            $attachmentType = $this->mapMimeToAttachmentType($mimeType);

            // 建立附件記錄
            $attachment = Attachment::create([
                'title' => $request->input('title', $originalName),
                'description' => $request->input('description'),
                'filename' => $filename,
                'original_filename' => $originalName,
                'mime_type' => $mimeType,
                'size' => $size,
                'type' => $attachmentType,
                'visibility' => Attachment::VISIBILITY_MAP[$request->input('visibility', 'public')] ?? Attachment::VISIBILITY_PUBLIC,
                'space_id' => $request->input('space_id'),
                'tags' => $request->input('tags', []),
                'uploader_id' => auth()->id(),
                'file_url' => Storage::url($path),
            ]);

            // 記錄操作紀錄
            ManageActivity::log(
                model: $attachment,
                action: ManageActivity::ACTION_CREATED,
                description: "上傳附件：{$attachment->title}",
                context: [
                    'filename' => $filename,
                    'size' => $size,
                    'mime_type' => $mimeType,
                ]
            );

            DB::commit();

            return response()->json([
                'message' => '附件上傳成功。',
                'data' => new AttachmentResource($attachment),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            // 如果已儲存檔案但資料庫操作失敗，需清理檔案
            if (isset($path) && Storage::exists($path)) {
                Storage::delete($path);
            }

            return response()->json([
                'message' => '附件上傳失敗：' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 根據 MIME 類型映射到附件類型。
     *
     * @param string|null $mimeType
     * @return int
     */
    private function mapMimeToAttachmentType(?string $mimeType): int
    {
        if (!$mimeType) {
            return Attachment::TYPE_FILE;
        }

        if (Str::startsWith($mimeType, 'image/')) {
            return Attachment::TYPE_IMAGE;
        }

        if (Str::startsWith($mimeType, 'video/')) {
            return Attachment::TYPE_VIDEO;
        }

        if (Str::startsWith($mimeType, 'audio/')) {
            return Attachment::TYPE_AUDIO;
        }

        if (in_array($mimeType, [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ])) {
            return Attachment::TYPE_DOCUMENT;
        }

        if (in_array($mimeType, ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'])) {
            return Attachment::TYPE_ARCHIVE;
        }

        return Attachment::TYPE_FILE;
    }

    /**
     * 顯示附件內容。
     */
    public function show(string $attachment): Response
    {
        return Inertia::render('manage/admin/attachments/index');
    }

    /**
     * 顯示編輯附件頁面。
     */
    public function edit(string $attachment): Response
    {
        return Inertia::render('manage/admin/attachments/index');
    }

    /**
     * 更新附件資訊。
     * 允許編輯標題、描述、可見性、Space 綁定與標籤。
     * 不允許更換檔案本身（若需要重新上傳，應刪除後重新上傳）。
     *
     * @param Request $request
     * @param Attachment $attachment
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Attachment $attachment): \Illuminate\Http\JsonResponse
    {
        $this->authorize('update', $attachment);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'visibility' => 'sometimes|in:public,private',
            'space_id' => 'nullable|integer|exists:spaces,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        DB::beginTransaction();

        try {
            $oldData = $attachment->only(['title', 'description', 'visibility', 'space_id', 'tags']);

            // 若 visibility 為字串，映射到數值
            if (isset($validated['visibility'])) {
                $validated['visibility'] = Attachment::VISIBILITY_MAP[$validated['visibility']] ?? $attachment->visibility;
            }

            $attachment->update($validated);

            // 記錄操作紀錄
            ManageActivity::log(
                model: $attachment,
                action: ManageActivity::ACTION_UPDATED,
                description: "更新附件資訊：{$attachment->title}",
                context: [
                    'old' => $oldData,
                    'new' => $attachment->only(['title', 'description', 'visibility', 'space_id', 'tags']),
                ]
            );

            DB::commit();

            return response()->json([
                'message' => '附件資訊已更新。',
                'data' => new AttachmentResource($attachment->fresh()),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => '更新失敗：' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 刪除附件。
     */
    public function destroy(string $attachment): RedirectResponse
    {
        return redirect()->route('manage.attachments.index');
    }

    /**
     * 批次刪除附件。
     * 接收附件 ID 清單，進行權限驗證後軟刪除，並記錄操作紀錄。
     * 適用於管理員批次清理不需要的附件資源。
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function bulkDelete(Request $request): \Illuminate\Http\JsonResponse
    {
        $this->authorize('delete', Attachment::class);

        // 驗證請求資料：必須提供至少一個有效的附件 ID
        $validated = $request->validate([
            'attachment_ids' => ['required', 'array', 'min:1'],
            'attachment_ids.*' => ['required', 'integer', 'exists:attachments,id'],
        ]);

        $ids = $validated['attachment_ids'];

        // 軟刪除所有選取的附件
        $affected = Attachment::query()
            ->whereIn('id', $ids)
            ->delete();

        // 記錄批次刪除操作到稽核日誌
        \App\Models\ManageActivity::log(
            $request->user(),
            'attachment.bulk_deleted',
            null,
            [
                'attachment_ids' => $ids,
                'affected' => $affected,
            ]
        );

        return response()->json([
            'message' => __('已批次刪除 :count 筆附件。', ['count' => $affected]),
            'affected' => $affected,
        ]);
    }
}
