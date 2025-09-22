<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return redirect()->route('manage.academics.index', array_merge(
            $request->query(),
            ['tab' => 'courses']
        ));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('manage/admin/courses/create', [
            'programs' => Program::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:courses,code',
            'name' => 'required|array',
            'name.zh-TW' => 'required|string|max:255',
            'name.en' => 'nullable|string|max:255',
            'credit' => 'required|numeric|min:0',
            'hours' => 'nullable|integer|min:0',
            'level' => 'required|in:undergraduate,graduate',
            'semester' => 'nullable|string',
            'syllabus_url' => 'nullable|url',
            'program_id' => 'nullable|exists:programs,id',
            'visible' => 'boolean',
        ]);

        Course::create($validated);

        return redirect()->route('manage.academics.index', ['tab' => 'courses'])
            ->with('success', '課程建立成功');
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        return Inertia::render('manage/admin/courses/show', [
            'course' => $course->load(['program']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Course $course)
    {
        return Inertia::render('manage/admin/courses/edit', [
            'course' => $course,
            'programs' => Program::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:courses,code,' . $course->id,
            'name' => 'required|array',
            'name.zh-TW' => 'required|string|max:255',
            'name.en' => 'nullable|string|max:255',
            'credit' => 'required|numeric|min:0',
            'hours' => 'nullable|integer|min:0',
            'level' => 'required|in:undergraduate,graduate',
            'semester' => 'nullable|string',
            'syllabus_url' => 'nullable|url',
            'program_id' => 'nullable|exists:programs,id',
            'visible' => 'boolean',
        ]);

        $course->update($validated);

        return redirect()->route('manage.academics.index', ['tab' => 'courses'])
            ->with('success', '課程更新成功');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        $course->delete();

        return redirect()->route('manage.academics.index', ['tab' => 'courses'])
            ->with('success', '課程刪除成功');
    }
}
