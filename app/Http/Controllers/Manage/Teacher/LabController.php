<?php

namespace App\Http\Controllers\Manage\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LabController extends Controller
{
    /**
     * 顯示實驗室管理頁面。
     */
    public function index(): Response
    {
        return Inertia::render('manage/teacher/labs/index');
    }

    /**
     * 顯示新增實驗室頁面。
     */
    public function create(): Response
    {
        return Inertia::render('manage/teacher/labs/index');
    }

    /**
     * 儲存新的實驗室資料。
     */
    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('manage.teacher.labs.index');
    }

    /**
     * 顯示實驗室詳細資訊。
     */
    public function show(string $lab): Response
    {
        return Inertia::render('manage/teacher/labs/index');
    }

    /**
     * 顯示編輯實驗室頁面。
     */
    public function edit(string $lab): Response
    {
        return Inertia::render('manage/teacher/labs/index');
    }

    /**
     * 更新實驗室資料。
     */
    public function update(Request $request, string $lab): RedirectResponse
    {
        return redirect()->route('manage.teacher.labs.index');
    }

    /**
     * 刪除實驗室資料。
     */
    public function destroy(string $lab): RedirectResponse
    {
        return redirect()->route('manage.teacher.labs.index');
    }
}
