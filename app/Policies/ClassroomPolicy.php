<?php

namespace App\Policies;

use App\Models\Classroom;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ClassroomPolicy
{
    use HandlesAuthorization;

    /**
     * 檢視列表：管理員與教師皆可進入教室模組。
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'teacher'], true);
    }

    /**
     * 檢視單筆：與列表一致，方便教師查閱所屬教室。
     */
    public function view(User $user, Classroom $classroom): bool
    {
        return in_array($user->role, ['admin', 'teacher'], true);
    }

    /**
     * 建立：僅管理員可新增教室資料。
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * 更新：管理員可更新任何教室；教師僅能維護自己被指派的教室。
     */
    public function update(User $user, Classroom $classroom): bool
    {
        return $user->role === 'admin';
    }

    /**
     * 刪除：出於資料安全考量僅限管理員操作。
     */
    public function delete(User $user, Classroom $classroom): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, Classroom $classroom): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Classroom $classroom): bool
    {
        return $user->role === 'admin';
    }
}
