<?php

namespace App\Http\Controllers\Manage\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manage\Teacher\StoreProjectRequest;
use App\Http\Requests\Manage\Teacher\UpdateProjectRequest;
use App\Http\Resources\Manage\ProjectResource;
use App\Models\ManageActivity;
use App\Models\Project;
use App\Models\Space;
use App\Models\Tag;
use App\Services\TagService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * 建立控制器實例。
     */
    public function __construct(
        protected TagService $tagService
    ) {}

    /**
     * 顯示研究計畫管理頁面。
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Project::query()
            ->with(['tags'])
            ->latest('start_date');

        // 一般教師只能看到自己作為主持人的計畫
        if ($user->role !== 'admin') {
            $query->where('principal_investigator', $user->name);
        }

        // 搜尋
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('sponsor', 'like', "%{$search}%")
                    ->orWhere('principal_investigator', 'like', "%{$search}%");
            });
        }

        // 篩選：狀態
        if ($status = $request->input('status')) {
            $now = now();

            match ($status) {
                'upcoming' => $query->where('start_date', '>', $now),
                'ongoing' => $query->where('start_date', '<=', $now)
                    ->where(function ($q) use ($now) {
                        $q->whereNull('end_date')
                            ->orWhere('end_date', '>=', $now);
                    }),
                'completed' => $query->where('end_date', '<', $now),
                default => null,
            };
        }

        // 篩選：標籤
        if ($tag = $request->input('tag')) {
            $query->whereHas('tags', function ($q) use ($tag) {
                $q->where('name', $tag);
            });
        }

        // 篩選：執行單位
        if ($sponsor = $request->input('sponsor')) {
            $query->where('sponsor', $sponsor);
        }

        // 篩選：年份
        if ($year = $request->input('year')) {
            $query->whereYear('start_date', $year);
        }

        $projects = $query->paginate($request->input('per_page', 15));

        return Inertia::render('manage/teacher/projects/index', [
            'projects' => ProjectResource::collection($projects),
            'filters' => $request->only(['search', 'status', 'tag', 'sponsor', 'year', 'per_page']),
            'sponsors' => $this->getSponsors(),
            'years' => $this->getYears(),
            'abilities' => [
                'canCreate' => $user->role === 'admin' || $user->role === 'teacher',
            ],
        ]);
    }

    /**
     * 顯示新增研究計畫頁面。
     */
    public function create(): Response
    {
        return Inertia::render('manage/teacher/projects/create', [
            'spaces' => Space::select('id', 'name')->get(),
            'tagOptions' => Tag::select('id', 'name')->get(),
        ]);
    }

    /**
     * 儲存新的研究計畫。
     */
    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $project = Project::create([
            'title' => $validated['title'],
            'title_en' => $validated['title_en'] ?? null,
            'sponsor' => $validated['sponsor'],
            'principal_investigator' => $validated['principal_investigator'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'total_budget' => $validated['total_budget'] ?? null,
            'summary' => $validated['summary'] ?? null,
        ]);

        // 處理標籤
        if (! empty($validated['tags'])) {
            $tagIds = $this->tagService->createOrRetrieveTagIds($validated['tags']);
            $project->tags()->sync($tagIds);
        }

        // 記錄活動
        ManageActivity::log(
            action: 'project.created',
            targetType: Project::class,
            targetId: $project->id,
            userId: $request->user()->id,
            metadata: [
                'title' => $project->title,
                'sponsor' => $project->sponsor,
            ]
        );

        return redirect()
            ->route('manage.teacher.projects.index')
            ->with('success', '研究計畫建立成功。');
    }

    /**
     * 顯示研究計畫詳細內容。
     */
    public function show(Project $project): Response
    {
        $project->load(['tags', 'space']);

        return Inertia::render('manage/teacher/projects/show', [
            'project' => new ProjectResource($project),
            'abilities' => [
                'canUpdate' => $this->canManageProject($project),
                'canDelete' => $this->canManageProject($project),
            ],
            'recent_activities' => ManageActivity::query()
                ->where('target_type', Project::class)
                ->where('target_id', $project->id)
                ->with('user')
                ->latest()
                ->limit(10)
                ->get(),
        ]);
    }

    /**
     * 顯示編輯研究計畫頁面。
     */
    public function edit(Project $project): Response
    {
        $this->authorize('update', $project);

        $project->load(['tags']);

        return Inertia::render('manage/teacher/projects/edit', [
            'project' => new ProjectResource($project),
            'spaces' => Space::select('id', 'name')->get(),
            'tagOptions' => Tag::select('id', 'name')->get(),
        ]);
    }

    /**
     * 更新研究計畫。
     */
    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $this->authorize('update', $project);

        $validated = $request->validated();

        $project->update([
            'title' => $validated['title'] ?? $project->title,
            'title_en' => $validated['title_en'] ?? $project->title_en,
            'sponsor' => $validated['sponsor'] ?? $project->sponsor,
            'principal_investigator' => $validated['principal_investigator'] ?? $project->principal_investigator,
            'start_date' => $validated['start_date'] ?? $project->start_date,
            'end_date' => $validated['end_date'] ?? $project->end_date,
            'total_budget' => $validated['total_budget'] ?? $project->total_budget,
            'summary' => $validated['summary'] ?? $project->summary,
        ]);

        // 處理標籤
        if (isset($validated['tags'])) {
            $tagIds = $this->tagService->createOrRetrieveTagIds($validated['tags']);
            $project->tags()->sync($tagIds);
        }

        // 記錄活動
        ManageActivity::log(
            action: 'project.updated',
            targetType: Project::class,
            targetId: $project->id,
            userId: $request->user()->id,
            metadata: [
                'title' => $project->title,
            ]
        );

        return redirect()
            ->route('manage.teacher.projects.index')
            ->with('success', '研究計畫更新成功。');
    }

    /**
     * 刪除研究計畫。
     */
    public function destroy(Request $request, Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);

        $projectTitle = $project->title;

        $project->delete();

        // 記錄活動
        ManageActivity::log(
            action: 'project.deleted',
            targetType: Project::class,
            targetId: $project->id,
            userId: $request->user()->id,
            metadata: [
                'title' => $projectTitle,
            ]
        );

        return redirect()
            ->route('manage.teacher.projects.index')
            ->with('success', '研究計畫刪除成功。');
    }

    /**
     * 取得所有執行單位選項。
     */
    protected function getSponsors(): array
    {
        return Project::query()
            ->distinct()
            ->pluck('sponsor')
            ->filter()
            ->values()
            ->toArray();
    }

    /**
     * 取得所有年份選項。
     */
    protected function getYears(): array
    {
        return Project::query()
            ->selectRaw('DISTINCT YEAR(start_date) as year')
            ->whereNotNull('start_date')
            ->orderByDesc('year')
            ->pluck('year')
            ->toArray();
    }

    /**
     * 檢查使用者是否可以管理此計畫。
     */
    protected function canManageProject(Project $project): bool
    {
        $user = request()->user();

        return $user->role === 'admin' ||
               $project->principal_investigator === $user->name;
    }
}
