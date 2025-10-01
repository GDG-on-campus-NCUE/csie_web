<?php

namespace App\Http\Controllers\Manage\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * 顯示研究計畫管理頁面。
     */
    public function index(): Response
    {
        return Inertia::render('manage/teacher/projects/index');
    }

    /**
     * 顯示新增研究計畫頁面。
     */
    public function create(): Response
    {
        return Inertia::render('manage/teacher/projects/index');
    }

    /**
     * 儲存新的研究計畫。
     */
    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('manage.teacher.projects.index');
    }

    /**
     * 顯示研究計畫詳細內容。
     */
    public function show(string $project): Response
    {
        return Inertia::render('manage/teacher/projects/index');
    }

    /**
     * 顯示編輯研究計畫頁面。
     */
    public function edit(string $project): Response
    {
        return Inertia::render('manage/teacher/projects/index');
    }

    /**
     * 更新研究計畫。
     */
    public function update(Request $request, string $project): RedirectResponse
    {
        return redirect()->route('manage.teacher.projects.index');
    }

    /**
     * 刪除研究計畫。
     */
    public function destroy(string $project): RedirectResponse
    {
        return redirect()->route('manage.teacher.projects.index');
    }
}
