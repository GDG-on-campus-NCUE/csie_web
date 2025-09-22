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
        // Admin has access to most actions, but we'll handle specific restrictions per method
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
        return in_array($user->role, ['admin', 'manager'], true);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Lab $lab): bool
    {
        // 管理角色可更新任何實驗室
        if (in_array($user->role, ['admin', 'manager'], true)) {
            return true;
        }

        // Teacher can update lab if they are a member of the lab
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
        return in_array($user->role, ['admin', 'manager'], true);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Lab $lab): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Lab $lab): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    /**
     * Determine whether the user can manage lab members.
     */
    public function manageMembers(User $user, Lab $lab): bool
    {
        // 管理角色可管理任何實驗室成員
        if (in_array($user->role, ['admin', 'manager'], true)) {
            return true;
        }

        // Teacher can manage members if they are a member of the lab
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
        // 管理角色可檢視所有實驗室統計
        if (in_array($user->role, ['admin', 'manager'], true)) {
            return true;
        }

        // Teacher can view analytics if they are a member of the lab
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
        // 管理角色可管理任何實驗室相關貼文
        if (in_array($user->role, ['admin', 'manager'], true)) {
            return true;
        }

        // Teacher can manage posts if they are a member of the lab
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
        // Only teachers can be lab members
        if ($user->role !== 'teacher') {
            return false;
        }

        // Check if user has a teacher profile and is assigned to this lab
        if (!$user->teacher) {
            return false;
        }

        return $lab->teachers()->where('teacher_id', $user->teacher->id)->exists();
    }
}
