<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    /**
     * 顯示聯絡表單訊息。
     */
    public function index(): Response
    {
        return Inertia::render('manage/admin/messages/index');
    }

    /**
     * 顯示建立訊息頁面。
     */
    public function create(): Response
    {
        return Inertia::render('manage/admin/messages/index');
    }

    /**
     * 儲存新訊息。
     */
    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('manage.messages.index');
    }

    /**
     * 顯示訊息內容。
     */
    public function show(string $message): Response
    {
        return Inertia::render('manage/admin/messages/index');
    }

    /**
     * 顯示編輯訊息頁面。
     */
    public function edit(string $message): Response
    {
        return Inertia::render('manage/admin/messages/index');
    }

    /**
     * 更新訊息。
     */
    public function update(Request $request, string $message): RedirectResponse
    {
        return redirect()->route('manage.messages.index');
    }

    /**
     * 刪除訊息。
     */
    public function destroy(string $message): RedirectResponse
    {
        return redirect()->route('manage.messages.index');
    }
}
