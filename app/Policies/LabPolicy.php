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
        // 管理員可以執行所有操作
        if ($user->role === 'admin') {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin 和 Teacher 可以查看實驗室列表
        return in_array($user->role, ['admin', 'teacher']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Lab $lab): bool
    {
        // Admin 可以查看所有實驗室
        if ($user->role === 'admin') {
            return true;
        }

        // Teacher 可以查看自己負責或參與的實驗室
        if ($user->role === 'teacher') {
            return $lab->principal_investigator_id === $user->id
                || $lab->members->contains($user);
        }

        // 一般使用者可以查看公開的實驗室
        return $lab->visible;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin 和 Teacher 可以建立實驗室
        return in_array($user->role, ['admin', 'teacher']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Lab $lab): bool
    {
        // Admin 可更新任何實驗室
        if ($user->role === 'admin') {
            return true;
        }

        // 只有負責教師（PI）可以更新實驗室
        if ($user->role === 'teacher') {
            return $lab->principal_investigator_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Lab $lab): bool
    {
        // Admin 可刪除任何實驗室
        if ($user->role === 'admin') {
            return true;
        }

        // 負責教師可以刪除自己的實驗室
        if ($user->role === 'teacher') {
            return $lab->principal_investigator_id === $user->id;
        }

        return false;
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
        // Admin 可管理任何實驗室成員
        if ($user->role === 'admin') {
            return true;
        }

        // 負責教師可以管理成員
        if ($user->role === 'teacher') {
            return $lab->principal_investigator_id === $user->id;
        }

        return false;
    }
}

