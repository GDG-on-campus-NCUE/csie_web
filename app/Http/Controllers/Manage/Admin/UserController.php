<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * 顯示使用者管理列表。
     */
    public function index(): Response
    {
        return Inertia::render('manage/admin/users/index');
    }

    /**
     * 顯示新增使用者頁面。
     */
    public function create(): Response
    {
        return Inertia::render('manage/admin/users/index');
    }

    /**
     * 儲存新使用者。
     */
    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('manage.users.index');
    }

    /**
     * 顯示單一使用者資訊。
     */
    public function show(string $user): Response
    {
        return Inertia::render('manage/admin/users/index');
    }

    /**
     * 顯示編輯使用者頁面。
     */
    public function edit(string $user): Response
    {
        return Inertia::render('manage/admin/users/index');
    }

    /**
     * 更新指定使用者。
     */
    public function update(Request $request, string $user): RedirectResponse
    {
        return redirect()->route('manage.users.index');
    }

    /**
     * 刪除指定使用者。
     */
    public function destroy(string $user): RedirectResponse
    {
        return redirect()->route('manage.users.index');
    }
}
