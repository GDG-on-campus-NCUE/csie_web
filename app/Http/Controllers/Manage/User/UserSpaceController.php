<?php

namespace App\Http\Controllers\Manage\User;

use App\Http\Controllers\Controller;
use App\Models\ManageActivity;
use App\Models\Space;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Space 資源綁定控制器
 *
 * 負責管理使用者與 Space 的綁定關係
 */
class UserSpaceController extends Controller
{
    /**
     * 顯示 Space 綁定列表頁面
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $userSpaces = $user->spaces()
            ->withPivot(['role', 'access_level', 'created_at'])
            ->get()
            ->map(fn ($space) => [
                'id' => $space->id,
                'name' => $space->name,
                'type' => $space->type,
                'role' => $space->pivot->role,
                'access_level' => $space->pivot->access_level,
                'bound_at' => $space->pivot->created_at->format('Y-m-d H:i'),
            ]);

        $availableSpaces = Space::query()
            ->whereNotIn('id', $user->spaces()->pluck('spaces.id'))
            ->select(['id', 'name', 'type', 'description'])
            ->orderBy('name')
            ->get()
            ->map(fn ($space) => [
                'id' => $space->id,
                'name' => $space->name,
                'type' => $space->type,
                'description' => $space->description,
            ]);

        return Inertia::render('manage/user/spaces/index', [
            'userSpaces' => $userSpaces,
            'availableSpaces' => $availableSpaces,
            'roleOptions' => $this->getRoleOptions(),
            'accessLevelOptions' => $this->getAccessLevelOptions(),
        ]);
    }

    /**
     * 綁定 Space
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'space_id' => ['required', 'exists:spaces,id'],
            'role' => ['required', 'string', 'max:50'],
            'access_level' => ['required', 'in:read,write,admin'],
        ]);

        $user = $request->user();

        // 檢查是否已綁定
        if ($user->spaces()->where('space_id', $validated['space_id'])->exists()) {
            return redirect()
                ->route('manage.user.spaces.index')
                ->withErrors(['space_id' => '此 Space 已經綁定。']);
        }

        DB::transaction(function () use ($user, $validated) {
            $user->spaces()->attach($validated['space_id'], [
                'role' => $validated['role'],
                'access_level' => $validated['access_level'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        ManageActivity::log(
            $user,
            'user.space.bound',
            null,
            ['space_id' => $validated['space_id']],
            '使用者綁定 Space'
        );

        return redirect()
            ->route('manage.user.spaces.index')
            ->with('success', 'Space 已成功綁定。');
    }

    /**
     * 更新 Space 綁定設定
     */
    public function update(Request $request, Space $space): RedirectResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'max:50'],
            'access_level' => ['required', 'in:read,write,admin'],
        ]);

        $user = $request->user();

        // 檢查是否已綁定
        if (! $user->spaces()->where('space_id', $space->id)->exists()) {
            return redirect()
                ->route('manage.user.spaces.index')
                ->withErrors(['space_id' => '尚未綁定此 Space。']);
        }

        DB::transaction(function () use ($user, $space, $validated) {
            $user->spaces()->updateExistingPivot($space->id, [
                'role' => $validated['role'],
                'access_level' => $validated['access_level'],
                'updated_at' => now(),
            ]);
        });

        ManageActivity::log(
            $user,
            'user.space.updated',
            null,
            ['space_id' => $space->id],
            '使用者更新 Space 綁定設定'
        );

        return redirect()
            ->route('manage.user.spaces.index')
            ->with('success', 'Space 綁定設定已更新。');
    }

    /**
     * 解除 Space 綁定
     */
    public function destroy(Request $request, Space $space): RedirectResponse
    {
        $user = $request->user();

        DB::transaction(function () use ($user, $space) {
            $user->spaces()->detach($space->id);
        });

        ManageActivity::log(
            $user,
            'user.space.unbound',
            null,
            ['space_id' => $space->id],
            '使用者解除 Space 綁定'
        );

        return redirect()
            ->route('manage.user.spaces.index')
            ->with('success', 'Space 綁定已解除。');
    }

    /**
     * 同步 Space 資源
     */
    public function sync(Request $request, Space $space): RedirectResponse
    {
        $user = $request->user();

        // TODO: 實作 Space 資源同步邏輯
        // 這裡可以同步附件、公告等資料

        ManageActivity::log(
            $user,
            'user.space.synced',
            null,
            ['space_id' => $space->id],
            '使用者同步 Space 資源'
        );

        return redirect()
            ->route('manage.user.spaces.index')
            ->with('success', 'Space 資源同步完成。');
    }

    /**
     * 取得角色選項
     */
    private function getRoleOptions(): array
    {
        return [
            ['value' => 'member', 'label' => '成員'],
            ['value' => 'collaborator', 'label' => '協作者'],
            ['value' => 'manager', 'label' => '管理者'],
        ];
    }

    /**
     * 取得存取權限選項
     */
    private function getAccessLevelOptions(): array
    {
        return [
            ['value' => 'read', 'label' => '唯讀'],
            ['value' => 'write', 'label' => '讀寫'],
            ['value' => 'admin', 'label' => '管理員'],
        ];
    }
}
