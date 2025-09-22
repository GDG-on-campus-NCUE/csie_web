<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Post;
use Illuminate\Auth\Access\HandlesAuthorization;

class PostPolicy
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
        return true; // All users can see the post list (with filtering applied in view method)
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Post $post): bool
    {
        // Admin can view all posts
        if ($user->role === 'admin') {
            return true;
        }

        // 教師可以檢視所有公告以利協作管理
        if ($user->role === 'teacher') {
            return true;
        }

        // Regular user can only view published posts
        return $post->status === 'published';
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'teacher']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Post $post): bool
    {
        // Admin can update any post
        if ($user->role === 'admin') {
            return true;
        }

        // 教師可以編輯所有公告以支援團隊維護
        if ($user->role === 'teacher') {
            return true;
        }

        // Regular users cannot update posts
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Post $post): bool
    {
        // Admin can delete any post
        if ($user->role === 'admin') {
            return true;
        }

        // Teacher can only delete their own posts
        if ($user->role === 'teacher') {
            return $post->created_by === $user->id;
        }

        // Regular users cannot delete posts
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Post $post): bool
    {
        // Admin can restore any post
        if ($user->role === 'admin') {
            return true;
        }

        // Teacher can only restore their own posts
        if ($user->role === 'teacher') {
            return $post->created_by === $user->id;
        }

        // Regular users cannot restore posts
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Post $post): bool
    {
        // Only admin can force delete posts
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can publish posts.
     */
    public function publish(User $user, Post $post): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can unpublish posts.
     */
    public function unpublish(User $user, Post $post): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can manage post categories.
     */
    public function manageCategories(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can perform bulk operations.
     */
    public function bulkOperations(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can view analytics.
     */
    public function viewAnalytics(User $user): bool
    {
        return in_array($user->role, ['admin', 'teacher']);
    }

    /**
     * Determine whether the user can schedule posts.
     */
    public function schedulePost(User $user, Post $post): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can moderate comments.
     */
    public function moderateComments(User $user, Post $post): bool
    {
        return $user->role === 'admin';
    }
}
