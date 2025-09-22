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
    public function before(User $user, string $ability): bool|null
    {
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
        return in_array($user->role, ['admin', 'teacher']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        // Admin can view all users
        if ($user->role === 'admin') {
            return true;
        }

        // Teacher can view regular users
        if ($user->role === 'teacher') {
            return $model->role === 'user' || $user->id === $model->id;
        }

        // User can only view themselves
        return $user->id === $model->id;
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
    public function update(User $user, User $model): bool
    {
        // Admin can update all users except other admins (but can update self)
        if ($user->role === 'admin') {
            return $model->role !== 'admin' || $user->id === $model->id;
        }

        // Teacher can update regular users and themselves
        if ($user->role === 'teacher') {
            return $model->role === 'user' || $user->id === $model->id;
        }

        // User can only update themselves
        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        // 管理員可刪除除自己外的帳號，具體限制由控制器判斷
        if ($user->role === 'admin') {
            return $user->id !== $model->id;
        }

        // Teacher and regular users cannot delete users
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): bool
    {
        // 管理員可永久刪除除自己外的帳號
        return $user->role === 'admin' && $user->id !== $model->id;
    }

    /**
     * Determine whether the user can assign roles to the model.
     */
    public function assignRole(User $user, User $model): bool
    {
        // Only admin can assign roles, and only to non-admin users
        return $user->role === 'admin' && $model->role !== 'admin';
    }

    /**
     * Determine whether the user can manage teacher assignments.
     */
    public function manageTeacherAssignments(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can view settings of the model.
     */
    public function viewSettings(User $user, User $model): bool
    {
        // Admin can view all settings
        if ($user->role === 'admin') {
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
        if ($user->role === 'admin') {
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
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can access management dashboard.
     */
    public function accessManageDashboard(User $user): bool
    {
        return in_array($user->role, ['admin', 'teacher']);
    }
}
