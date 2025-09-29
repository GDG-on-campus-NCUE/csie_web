<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return redirect()->route('manage.academics.index', array_merge(
            $request->query(),
            ['tab' => 'programs']
        ));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('manage/programs/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'nullable|string|unique:programs,code',
            'name' => 'required|array',
            'name.zh-TW' => 'required|string|max:255',
            'name.en' => 'nullable|string|max:255',
            'level' => 'required|in:bachelor,master,ai_inservice,dual',
            'description' => 'nullable|array',
            'description.zh-TW' => 'nullable|string',
            'description.en' => 'nullable|string',
            'website_url' => 'nullable|url',
            'sort_order' => 'integer',
            'visible' => 'boolean',
        ]);

        Program::create($validated);

        return redirect()->route('manage.academics.index', ['tab' => 'programs'])
            ->with('success', '學程建立成功');
    }

    /**
     * Display the specified resource.
     */
    public function show(Program $program)
    {
        return Inertia::render('manage/programs/show', [
            'program' => $program->load(['courses']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Program $program)
    {
        return Inertia::render('manage/programs/edit', [
            'program' => $program,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Program $program)
    {
        if ($request->input('action') === 'sync-posts') {
            $validated = $request->validate([
                'action' => ['required', 'in:sync-posts'],
                'posts' => ['nullable', 'array'],
                'posts.*' => ['integer', 'exists:posts,id'],
            ]);

            $program->posts()->sync($validated['posts'] ?? []);

            return redirect()->route('manage.academics.index', ['tab' => 'programs'])
                ->with('success', '學程已更新對應公告內容');
        }

        $validated = $request->validate([
            'code' => 'nullable|string|unique:programs,code,' . $program->id,
            'name' => 'required|array',
            'name.zh-TW' => 'required|string|max:255',
            'name.en' => 'nullable|string|max:255',
            'level' => 'required|in:bachelor,master,ai_inservice,dual',
            'description' => 'nullable|array',
            'description.zh-TW' => 'nullable|string',
            'description.en' => 'nullable|string',
            'website_url' => 'nullable|url',
            'sort_order' => 'integer',
            'visible' => 'boolean',
            'posts' => ['sometimes', 'array'],
            'posts.*' => ['integer', 'exists:posts,id'],
        ]);

        $posts = $validated['posts'] ?? null;
        unset($validated['posts']);

        $program->update($validated);

        if ($posts !== null) {
            $program->posts()->sync($posts);
        }

        return redirect()->route('manage.academics.index', ['tab' => 'programs'])
            ->with('success', '學程更新成功');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Program $program)
    {
        if ($program->courses()->count() > 0) {
            return back()->withErrors(['error' => '此學程下還有課程，無法刪除']);
        }

        $program->delete();

        return redirect()->route('manage.academics.index', ['tab' => 'programs'])
            ->with('success', '學程刪除成功');
    }
}
