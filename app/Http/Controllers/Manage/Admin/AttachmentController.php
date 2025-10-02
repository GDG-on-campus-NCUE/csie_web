<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Manage\AttachmentResource;
use App\Models\Attachment;
use App\Models\Post;
use App\Models\Space;
use App\Models\Tag;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AttachmentController extends Controller
{
    /**
     * 顯示附件資源列表。
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

        $query = Attachment::query()
            ->with([
                'uploader:id,name,email',
                'attachable' => function (MorphTo $morphTo) {
                    $morphTo->morphWith([
                        Post::class => ['space:id,name'],
                    ]);
                },
            ]);

        if ($filters['keyword']) {
            $keyword = '%' . Str::lower($filters['keyword']) . '%';
            $query->where(function ($builder) use ($keyword) {
                $builder->whereRaw('LOWER(title) LIKE ?', [$keyword])
                    ->orWhereRaw('LOWER(filename) LIKE ?', [$keyword]);
            });
        }

        if ($filters['type'] && isset(Attachment::TYPE_MAP[$filters['type']])) {
            $query->where('type', Attachment::TYPE_MAP[$filters['type']]);
        }

        if ($filters['visibility'] && isset(Attachment::VISIBILITY_MAP[$filters['visibility']])) {
            $query->where('visibility', Attachment::VISIBILITY_MAP[$filters['visibility']]);
        }

        if ($filters['space']) {
            $spaceId = $filters['space'];
            $query->whereHasMorph('attachable', [Post::class], function ($postQuery) use ($spaceId) {
                $postQuery->where('space_id', $spaceId);
            });
        }

        if ($filters['tag']) {
            $tagValue = Str::lower($filters['tag']);
            $query->whereHasMorph('attachable', [Post::class], function ($postQuery) use ($tagValue) {
                $postQuery->whereHas('tags', function ($tagQuery) use ($tagValue) {
                    $tagQuery->whereRaw('LOWER(tags.slug) = ?', [$tagValue])
                        ->orWhereRaw('LOWER(tags.name) = ?', [$tagValue])
                        ->orWhere('tags.id', $tagValue);
                });
            });
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

        $sortField = in_array($filters['sort'], ['created_at', 'title', 'size'], true) ? $filters['sort'] : 'created_at';
        $direction = $filters['direction'] === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortField, $direction)->orderBy('id', 'desc');

        $attachments = $query->paginate($perPage)->withQueryString();

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
     */
    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('manage.attachments.index');
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
     */
    public function update(Request $request, string $attachment): RedirectResponse
    {
        return redirect()->route('manage.attachments.index');
    }

    /**
     * 刪除附件。
     */
    public function destroy(string $attachment): RedirectResponse
    {
        return redirect()->route('manage.attachments.index');
    }
}
