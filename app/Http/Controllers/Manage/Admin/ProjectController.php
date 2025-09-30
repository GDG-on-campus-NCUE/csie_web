<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 15);
        $perPage = max(1, min($perPage, 200));

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

    public function create()
    {
        return Inertia::render('manage/projects/create', [
            'teachers' => $this->teacherOptions(),
        ]);
    }

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
            'teacher_ids.*' => 'exists:users,id',
        ]);

        $teacherIds = $validated['teacher_ids'] ?? [];
        unset($validated['teacher_ids']);

        $project = Project::create($validated);

        if (! empty($teacherIds)) {
            $project->teachers()->attach($teacherIds);
        }

        return redirect()->route('manage.projects.index')
            ->with('success', '研究計畫建立成功');
    }

    public function show(Project $project)
    {
        return Inertia::render('manage/projects/show', [
            'project' => $project->load(['teachers']),
        ]);
    }

    public function edit(Project $project)
    {
        return Inertia::render('manage/projects/edit', [
            'project' => $project->load(['teachers']),
            'teachers' => $this->teacherOptions(),
        ]);
    }

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
            'teacher_ids.*' => 'exists:users,id',
        ]);

        $teacherIds = $validated['teacher_ids'] ?? [];
        unset($validated['teacher_ids']);

        $project->update($validated);
        $project->teachers()->sync($teacherIds);

        return redirect()->route('manage.projects.index')
            ->with('success', '研究計畫更新成功');
    }

    public function destroy(Project $project)
    {
        $project->teachers()->detach();
        $project->delete();

        return redirect()->route('manage.projects.index')
            ->with('success', '研究計畫刪除成功');
    }

    private function teacherOptions()
    {
        return User::query()
            ->whereHas('userRoles', function ($query) {
                $query->where('status', 'active')->whereHas('role', fn ($role) => $role->where('name', 'teacher'));
            })
            ->orderBy('name')
            ->get(['id', 'name']);
    }
}
