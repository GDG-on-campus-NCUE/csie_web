<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\PostCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = PostCategory::withCount('posts')
            ->orderBy('sort_order')
            ->orderBy('name->zh-TW')
            ->get();

        return Inertia::render('manage/admin/post-categories/index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('manage/admin/post-categories/create', [
            'parent_categories' => PostCategory::whereNull('parent_id')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|array',
            'name.zh-TW' => 'required|string|max:255',
            'name.en' => 'nullable|string|max:255',
            'parent_id' => 'nullable|exists:post_categories,id',
            'sort_order' => 'integer',
            'visible' => 'boolean',
        ]);

        $validated['slug'] = \Str::slug($validated['name']['zh-TW']);

        PostCategory::create($validated);

        return redirect()->route('manage.post-categories.index')
            ->with('success', '分類建立成功');
    }

    /**
     * Display the specified resource.
     */
    public function show(PostCategory $postCategory)
    {
        return Inertia::render('manage/admin/post-categories/show', [
            'category' => $postCategory->load(['posts', 'children', 'parent']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PostCategory $postCategory)
    {
        return Inertia::render('manage/admin/post-categories/edit', [
            'category' => $postCategory,
            'parent_categories' => PostCategory::whereNull('parent_id')
                ->where('id', '!=', $postCategory->id)
                ->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PostCategory $postCategory)
    {
        $validated = $request->validate([
            'name' => 'required|array',
            'name.zh-TW' => 'required|string|max:255',
            'name.en' => 'nullable|string|max:255',
            'parent_id' => 'nullable|exists:post_categories,id',
            'sort_order' => 'integer',
            'visible' => 'boolean',
        ]);

        $postCategory->update($validated);

        return redirect()->route('manage.post-categories.index')
            ->with('success', '分類更新成功');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PostCategory $postCategory)
    {
        if ($postCategory->posts()->count() > 0) {
            return back()->withErrors(['error' => '此分類下還有公告，無法刪除']);
        }

        $postCategory->delete();

        return redirect()->route('manage.post-categories.index')
            ->with('success', '分類刪除成功');
    }
}
