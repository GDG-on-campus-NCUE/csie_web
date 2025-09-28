<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manage\Admin\StoreStaffRequest;
use App\Http\Requests\Manage\Admin\UpdateStaffRequest;
use App\Http\Resources\StaffResource;
use App\Models\Staff;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function __construct()
    {
        // 使用政策進行授權
        $this->authorizeResource(Staff::class, 'staff');
    }

    // 列出所有職員
    public function index(Request $request)
    {
        $activeTab = $request->query('tab');
        if (! in_array($activeTab, ['teachers', 'staff'], true)) {
            $activeTab = 'teachers';
        }

        $staff = Staff::orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(function (Staff $member) {
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'name_en' => $member->name_en,
                    'position' => $member->position,
                    'position_en' => $member->position_en,
                    'email' => $member->email,
                    'phone' => $member->phone,
                    'photo_url' => $member->photo_url,
                    'bio' => $member->bio,
                    'bio_en' => $member->bio_en,
                    'sort_order' => $member->sort_order,
                    'visible' => $member->visible,
                ];
            });

        $trashedStaff = Staff::onlyTrashed()
            ->orderByDesc('deleted_at')
            ->orderBy('name')
            ->get()
            ->map(function (Staff $member) {
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'name_en' => $member->name_en,
                    'position' => $member->position,
                    'position_en' => $member->position_en,
                    'email' => $member->email,
                    'phone' => $member->phone,
                    'deleted_at' => $member->deleted_at,
                ];
            });

        $teachersPerPage = (int) $request->input('per_page', 15);
        if ($teachersPerPage < 1) {
            $teachersPerPage = 15;
        }

        if ($teachersPerPage > 200) {
            $teachersPerPage = 200;
        }

        $teachers = Teacher::with([
                'labs:id,name,name_en',
            ])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($teachersPerPage);

        $teachers->getCollection()->transform(function (Teacher $teacher) {
            return [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'name_en' => $teacher->name_en,
                'title' => $teacher->title,
                'title_en' => $teacher->title_en,
                'email' => $teacher->email,
                'phone' => $teacher->phone,
                'office' => $teacher->office,
                'job_title' => $teacher->job_title,
                'photo_url' => $teacher->photo_url,
                'bio' => $teacher->bio,
                'bio_en' => $teacher->bio_en,
                'expertise' => $teacher->expertise,
                'expertise_en' => $teacher->expertise_en,
                'education' => $teacher->education,
                'education_en' => $teacher->education_en,
                'sort_order' => $teacher->sort_order,
                'visible' => $teacher->visible,
                'labs' => $teacher->labs->map(function ($lab) {
                    return [
                        'id' => $lab->id,
                        'name' => $lab->name,
                        'name_en' => $lab->name_en,
                    ];
                })->all(),
            ];
        });

        $teachers->withQueryString();

        return Inertia::render('manage/admin/staff/index', [
            'initialTab' => $activeTab,
            'staff' => [
                'active' => $staff,
                'trashed' => $trashedStaff,
            ],
            'teachers' => $teachers,
            'perPage' => $teachersPerPage,
            'perPageOptions' => [15, 30, 50, 100, 200],
        ]);
    }

    // 顯示新增職員表單
    public function create()
    {
        return Inertia::render('manage/admin/staff/create');
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
            ->with('success', __('manage.success.created', ['item' => __('manage.staff.title')]));
    }

    // 顯示編輯表單
    public function edit(Staff $staff)
    {
        return Inertia::render('manage/admin/staff/edit', [
            'staff' => new StaffResource($staff),
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
            ->with('success', __('manage.success.updated', ['item' => __('manage.staff.title')]));
    }

    // 刪除職員
    public function destroy(Staff $staff)
    {
        $staff->delete();
        return redirect()->route('manage.staff.index')
            ->with('success', __('manage.success.deleted', ['item' => __('manage.staff.title')]));
    }

    public function restore(int $staff)
    {
        $record = Staff::onlyTrashed()->findOrFail($staff);
        $this->authorize('restore', $record);

        $record->restore();

        return redirect()->route('manage.staff.index')->with('success', '職員已復原');
    }

    public function forceDelete(int $staff)
    {
        $record = Staff::onlyTrashed()->findOrFail($staff);
        $this->authorize('forceDelete', $record);

        $record->forceDelete();

        return redirect()->route('manage.staff.index')->with('success', '職員已永久刪除');
    }
}
