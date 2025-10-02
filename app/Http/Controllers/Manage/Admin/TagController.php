<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manage\Admin\MergeTagsRequest;
use App\Http\Requests\Manage\Admin\SplitTagRequest;
use App\Http\Requests\Manage\Admin\StoreTagRequest;
use App\Http\Requests\Manage\Admin\UpdateTagRequest;
use App\Http\Resources\Manage\TagResource;
use App\Models\Classroom;
use App\Models\Lab;
use App\Models\ManageActivity;
use App\Models\Tag;
use App\Services\TagService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    public function __construct(private TagService $tags)
    {
    }

    /**
     * 顯示標籤管理列表。
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Tag::class);

        $request = request();

        $filters = [
            'keyword' => $request->string('keyword')->trim()->toString() ?: null,
            'status' => $request->string('status')->trim()->toString() ?: null,
            'context' => $request->string('context')->trim()->toString() ?: null,
            'per_page' => $request->integer('per_page') ?: 15,
        ];

        $perPage = max(5, min(100, $filters['per_page'] ?? 15));

        $query = Tag::query()
            ->select('tags.*')
            ->selectRaw($this->usageCountExpression().' as usage_count')
            ->selectRaw('('.$this->lastUsedExpression().') as last_used_at')
            ->when($filters['context'], fn ($builder, $context) => $builder->where('context', $context))
            ->when($filters['status'] === 'active', fn ($builder) => $builder->where('is_active', true))
            ->when($filters['status'] === 'inactive', fn ($builder) => $builder->where('is_active', false))
            ->when($filters['keyword'], function ($builder, $keyword) {
                $keyword = '%' . mb_strtolower($keyword) . '%';

                $builder->where(function ($query) use ($keyword) {
                    $query->whereRaw('LOWER(name) LIKE ?', [$keyword])
                        ->orWhereRaw('LOWER(name_en) LIKE ?', [$keyword])
                        ->orWhereRaw('LOWER(slug) LIKE ?', [$keyword]);
                });
            })
            ->orderByDesc('is_active')
            ->orderByDesc(DB::raw('usage_count'))
            ->orderBy('name');

        $paginator = $query->paginate($perPage)->withQueryString();

        $tagData = [
            'data' => TagResource::collection($paginator->items())->resolve(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'path' => $paginator->path(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
        ];

        $filterOptions = [
            'contexts' => collect(Tag::CONTEXTS)
                ->map(fn ($label, $value) => [
                    'value' => $value,
                    'label' => $label,
                ])->values()->all(),
            'statuses' => [
                [
                    'value' => 'active',
                    'label' => __('啟用中'),
                ],
                [
                    'value' => 'inactive',
                    'label' => __('已停用'),
                ],
            ],
        ];

        return Inertia::render('manage/admin/tags/index', [
            'tags' => $tagData,
            'filters' => $filters,
            'filterOptions' => $filterOptions,
            'abilities' => [
                'canCreate' => $request->user()?->can('create', Tag::class) ?? false,
                'canUpdate' => $request->user()?->can('update', Tag::class) ?? false,
                'canDelete' => $request->user()?->can('delete', Tag::class) ?? false,
            ],
        ]);
    }

    /**
     * 顯示新增標籤頁面。
     */
    public function create(): Response
    {
        return Inertia::render('manage/admin/tags/index');
    }

    /**
     * 儲存新標籤。
     */
    public function store(StoreTagRequest $request): HttpResponse|RedirectResponse
    {
        $data = $request->validated();

        $tag = new Tag();
        $tag->fill([
            'context' => $data['context'],
            'name' => $data['name'],
            'name_en' => $data['name_en'] ?? null,
            'description' => $data['description'] ?? null,
            'color' => $data['color'] ?? null,
            'is_active' => array_key_exists('is_active', $data) ? (bool) $data['is_active'] : true,
            'sort_order' => 0,
        ]);
        $tag->slug = Tag::generateUniqueSlug($tag->name, $tag->context);
        $tag->last_used_at = $tag->is_active ? now() : null;
        $tag->save();

        ManageActivity::log(
            $request->user(),
            'tag.created',
            $tag,
            [
                'context' => $tag->context,
                'color' => $tag->color,
            ]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'data' => TagResource::make($tag),
            ], 201);
        }

        return redirect()
            ->route('manage.tags.index')
            ->with('flash', [
                'type' => 'success',
                'message' => __('標籤已建立。'),
            ]);
    }

    /**
     * 顯示單一標籤資訊。
     */
    public function show(string $tag): Response
    {
        return Inertia::render('manage/admin/tags/index');
    }

    /**
     * 顯示編輯標籤頁面。
     */
    public function edit(string $tag): Response
    {
        return Inertia::render('manage/admin/tags/index');
    }

    /**
     * 更新指定標籤。
     */
    public function update(UpdateTagRequest $request, Tag $tag): HttpResponse|RedirectResponse
    {
        $data = $request->validated();

        $nameChanged = $tag->name !== $data['name'];

        $tag->fill([
            'name' => $data['name'],
            'name_en' => $data['name_en'] ?? null,
            'description' => $data['description'] ?? null,
            'color' => $data['color'] ?? null,
            'is_active' => (bool) $data['is_active'],
        ]);

        if ($nameChanged) {
            $tag->slug = Tag::generateUniqueSlug($tag->name, $tag->context, $tag->id);
        }

        if ($tag->is_active && ! $tag->last_used_at) {
            $tag->last_used_at = now();
        }

        $tag->save();

        ManageActivity::log(
            $request->user(),
            'tag.updated',
            $tag,
            [
                'name_changed' => $nameChanged,
                'is_active' => $tag->is_active,
            ]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'data' => TagResource::make($tag),
            ]);
        }

        return redirect()
            ->route('manage.tags.index')
            ->with('flash', [
                'type' => 'success',
                'message' => __('標籤已更新。'),
            ]);
    }

    /**
     * 刪除指定標籤。
     */
    public function destroy(Request $request, Tag $tag): HttpResponse|RedirectResponse
    {
        $this->authorize('delete', $tag);

        $tag->forceFill([
            'is_active' => false,
        ])->save();

        ManageActivity::log(
            $request->user(),
            'tag.deactivated',
            $tag,
            [
                'context' => $tag->context,
            ]
        );

        if ($request->wantsJson()) {
            return response()->json(null, 204);
        }

        return redirect()
            ->route('manage.tags.index')
            ->with('flash', [
                'type' => 'success',
                'message' => __('標籤已停用。'),
            ]);
    }

    /**
     * 提供標籤選項列表給前端即時搜尋。
     */
    public function options(Request $request): HttpResponse
    {
        $this->authorize('viewAny', Tag::class);

        $context = $request->string('context')->trim()->toString() ?: null;
        $keyword = $request->string('keyword')->trim()->toString() ?: null;
        $limit = $request->integer('limit') ?: 30;
        $limit = max(5, min(100, $limit));

        $query = Tag::query()
            ->select('tags.*')
            ->selectRaw($this->usageCountExpression().' as usage_count')
            ->when($context, fn ($builder, $value) => $builder->where('context', $value))
            ->where('is_active', true)
            ->orderByDesc(DB::raw('usage_count'))
            ->orderBy('name')
            ->limit($limit);

        if ($keyword) {
            $pattern = '%' . mb_strtolower($keyword) . '%';
            $query->where(function ($builder) use ($pattern) {
                $builder->whereRaw('LOWER(name) LIKE ?', [$pattern])
                    ->orWhereRaw('LOWER(name_en) LIKE ?', [$pattern])
                    ->orWhereRaw('LOWER(slug) LIKE ?', [$pattern]);
            });
        }

        $tags = $query->get();

        return response()->json([
            'data' => $tags->map(function (Tag $tag) {
                return [
                    'id' => $tag->id,
                    'value' => $tag->id,
                    'label' => $tag->name,
                    'slug' => $tag->slug,
                    'color' => $tag->color,
                    'usage_count' => (int) ($tag->usage_count ?? 0),
                    'created_at' => optional($tag->created_at)->toIso8601String(),
                    'updated_at' => optional($tag->updated_at)->toIso8601String(),
                ];
            })->all(),
        ]);
    }

    /**
     * 合併標籤。
     */
    public function merge(MergeTagsRequest $request): HttpResponse
    {
        $targetId = (int) $request->input('target_id');
        $sourceIds = collect($request->input('source_ids', []))->map(fn ($value) => (int) $value)->values()->all();

        $result = $this->tags->mergeTags($targetId, $sourceIds, $request->user());

        return response()->json([
            'message' => __('標籤已合併。'),
            'result' => $result,
        ]);
    }

    /**
     * 分割標籤。
     */
    public function split(SplitTagRequest $request): HttpResponse
    {
        $tag = Tag::query()->findOrFail($request->integer('tag_id'));

        $names = $request->parsedNames();

        $result = $this->tags->splitTag(
            $tag,
            $names,
            $request->boolean('keep_original', true),
            $request->input('color'),
            $request->user()
        );

        return response()->json([
            'message' => __('已建立新的標籤。'),
            'created' => array_map(fn (Tag $item) => TagResource::make($item)->resolve(), $result['created']),
            'deactivated_original' => $result['deactivated_original'],
        ]);
    }

    private function usageCountExpression(): string
    {
        return sprintf(
            <<<'SQL'
            CASE tags.context
                WHEN 'posts' THEN (
                    SELECT COUNT(*)
                    FROM post_tag
                    WHERE post_tag.tag_id = tags.id
                )
                WHEN 'labs' THEN (
                    SELECT COUNT(*)
                    FROM space_tag
                    INNER JOIN spaces ON spaces.id = space_tag.space_id
                    WHERE space_tag.tag_id = tags.id
                        AND spaces.space_type = %d
                )
                WHEN 'classrooms' THEN (
                    SELECT COUNT(*)
                    FROM space_tag
                    INNER JOIN spaces ON spaces.id = space_tag.space_id
                    WHERE space_tag.tag_id = tags.id
                        AND spaces.space_type = %d
                )
                WHEN 'spaces' THEN (
                    SELECT COUNT(*)
                    FROM space_tag
                    WHERE space_tag.tag_id = tags.id
                )
                ELSE 0
            END
            SQL,
            Lab::TYPE_LAB,
            Classroom::TYPE_CLASSROOM
        );
    }

    private function lastUsedExpression(): string
    {
        return sprintf(
            <<<'SQL'
            CASE tags.context
                WHEN 'posts' THEN (
                    SELECT MAX(posts.updated_at)
                    FROM post_tag
                    INNER JOIN posts ON posts.id = post_tag.post_id
                    WHERE post_tag.tag_id = tags.id
                )
                WHEN 'labs' THEN (
                    SELECT MAX(spaces.updated_at)
                    FROM space_tag
                    INNER JOIN spaces ON spaces.id = space_tag.space_id
                    WHERE space_tag.tag_id = tags.id
                        AND spaces.space_type = %d
                )
                WHEN 'classrooms' THEN (
                    SELECT MAX(spaces.updated_at)
                    FROM space_tag
                    INNER JOIN spaces ON spaces.id = space_tag.space_id
                    WHERE space_tag.tag_id = tags.id
                        AND spaces.space_type = %d
                )
                WHEN 'spaces' THEN (
                    SELECT MAX(spaces.updated_at)
                    FROM space_tag
                    INNER JOIN spaces ON spaces.id = space_tag.space_id
                    WHERE space_tag.tag_id = tags.id
                )
                ELSE tags.last_used_at
            END
            SQL,
            Lab::TYPE_LAB,
            Classroom::TYPE_CLASSROOM
        );
    }
}
