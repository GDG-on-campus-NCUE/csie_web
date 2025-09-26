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
        return Inertia::render('manage/admin/teachers/create');
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
            ->with('success', __('manage.success.created', ['item' => __('manage.teacher.title')]));
    }

    /**
     * Display the specified resource.
     */
    public function show(Teacher $teacher)
    {
        return Inertia::render('manage/admin/teachers/show', [
            'teacher' => new TeacherResource($teacher->load(['links', 'projects', 'publications'])),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Teacher $teacher)
    {
        return Inertia::render('manage/admin/teachers/edit', [
            'teacher' => new TeacherResource($teacher->load(['links'])),
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
            ->with('success', __('manage.success.updated', ['item' => __('manage.teacher.title')]));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Teacher $teacher)
    {
        $teacher->delete();

        return redirect()->route('manage.staff.index', ['tab' => 'teachers'])
            ->with('success', __('manage.success.deleted', ['item' => __('manage.teacher.title')]));
    }
}
