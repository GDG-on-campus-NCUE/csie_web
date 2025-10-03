<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * 判斷使用者是否可以查看任何研究計畫。
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'teacher']);
    }

    /**
     * 判斷使用者是否可以查看指定的研究計畫。
     */
    public function view(User $user, Project $project): bool
    {
        // 管理員可以查看所有計畫
        if ($user->role === 'admin') {
            return true;
        }

        // 教師只能查看自己作為主持人的計畫
        return $user->role === 'teacher' &&
               $project->principal_investigator === $user->name;
    }

    /**
     * 判斷使用者是否可以建立研究計畫。
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'teacher']);
    }

    /**
     * 判斷使用者是否可以更新指定的研究計畫。
     */
    public function update(User $user, Project $project): bool
    {
        // 管理員可以更新所有計畫
        if ($user->role === 'admin') {
            return true;
        }

        // 教師只能更新自己作為主持人的計畫
        return $user->role === 'teacher' &&
               $project->principal_investigator === $user->name;
    }

    /**
     * 判斷使用者是否可以刪除指定的研究計畫。
     */
    public function delete(User $user, Project $project): bool
    {
        // 管理員可以刪除所有計畫
        if ($user->role === 'admin') {
            return true;
        }

        // 教師只能刪除自己作為主持人的計畫
        return $user->role === 'teacher' &&
               $project->principal_investigator === $user->name;
    }

    /**
     * 判斷使用者是否可以還原指定的研究計畫。
     */
    public function restore(User $user, Project $project): bool
    {
        return $user->role === 'admin';
    }

    /**
     * 判斷使用者是否可以永久刪除指定的研究計畫。
     */
    public function forceDelete(User $user, Project $project): bool
    {
        return $user->role === 'admin';
    }
}
