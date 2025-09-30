<?php

namespace App\Policies;

use App\Models\Person;
use App\Models\User;

class PersonPolicy
{
    /**
     * 檢視任何人員檔案
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRoleOrHigher('teacher');
    }

    /**
     * 檢視特定人員檔案
     */
    public function view(User $user, Person $person): bool
    {
        // 公開可見的檔案任何人都可以檢視
        if ($person->visible && $person->status === 'active') {
            return true;
        }

        // 管理員可以檢視所有檔案
        if ($user->isAdmin()) {
            return true;
        }

        // 檢查是否為本人的檔案
        return $this->isOwnProfile($user, $person);
    }

    /**
     * 建立人員檔案
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * 更新人員檔案
     */
    public function update(User $user, Person $person): bool
    {
        // 管理員可以更新所有檔案
        if ($user->isAdmin()) {
            return true;
        }

        // 本人可以更新自己的檔案
        if ($this->isOwnProfile($user, $person)) {
            return true;
        }

        return false;
    }

    /**
     * 刪除人員檔案
     */
    public function delete(User $user, Person $person): bool
    {
        return $user->isAdmin();
    }

    /**
     * 管理可見性和排序
     */
    public function manage(User $user, Person $person): bool
    {
        return $user->isAdmin();
    }

    /**
     * 檢查是否為本人的檔案
     */
    private function isOwnProfile(User $user, Person $person): bool
    {
        return $user->people()->where('people.id', $person->id)->exists();
    }

    /**
     * 檢查使用者可以編輯哪些欄位
     */
    public function getEditableFields(User $user, Person $person): array
    {
        $baseFields = ['bio', 'phone'];

        if ($user->isAdmin()) {
            return [
                'name', 'name_en', 'email', 'phone', 'photo_url',
                'bio', 'bio_en', 'status', 'sort_order', 'visible'
            ];
        }

        if ($this->isOwnProfile($user, $person)) {
            // 本人可以編輯基本聯絡資訊和簡介
            return array_merge($baseFields, ['photo_url']);
        }

        return [];
    }
}
