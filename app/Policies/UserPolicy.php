<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Perform pre-authorization checks.
     * Admin has full access except for certain restricted actions.
     */
    public function before(User $user): bool|null
    {
        // Admin has access to most actions, but we'll override specific ones
        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        // Admin can view all users
        if (in_array($user->role, ['admin', 'manager'], true)) {
            return true;
        }

        // User can only view themselves
        return $user->id === $model->id;
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
    public function update(User $user, User $model): bool
    {
        // 管理員可管理所有帳號
        if (in_array($user->role, ['admin', 'manager'], true)) {
            return true;
        }

        // User can only update themselves
        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        return in_array($user->role, ['admin', 'manager'], true) && $user->id !== $model->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): bool
    {
        // Admin can force delete users, but not themselves
        return in_array($user->role, ['admin', 'manager'], true) && $user->id !== $model->id;
    }

    /**
     * Determine whether the user can assign roles to the model.
     */
    public function assignRole(User $user, User $model): bool
    {
        // 只有管理員可以調整角色
        return in_array($user->role, ['admin', 'manager'], true);
    }

    /**
     * Determine whether the user can manage teacher assignments.
     */
    public function manageTeacherAssignments(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    /**
     * Determine whether the user can view settings of the model.
     */
    public function viewSettings(User $user, User $model): bool
    {
        // Admin can view all settings
        if (in_array($user->role, ['admin', 'manager'], true)) {
            return true;
        }

        // Users can only view their own settings
        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can update settings of the model.
     */
    public function updateSettings(User $user, User $model): bool
    {
        // Admin can update all settings
        if (in_array($user->role, ['admin', 'manager'], true)) {
            return true;
        }

        // Users can only update their own settings
        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can access admin dashboard.
     */
    public function accessAdminDashboard(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    /**
     * Determine whether the user can access management dashboard.
     */
    public function accessManageDashboard(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager']);
    }
}
