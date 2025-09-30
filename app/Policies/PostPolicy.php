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
        // 管理員可檢視所有公告
        if ($user->isAdmin()) {
            return true;
        }

        // 教師可檢視所有公告以利協作管理
        if ($user->isTeacher()) {
            return true;
        }

        // 一般會員僅能檢視已發布的公告
        return $post->status === 'published';
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Post $post): bool
    {
        // 管理員可編輯所有公告
        if ($user->isAdmin()) {
            return true;
        }

        // 教師可以編輯所有公告以支援團隊維護
        if ($user->isTeacher()) {
            return true;
        }

        // 一般會員不可編輯公告
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Post $post): bool
    {
        // 管理員可刪除任何公告
        if ($user->isAdmin()) {
            return true;
        }

        // 教師僅能刪除自己建立的公告
        if ($user->isTeacher()) {
            return $post->created_by === $user->id;
        }

        // 一般會員不可刪除公告
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Post $post): bool
    {
        // 管理員可復原任何公告
        if ($user->isAdmin()) {
            return true;
        }

        // 教師僅能復原自己建立的公告
        if ($user->isTeacher()) {
            return $post->created_by === $user->id;
        }

        // 一般會員不可復原公告
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Post $post): bool
    {
        // 只有管理員可以永久刪除公告
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can publish posts.
     */
    public function publish(User $user, Post $post): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can unpublish posts.
     */
    public function unpublish(User $user, Post $post): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can manage post categories.
     */
    public function manageCategories(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can perform bulk operations.
     */
    public function bulkOperations(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view analytics.
     */
    public function viewAnalytics(User $user): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    /**
     * Determine whether the user can schedule posts.
     */
    public function schedulePost(User $user, Post $post): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can moderate comments.
     */
    public function moderateComments(User $user, Post $post): bool
    {
        return $user->isAdmin();
    }
}
