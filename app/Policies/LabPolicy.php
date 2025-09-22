<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Lab;
use Illuminate\Auth\Access\HandlesAuthorization;

class LabPolicy
{
    use HandlesAuthorization;

    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user): bool|null
    {
        // 管理員大多數情境皆可操作，細部限制由各方法處理
        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All users can view lab list
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Lab $lab): bool
    {
        return true; // All users can view individual labs
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Lab $lab): bool
    {
        // 管理員可更新任何實驗室
        if ($user->role === 'admin') {
            return true;
        }

        // 教師若為該實驗室成員即可更新資料
        if ($user->role === 'teacher') {
            return $this->isLabMember($user, $lab);
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Lab $lab): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Lab $lab): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Lab $lab): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can manage lab members.
     */
    public function manageMembers(User $user, Lab $lab): bool
    {
        // 管理員可管理任何實驗室成員
        if ($user->role === 'admin') {
            return true;
        }

        // 教師若為實驗室成員即可調整成員資訊
        if ($user->role === 'teacher') {
            return $this->isLabMember($user, $lab);
        }

        return false;
    }

    /**
     * Determine whether the user can view lab analytics.
     */
    public function viewAnalytics(User $user, Lab $lab): bool
    {
        // 管理員可檢視所有實驗室統計
        if ($user->role === 'admin') {
            return true;
        }

        // 教師若為實驗室成員即可檢視統計資訊
        if ($user->role === 'teacher') {
            return $this->isLabMember($user, $lab);
        }

        return false;
    }

    /**
     * Determine whether the user can manage lab posts.
     */
    public function managePosts(User $user, Lab $lab): bool
    {
        // 管理員可管理任何實驗室相關貼文
        if ($user->role === 'admin') {
            return true;
        }

        // 教師若為實驗室成員即可管理貼文
        if ($user->role === 'teacher') {
            return $this->isLabMember($user, $lab);
        }

        return false;
    }

    /**
     * Check if the user is a member of the lab.
     */
    public function isLabMember(User $user, Lab $lab): bool
    {
        // 僅教師具備加入實驗室的資格
        if ($user->role !== 'teacher') {
            return false;
        }

        // 確認使用者具備教師資料並與該實驗室綁定
        if (! $user->teacher) {
            return false;
        }

        return $lab->teachers()->where('teacher_id', $user->teacher->id)->exists();
    }
}
