<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Staff;
use Illuminate\Auth\Access\HandlesAuthorization;

class StaffPolicy
{
    use HandlesAuthorization;

    // 判斷使用者是否可檢視列表
    public function viewAny(User $user): bool
    {
        // 教師需能檢視師資模組，但仍保留完整管理權限給管理員
        return in_array($user->role, ['admin', 'teacher'], true);
    }

    // 判斷使用者是否可檢視單筆資料
    public function view(User $user, Staff $staff): bool
    {
        return in_array($user->role, ['admin', 'teacher'], true);
    }

    // 判斷使用者是否可新增
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    // 判斷使用者是否可更新
    public function update(User $user, Staff $staff): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'teacher') {
            // 教師僅能維護與自己帳號綁定的職員資料（若尚未綁定則禁止）
            return (int) $staff->getAttribute('user_id') === $user->id;
        }

        return false;
    }

    // 判斷使用者是否可刪除
    public function delete(User $user, Staff $staff): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, Staff $staff): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Staff $staff): bool
    {
        return $user->role === 'admin';
    }
}
