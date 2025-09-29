<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manage\Admin\StoreTeacherRequest;
use App\Http\Requests\Manage\Admin\UpdateTeacherRequest;
use App\Http\Resources\TeacherResource;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // 導向新的統一列表頁，維持查詢參數（例如分頁或語系）
        return redirect()->route('manage.staff.index', array_merge(
            $request->query(),
            ['tab' => 'teachers']
        ));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('manage/teachers/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTeacherRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('avatar')) {
            $validated['photo_url'] = $request->file('avatar')->store('teachers', 'public');
        }

        $teacher = Teacher::create($validated);

        return redirect()->route('manage.staff.index', ['tab' => 'teachers'])
            ->with('success', __('manage.success.created', ['item' => __('manage.staff.teachers.title')]));
    }

    /**
     * Display the specified resource.
     */
    public function show(Teacher $teacher)
    {
        return Inertia::render('manage/teachers/show', [
            // 一次載入相關關聯，確保資源可以輸出完整資訊
            'teacher' => new TeacherResource($teacher->load([
                'user',
                'links',
                'projects',
                'publications',
                'labs:id,code,name,name_en',
            ])),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Teacher $teacher)
    {
        return Inertia::render('manage/teachers/edit', [
            'teacher' => new TeacherResource($teacher->load([
                'user',
                'links',
                'labs:id,code,name,name_en',
            ])),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTeacherRequest $request, Teacher $teacher)
    {
        $validated = $request->validated();

        if ($request->hasFile('avatar')) {
            $validated['photo_url'] = $request->file('avatar')->store('teachers', 'public');
        }

        $teacher->update($validated);

        return redirect()->route('manage.staff.index', ['tab' => 'teachers'])
            ->with('success', __('manage.success.updated', ['item' => __('manage.staff.teachers.title')]));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Teacher $teacher)
    {
        $teacher->delete();

        return redirect()->route('manage.staff.index', ['tab' => 'teachers'])
            ->with('success', __('manage.success.deleted', ['item' => __('manage.staff.teachers.title')]));
    }

    // 切換教師的在職狀態
    public function toggleStatus(Request $request, Teacher $teacher)
    {
        $this->authorize('update', $teacher);

        $status = $request->input('status');
        $allowed = ['active', 'inactive', 'retired', 'left'];

        if ($status && ! in_array($status, $allowed, true)) {
            return back()->withErrors([
                'status' => '無效的在職狀態。',
            ]);
        }

        $nextStatus = $status ?: ($teacher->employment_status === 'active' ? 'inactive' : 'active');
        $teacher->employment_status = $nextStatus;

        if ($request->boolean('sync_visibility', true)) {
            if ($nextStatus === 'active' && $request->boolean('restore_visibility', true)) {
                $teacher->visible = true;
            }

            if ($nextStatus !== 'active' && $request->boolean('hide_inactive', true)) {
                $teacher->visible = false;
            }
        }

        $teacher->save();

        return back()->with('success', __('manage.success.updated', ['item' => __('manage.staff.teachers.title')]));
    }

    // 切換教師的前台顯示狀態
    public function toggleVisibility(Teacher $teacher)
    {
        $this->authorize('update', $teacher);

        $teacher->visible = ! $teacher->visible;
        $teacher->save();

        return back()->with('success', __('manage.success.updated', ['item' => __('manage.staff.teachers.title')]));
    }

    // 還原被軟刪除的教師資料
    public function restore(int $teacher)
    {
        $record = Teacher::onlyTrashed()->findOrFail($teacher);
        $this->authorize('restore', $record);

        $record->restore();

        return redirect()->route('manage.staff.index', ['tab' => 'teachers'])
            ->with('success', __('manage.success.updated', ['item' => __('manage.staff.teachers.title')]));
    }

    // 永久刪除教師資料
    public function forceDelete(int $teacher)
    {
        $record = Teacher::onlyTrashed()->findOrFail($teacher);
        $this->authorize('forceDelete', $record);

        $record->forceDelete();

        return redirect()->route('manage.staff.index', ['tab' => 'teachers'])
            ->with('success', __('manage.success.deleted', ['item' => __('manage.staff.teachers.title')]));
    }
}
