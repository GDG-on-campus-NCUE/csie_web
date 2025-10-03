<?php

namespace App\Http\Controllers\Manage\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manage\Settings\UpdateAppearanceRequest;
use App\Models\ManageActivity;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AppearanceController extends Controller
{
    /**
     * 顯示介面外觀設定頁面。
     */
    public function edit(): Response
    {
        $user = auth()->user();
        $preferences = $user->preferences ?? [];

        return Inertia::render('manage/settings/appearance', [
            'currentTheme' => $preferences['theme'] ?? 'system',
            'currentFontSize' => $preferences['font_size'] ?? 'medium',
            'currentLanguage' => $preferences['language'] ?? 'zh-TW',
            'sidebarPinned' => $preferences['sidebar_pinned'] ?? true,
        ]);
    }

    /**
     * 更新介面外觀設定。
     */
    public function update(UpdateAppearanceRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // 取得現有偏好設定
        $preferences = $user->preferences ?? [];

        // 合併新設定
        $preferences = array_merge($preferences, $validated);

        // 更新偏好設定
        $user->update(['preferences' => $preferences]);

        // 記錄活動
        ManageActivity::log(
            'appearance',
            'update',
            $user,
            $user->id,
            '更新外觀設定'
        );

        return redirect()
            ->route('manage.settings.appearance.edit')
            ->with('success', '外觀設定已成功更新');
    }
}
