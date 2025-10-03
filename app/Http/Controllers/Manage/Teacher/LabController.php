<?php

namespace App\Http\Controllers\Manage\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manage\Teacher\StoreLabRequest;
use App\Http\Requests\Manage\Teacher\UpdateLabRequest;
use App\Http\Resources\Manage\Teacher\LabResource;
use App\Models\Lab;
use App\Models\ManageActivity;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LabController extends Controller
{
    /**
     * 顯示實驗室列表。
     */
    public function index(Request $request): Response|JsonResponse
    {
        $this->authorize('viewAny', Lab::class);

        $query = Lab::query()
            ->with(['principalInvestigator', 'tags'])
            ->withCount('members');

        // 權限過濾：教師只能看自己負責或參與的實驗室
        if ($request->user()->role === 'teacher') {
            $query->where(function ($q) use ($request) {
                $q->where('principal_investigator_id', $request->user()->id)
                    ->orWhereHas('members', function ($memberQuery) use ($request) {
                        $memberQuery->where('user_id', $request->user()->id);
                    });
            });
        }

        // 搜尋
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('name_en', 'like', "%{$search}%")
                    ->orWhere('field', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // 依研究領域篩選
        if ($request->filled('field')) {
            $query->where('field', $request->input('field'));
        }

        // 依可見性篩選
        if ($request->has('visible')) {
            $query->where('visible', filter_var($request->input('visible'), FILTER_VALIDATE_BOOLEAN));
        }

        // 依標籤篩選
        if ($request->filled('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('tags.name', $request->input('tag'));
            });
        }

        // 排序
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // 分頁
        $labs = $query->paginate($request->input('per_page', 15));

        // 取得所有研究領域選項（用於篩選）
        $fields = Lab::query()
            ->select('field')
            ->distinct()
            ->whereNotNull('field')
            ->pluck('field');

        // 如果是 JSON 請求，返回 JSON
        if ($request->expectsJson()) {
            return response()->json([
                'data' => LabResource::collection($labs->items()),
                'meta' => [
                    'current_page' => $labs->currentPage(),
                    'last_page' => $labs->lastPage(),
                    'per_page' => $labs->perPage(),
                    'total' => $labs->total(),
                ],
                'filters' => $request->only(['search', 'field', 'visible', 'tag', 'sort_by', 'sort_order']),
                'fields' => $fields,
            ]);
        }

        return Inertia::render('manage/teacher/labs/index', [
            'labs' => LabResource::collection($labs),
            'filters' => $request->only(['search', 'field', 'visible', 'tag', 'sort_by', 'sort_order']),
            'fields' => $fields,
        ]);
    }

    /**
     * 顯示建立實驗室頁面。
     */
    public function create(): Response
    {
        $this->authorize('create', Lab::class);

        // 取得可選擇的成員（教師和學生）
        $users = User::query()
            ->select(['id', 'name', 'email', 'role'])
            ->whereIn('role', ['teacher', 'user'])
            ->where('status', 1)
            ->orderBy('name')
            ->get();

        return Inertia::render('manage/teacher/labs/create', [
            'users' => $users,
        ]);
    }

    /**
     * 儲存新的實驗室。
     */
    public function store(StoreLabRequest $request): RedirectResponse
    {
        $this->authorize('create', Lab::class);

        $data = $request->validated();

        // 如果是教師，自動設定為主持人
        if ($request->user()->role === 'teacher' && empty($data['principal_investigator_id'])) {
            $data['principal_investigator_id'] = $request->user()->id;
        }

        $members = $data['members'] ?? [];
        unset($data['members']);

        $lab = Lab::create($data);

        // 同步成員
        if (!empty($members)) {
            $lab->members()->sync($members);
        }

        // 記錄活動
        ManageActivity::log(
            $request->user(),
            'lab.created',
            $lab,
            [],
            "創建實驗室：{$lab->name}"
        );

        return redirect()
            ->route('manage.teacher.labs.show', $lab)
            ->with('success', '實驗室建立成功');
    }

    /**
     * 顯示實驗室詳細資訊。
     */
    public function show(Request $request, Lab $lab): Response
    {
        $this->authorize('view', $lab);

        $lab->load([
            'principalInvestigator',
            'members' => fn ($query) => $query
                ->select(['users.id', 'users.name', 'users.email', 'users.role'])
                ->withPivot(['role', 'access_level', 'created_at']),
            'tags',
        ]);

        $recentActivities = ManageActivity::query()
            ->where('subject_type', Lab::class)
            ->where('subject_id', $lab->getKey())
            ->latest()
            ->limit(20)
            ->get(['id', 'action', 'description', 'properties', 'created_at']);

        $lab->setAttribute('recent_activities', $recentActivities);

        return Inertia::render('manage/teacher/labs/show', [
            'lab' => new LabResource($lab),
            'abilities' => [
                'canUpdate' => $request->user()->can('update', $lab),
                'canDelete' => $request->user()->can('delete', $lab),
                'canManageMembers' => $request->user()->can('manageMembers', $lab),
            ],
        ]);
    }

    /**
     * 顯示編輯實驗室頁面。
     */
    public function edit(Lab $lab): Response
    {
        $this->authorize('update', $lab);

        $lab->load(['principalInvestigator', 'members', 'tags']);

        // 取得可選擇的成員
        $users = User::query()
            ->select(['id', 'name', 'email', 'role'])
            ->whereIn('role', ['teacher', 'user'])
            ->where('status', 1)
            ->orderBy('name')
            ->get();

        return Inertia::render('manage/teacher/labs/edit', [
            'lab' => new LabResource($lab),
            'users' => $users,
        ]);
    }

    /**
     * 更新實驗室資料。
     */
    public function update(UpdateLabRequest $request, Lab $lab): RedirectResponse
    {
        $this->authorize('update', $lab);

        $data = $request->validated();

        $members = $data['members'] ?? null;
        unset($data['members']);

        $lab->update($data);

        // 更新成員（如果有提供）
        if ($members !== null) {
            $lab->members()->sync($members);
        }

        // 記錄活動
        ManageActivity::log(
            $request->user(),
            'lab.updated',
            $lab,
            [],
            "更新實驗室：{$lab->name}"
        );

        return redirect()
            ->route('manage.teacher.labs.show', $lab)
            ->with('success', '實驗室更新成功');
    }

    /**
     * 刪除實驗室（軟刪除）。
     */
    public function destroy(Lab $lab): RedirectResponse
    {
        $this->authorize('delete', $lab);

        // 記錄活動
        ManageActivity::log(
            auth()->user(),
            'lab.deleted',
            $lab,
            [],
            "刪除實驗室：{$lab->name}"
        );

        $lab->delete();

        return redirect()
            ->route('manage.teacher.labs.index')
            ->with('success', '實驗室刪除成功');
    }

    /**
     * 新增成員到實驗室。
     */
    public function addMember(Request $request, Lab $lab): RedirectResponse
    {
        $this->authorize('update', $lab);

        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role' => ['nullable', 'string', 'max:50'],
        ]);

        $lab->members()->attach($request->input('user_id'), [
            'role' => $request->input('role', 'member'),
        ]);

        $user = User::find($request->input('user_id'));

        // 記錄活動
        ManageActivity::log(
            $request->user(),
            'lab.member_added',
            $lab,
            ['user_id' => $user->id, 'user_name' => $user->name],
            "新增成員 {$user->name} 到實驗室 {$lab->name}"
        );

        return redirect()
            ->back()
            ->with('success', '成員新增成功');
    }

    /**
     * 從實驗室移除成員。
     */
    public function removeMember(Lab $lab, User $user): RedirectResponse
    {
        $this->authorize('manageMembers', $lab);

        $lab->members()->detach($user->id);

        // 記錄活動
        ManageActivity::log(
            auth()->user(),
            'lab.member_removed',
            $lab,
            ['user_id' => $user->id, 'user_name' => $user->name],
            "從實驗室移除成員：{$lab->name}"
        );

        return redirect()
            ->back()
            ->with('success', '成員移除成功');
    }
}
