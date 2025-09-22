<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\User;
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
        return Inertia::render('manage/admin/teachers/create', [
            'users' => User::where('role', 'teacher')->whereDoesntHave('teacher')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'name' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'title' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'office' => 'nullable|string',
            'job_title' => 'nullable|string',
            'photo_url' => 'nullable|url',
            'bio' => 'nullable|string',
            'bio_en' => 'nullable|string',
            'expertise' => 'nullable|string',
            'expertise_en' => 'nullable|string',
            'education' => 'nullable|string',
            'education_en' => 'nullable|string',
            'sort_order' => 'integer',
            'visible' => 'boolean',
        ]);

        $validated['bio'] = $this->sanitizeRichText($validated['bio'] ?? null);
        $validated['bio_en'] = $this->sanitizeRichText($validated['bio_en'] ?? null);

        Teacher::create($validated);

        return redirect()->route('manage.teachers.index')
            ->with('success', '教師建立成功');
    }

    /**
     * Display the specified resource.
     */
    public function show(Teacher $teacher)
    {
        return Inertia::render('manage/admin/teachers/show', [
            'teacher' => $teacher->load(['user', 'labs', 'links', 'projects', 'publications']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Teacher $teacher)
    {
        return Inertia::render('manage/admin/teachers/edit', [
            'teacher' => $teacher->load(['user', 'links']),
            'users' => User::where('role', 'teacher')
                ->where(function($query) use ($teacher) {
                    $query->whereDoesntHave('teacher')
                          ->orWhere('id', $teacher->user_id);
                })->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Teacher $teacher)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'name' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'title' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'office' => 'nullable|string',
            'job_title' => 'nullable|string',
            'photo_url' => 'nullable|url',
            'bio' => 'nullable|string',
            'bio_en' => 'nullable|string',
            'expertise' => 'nullable|string',
            'expertise_en' => 'nullable|string',
            'education' => 'nullable|string',
            'education_en' => 'nullable|string',
            'sort_order' => 'integer',
            'visible' => 'boolean',
        ]);

        $validated['bio'] = $this->sanitizeRichText($validated['bio'] ?? null);
        $validated['bio_en'] = $this->sanitizeRichText($validated['bio_en'] ?? null);

        $teacher->update($validated);

        return redirect()->route('manage.teachers.index')
            ->with('success', '教師更新成功');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Teacher $teacher)
    {
        $teacher->delete();

        return redirect()->route('manage.teachers.index')
            ->with('success', '教師刪除成功');
    }
}
