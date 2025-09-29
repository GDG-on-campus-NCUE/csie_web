<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 15);
        if ($perPage < 1) {
            $perPage = 15;
        }

        if ($perPage > 200) {
            $perPage = 200;
        }

        $projects = Project::with(['teachers'])
            ->orderBy('start_date', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('manage/projects/index', [
            'projects' => $projects,
            'perPage' => $perPage,
            'perPageOptions' => [15, 30, 50, 100, 200],
            'filters' => $request->only(['per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('manage/projects/create', [
            'teachers' => Teacher::orderBy('name->zh-TW')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'nullable|string',
            'title' => 'required|array',
            'title.zh-TW' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'abstract' => 'nullable|array',
            'abstract.zh-TW' => 'nullable|string',
            'abstract.en' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'sponsor' => 'nullable|string',
            'budget' => 'nullable|numeric|min:0',
            'website_url' => 'nullable|url',
            'visible' => 'boolean',
            'teacher_ids' => 'array',
            'teacher_ids.*' => 'exists:teachers,id',
        ]);

        $teacherIds = $validated['teacher_ids'] ?? [];
        unset($validated['teacher_ids']);

        $project = Project::create($validated);

        if (!empty($teacherIds)) {
            $project->teachers()->attach($teacherIds);
        }

        return redirect()->route('manage.projects.index')
            ->with('success', '研究計畫建立成功');
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        return Inertia::render('manage/projects/show', [
            'project' => $project->load(['teachers']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project)
    {
        return Inertia::render('manage/projects/edit', [
            'project' => $project->load(['teachers']),
            'teachers' => Teacher::orderBy('name->zh-TW')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'code' => 'nullable|string',
            'title' => 'required|array',
            'title.zh-TW' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'abstract' => 'nullable|array',
            'abstract.zh-TW' => 'nullable|string',
            'abstract.en' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'sponsor' => 'nullable|string',
            'budget' => 'nullable|numeric|min:0',
            'website_url' => 'nullable|url',
            'visible' => 'boolean',
            'teacher_ids' => 'array',
            'teacher_ids.*' => 'exists:teachers,id',
        ]);

        $teacherIds = $validated['teacher_ids'] ?? [];
        unset($validated['teacher_ids']);

        $project->update($validated);
        $project->teachers()->sync($teacherIds);

        return redirect()->route('manage.projects.index')
            ->with('success', '研究計畫更新成功');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        $project->teachers()->detach();
        $project->delete();

        return redirect()->route('manage.projects.index')
            ->with('success', '研究計畫刪除成功');
    }
}
