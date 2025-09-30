<?php

namespace App\Policies;

use App\Models\StaffProfile;
use App\Models\User;

class StaffProfilePolicy
{
    /**
     * 檢視任何職員檔案
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRoleOrHigher('user');
    }

    /**
     * 檢視特定職員檔案
     */
    public function view(User $user, StaffProfile $staffProfile): bool
    {
        return $staffProfile->person->visible && $staffProfile->person->status === 'active';
    }

    /**
     * 建立職員檔案
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * 更新職員檔案
     */
    public function update(User $user, StaffProfile $staffProfile): bool
    {
        // 管理員可以更新所有職員檔案
        if ($user->isAdmin()) {
            return true;
        }

        // 檢查是否為本人的職員檔案
        return $user->people()->where('people.id', $staffProfile->person_id)->exists();
    }

    /**
     * 刪除職員檔案
     */
    public function delete(User $user, StaffProfile $staffProfile): bool
    {
        return $user->isAdmin();
    }

    /**
     * 取得可編輯的欄位
     */
    public function getEditableFields(User $user, StaffProfile $staffProfile): array
    {
        if ($user->isAdmin()) {
            return [
                'position', 'position_en', 'department', 'department_en'
            ];
        }

        // 職員本人可以編輯的欄位
        if ($user->people()->where('people.id', $staffProfile->person_id)->exists()) {
            return ['position', 'position_en'];
        }

        return [];
    }
}
