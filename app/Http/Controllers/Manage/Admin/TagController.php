<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    /**
     * 顯示標籤管理列表。
     */
    public function index(): Response
    {
        return Inertia::render('manage/admin/tags/index');
    }

    /**
     * 顯示新增標籤頁面。
     */
    public function create(): Response
    {
        return Inertia::render('manage/admin/tags/index');
    }

    /**
     * 儲存新標籤。
     */
    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('manage.tags.index');
    }

    /**
     * 顯示單一標籤資訊。
     */
    public function show(string $tag): Response
    {
        return Inertia::render('manage/admin/tags/index');
    }

    /**
     * 顯示編輯標籤頁面。
     */
    public function edit(string $tag): Response
    {
        return Inertia::render('manage/admin/tags/index');
    }

    /**
     * 更新指定標籤。
     */
    public function update(Request $request, string $tag): RedirectResponse
    {
        return redirect()->route('manage.tags.index');
    }

    /**
     * 刪除指定標籤。
     */
    public function destroy(string $tag): RedirectResponse
    {
        return redirect()->route('manage.tags.index');
    }
}
