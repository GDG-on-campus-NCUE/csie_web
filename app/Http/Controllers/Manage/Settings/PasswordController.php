<?php

namespace App\Http\Controllers\Manage\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manage\Settings\UpdatePasswordRequest;
use App\Models\ManageActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * 顯示安全性設定頁面。
     */
    public function edit(): Response
    {
        return Inertia::render('manage/settings/password');
    }

    /**
     * 更新使用者密碼。
     */
    public function update(UpdatePasswordRequest $request): RedirectResponse
    {
        $user = $request->user();

        // 更新密碼
        $user->update([
            'password' => Hash::make($request->validated('password')),
        ]);

        // 記錄活動
        ManageActivity::log(
            'password',
            'update',
            $user,
            $user->id,
            '更新密碼'
        );

        return redirect()
            ->route('manage.settings.password.edit')
            ->with('success', '密碼已成功更新');
    }
}
