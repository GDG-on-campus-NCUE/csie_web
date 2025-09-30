<?php

namespace App\Policies;

use App\Models\TeacherProfile;
use App\Models\User;

class TeacherProfilePolicy
{
    /**
     * 檢視任何教師檔案
     */
    public function viewAny(User $user): bool
    {
        return true; // 教師檔案通常是公開的
    }

    /**
     * 檢視特定教師檔案
     */
    public function view(User $user, TeacherProfile $teacherProfile): bool
    {
        return $teacherProfile->person->visible && $teacherProfile->person->status === 'active';
    }

    /**
     * 建立教師檔案
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * 更新教師檔案
     */
    public function update(User $user, TeacherProfile $teacherProfile): bool
    {
        // 管理員可以更新所有教師檔案
        if ($user->isAdmin()) {
            return true;
        }

        // 檢查是否為本人的教師檔案
        return $user->people()->where('people.id', $teacherProfile->person_id)->exists();
    }

    /**
     * 刪除教師檔案
     */
    public function delete(User $user, TeacherProfile $teacherProfile): bool
    {
        return $user->isAdmin();
    }

    /**
     * 取得可編輯的欄位
     */
    public function getEditableFields(User $user, TeacherProfile $teacherProfile): array
    {
        if ($user->isAdmin()) {
            return [
                'office', 'job_title', 'title', 'title_en',
                'expertise', 'expertise_en', 'education', 'education_en'
            ];
        }

        // 教師本人可以編輯的欄位
        if ($user->people()->where('people.id', $teacherProfile->person_id)->exists()) {
            return [
                'office', 'title', 'title_en', 'expertise',
                'expertise_en', 'education', 'education_en'
            ];
        }

        return [];
    }
}
