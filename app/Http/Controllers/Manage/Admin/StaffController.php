<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manage\Admin\StoreStaffRequest;
use App\Http\Requests\Manage\Admin\UpdateStaffRequest;
use App\Http\Resources\StaffResource;
use App\Http\Resources\TeacherResource;
use App\Models\Staff;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function __construct()
    {
        // 使用政策進行授權
        $this->authorizeResource(Staff::class, 'staff');
    }

    // 列出所有職員與教師，提供統一的資料結構與篩選功能
    public function index(Request $request)
    {
        $activeTab = $request->query('tab');
        if (! in_array($activeTab, ['teachers', 'staff'], true)) {
            $activeTab = 'staff';
        }

        $search = trim((string) $request->query('search', ''));
        $statusFilter = $request->query('status');
        $visibleFilter = $request->query('visible');

        $perPage = (int) $request->input('per_page', 15);
        $perPage = max(1, min(200, $perPage));

        $statusWhitelist = ['active', 'inactive', 'retired', 'left'];
        $visibilityResolver = function ($value) {
            if ($value === null || $value === '') {
                return null;
            }

            $normalized = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

            return $normalized;
        };

        $staffQuery = Staff::query()
            ->with(['user'])
            ->when($search !== '', fn ($query) => $query->search($search))
            ->when(
                $statusFilter && in_array($statusFilter, $statusWhitelist, true),
                fn ($query) => $query->where('employment_status', $statusFilter)
            )
            ->when(
                $visibilityResolver($visibleFilter) !== null,
                fn ($query) => $query->where('visible', $visibilityResolver($visibleFilter))
            )
            ->orderBy('sort_order')
            ->orderBy('name');

        $staffActive = StaffResource::collection(
            (clone $staffQuery)->get()
        )->toArray($request);

        $staffTrashed = StaffResource::collection(
            (clone $staffQuery)->onlyTrashed()->get()
        )->toArray($request);

        $teacherQuery = Teacher::query()
            ->with(['user', 'labs:id,code,name,name_en'])
            ->when($search !== '', fn ($query) => $query->search($search))
            ->when(
                $statusFilter && in_array($statusFilter, $statusWhitelist, true),
                fn ($query) => $query->where('employment_status', $statusFilter)
            )
            ->when(
                $visibilityResolver($visibleFilter) !== null,
                fn ($query) => $query->where('visible', $visibilityResolver($visibleFilter))
            )
            ->orderBy('sort_order')
            ->orderBy('name');

        $teacherPaginator = (clone $teacherQuery)->paginate($perPage)->appends($request->query());

        $teacherData = TeacherResource::collection(
            $teacherPaginator->getCollection()
        )->toArray($request);

        $teacherTrashed = TeacherResource::collection(
            (clone $teacherQuery)->onlyTrashed()->get()
        )->toArray($request);

        $teacherLinks = collect($teacherPaginator->linkCollection())->map(function ($link) {
            return Arr::only($link, ['url', 'label', 'active']);
        })->values()->toArray();

        return Inertia::render('manage/staff/index', [
            'initialTab' => $activeTab,
            'staff' => [
                'active' => $staffActive,
                'trashed' => $staffTrashed,
            ],
            'teachers' => [
                'data' => $teacherData,
                'trashed' => $teacherTrashed,
                'meta' => [
                    'current_page' => $teacherPaginator->currentPage(),
                    'last_page' => $teacherPaginator->lastPage(),
                    'per_page' => $teacherPaginator->perPage(),
                    'total' => $teacherPaginator->total(),
                    'from' => $teacherPaginator->firstItem() ?? 0,
                    'to' => $teacherPaginator->lastItem() ?? 0,
                ],
                'links' => $teacherLinks,
            ],
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'visible' => $visibleFilter,
                'per_page' => $teacherPaginator->perPage(),
            ],
            'perPageOptions' => [15, 30, 50, 100, 200],
            'employmentStatusOptions' => [
                ['value' => '', 'label' => '全部狀態'],
                ['value' => 'active', 'label' => '在職'],
                ['value' => 'inactive', 'label' => '暫離'],
                ['value' => 'retired', 'label' => '退休'],
                ['value' => 'left', 'label' => '離職'],
            ],
            'visibilityOptions' => [
                ['value' => '', 'label' => '顯示全部'],
                ['value' => '1', 'label' => '僅顯示前台'],
                ['value' => '0', 'label' => '僅顯示隱藏'],
            ],
        ]);
    }

    // 顯示新增職員表單
    public function create()
    {
        return Inertia::render('manage/staff/create', [
            'staff' => null,
        ]);
    }

    // 顯示職員詳細資料
    public function show(Staff $staff)
    {
        return Inertia::render('manage/staff/show', [
            'staff' => (new StaffResource($staff->load(['user'])))->resolve(),
        ]);
    }

    // 儲存新的職員
    public function store(StoreStaffRequest $request)
    {
        $data = $request->validated();

        $classroomIds = collect($data['classroom_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();
        unset($data['classroom_ids']);

        if ($request->hasFile('avatar')) {
            // 儲存上傳圖片路徑
            $data['photo_url'] = $request->file('avatar')->store('staff', 'public');
        }

        $staff = Staff::create($data);
        $staff->classrooms()->sync($classroomIds);

        return redirect()->route('manage.staff.index')
            ->with('success', __('manage.success.created', ['item' => __('manage.staff.index.title')]));
    }

    // 顯示編輯表單
    public function edit(Staff $staff)
    {
        return Inertia::render('manage/staff/edit', [
            'staff' => (new StaffResource($staff->load(['user'])))->resolve(),
        ]);
    }

    // 更新職員資料
    public function update(UpdateStaffRequest $request, Staff $staff)
    {
        $data = $request->validated();

        $classroomIds = collect($data['classroom_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();
        unset($data['classroom_ids']);

        if ($request->hasFile('avatar')) {
            $data['photo_url'] = $request->file('avatar')->store('staff', 'public');
        }

        $staff->update($data);
        $staff->classrooms()->sync($classroomIds);

        return redirect()->route('manage.staff.index')
            ->with('success', __('manage.success.updated', ['item' => __('manage.staff.index.title')]));
    }

    // 刪除職員
    public function destroy(Staff $staff)
    {
        $staff->delete();
        return redirect()->route('manage.staff.index')
            ->with('success', __('manage.success.deleted', ['item' => __('manage.staff.index.title')]));
    }

    // 切換職員的在職狀態
    public function toggleStatus(Request $request, Staff $staff)
    {
        $this->authorize('update', $staff);

        $status = $request->input('status');
        $allowed = ['active', 'inactive', 'retired', 'left'];

        if ($status && ! in_array($status, $allowed, true)) {
            return back()->withErrors([
                'status' => '無效的在職狀態。',
            ]);
        }

        $nextStatus = $status ?: ($staff->employment_status === 'active' ? 'inactive' : 'active');
        $staff->employment_status = $nextStatus;

        if ($request->boolean('sync_visibility', true)) {
            if ($nextStatus === 'active' && $request->boolean('restore_visibility', true)) {
                $staff->visible = true;
            }

            if ($nextStatus !== 'active' && $request->boolean('hide_inactive', true)) {
                $staff->visible = false;
            }
        }

        $staff->save();

        return back()->with('success', __('manage.success.updated', ['item' => __('manage.staff.index.title')]));
    }

    // 切換職員的前台顯示狀態
    public function toggleVisibility(Staff $staff)
    {
        $this->authorize('update', $staff);

        $staff->visible = ! $staff->visible;
        $staff->save();

        return back()->with('success', __('manage.success.updated', ['item' => __('manage.staff.index.title')]));
    }

    public function restore(int $staff)
    {
        $record = Staff::onlyTrashed()->findOrFail($staff);
        $this->authorize('restore', $record);

        $record->restore();

        return redirect()->route('manage.staff.index')
            ->with('success', __('manage.success.updated', ['item' => __('manage.staff.index.title')]));
    }

    public function forceDelete(int $staff)
    {
        $record = Staff::onlyTrashed()->findOrFail($staff);
        $this->authorize('forceDelete', $record);

        $record->forceDelete();

        return redirect()->route('manage.staff.index')
            ->with('success', __('manage.success.deleted', ['item' => __('manage.staff.index.title')]));
    }
}
