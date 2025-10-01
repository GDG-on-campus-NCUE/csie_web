<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttachmentController extends Controller
{
    /**
     * 顯示附件資源列表。
     */
    public function index(): Response
    {
        return Inertia::render('manage/admin/attachments/index');
    }

    /**
     * 顯示新增附件頁面。
     */
    public function create(): Response
    {
        return Inertia::render('manage/admin/attachments/index');
    }

    /**
     * 儲存新附件。
     */
    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('manage.attachments.index');
    }

    /**
     * 顯示附件內容。
     */
    public function show(string $attachment): Response
    {
        return Inertia::render('manage/admin/attachments/index');
    }

    /**
     * 顯示編輯附件頁面。
     */
    public function edit(string $attachment): Response
    {
        return Inertia::render('manage/admin/attachments/index');
    }

    /**
     * 更新附件資訊。
     */
    public function update(Request $request, string $attachment): RedirectResponse
    {
        return redirect()->route('manage.attachments.index');
    }

    /**
     * 刪除附件。
     */
    public function destroy(string $attachment): RedirectResponse
    {
        return redirect()->route('manage.attachments.index');
    }
}
