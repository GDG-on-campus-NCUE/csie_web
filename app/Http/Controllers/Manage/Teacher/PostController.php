<?php

namespace App\Http\Controllers\Manage\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    /**
     * 顯示教師公告管理頁面。
     */
    public function index(): Response
    {
        return Inertia::render('manage/teacher/posts/index');
    }

    /**
     * 顯示新增教師公告頁面。
     */
    public function create(): Response
    {
        return Inertia::render('manage/teacher/posts/index');
    }

    /**
     * 儲存新的教師公告。
     */
    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('manage.teacher.posts.index');
    }

    /**
     * 顯示教師公告內容。
     */
    public function show(string $post): Response
    {
        return Inertia::render('manage/teacher/posts/index');
    }

    /**
     * 顯示編輯教師公告頁面。
     */
    public function edit(string $post): Response
    {
        return Inertia::render('manage/teacher/posts/index');
    }

    /**
     * 更新教師公告。
     */
    public function update(Request $request, string $post): RedirectResponse
    {
        return redirect()->route('manage.teacher.posts.index');
    }

    /**
     * 刪除教師公告。
     */
    public function destroy(string $post): RedirectResponse
    {
        return redirect()->route('manage.teacher.posts.index');
    }
}
