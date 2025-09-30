<?php

namespace App\Services;

use App\Models\User;
use App\Models\Person;
use App\Models\Role;
use App\Models\UserRole;
use App\Models\TeacherProfile;
use App\Models\StaffProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserRoleProfileSynchronizer
{
    /**
     * 同步使用者角色與對應的人員檔案
     */
    public function synchronizeUserProfile(User $user, array $roles, ?Person $person = null): void
    {
        DB::beginTransaction();

        try {
            // 1. 處理角色指派
            $this->syncUserRoles($user, $roles, $person);

            // 2. 同步對應的人員檔案
            if ($person) {
                $this->syncPersonProfiles($person, $roles);
            }

            DB::commit();

            Log::info("User role profile synchronized", [
                'user_id' => $user->id,
                'roles' => $roles,
                'person_id' => $person?->id,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to synchronize user role profile", [
                'user_id' => $user->id,
                'roles' => $roles,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * 同步使用者角色
     */
    private function syncUserRoles(User $user, array $roleNames, ?Person $person = null): void
    {
        // 取得現有的活躍角色
        $currentRoles = $user->userRoles()->where('status', 'active')->get();
        $currentRoleNames = $currentRoles->pluck('role.name')->toArray();

        // 停用不再需要的角色
        $rolesToDeactivate = array_diff($currentRoleNames, $roleNames);
        foreach ($rolesToDeactivate as $roleName) {
            $userRole = $currentRoles->first(function ($ur) use ($roleName) {
                return $ur->role->name === $roleName;
            });
            if ($userRole) {
                $userRole->deactivate();
            }
        }

        // 啟用或新增需要的角色
        foreach ($roleNames as $roleName) {
            $role = Role::where('name', $roleName)->first();
            if (!$role) {
                continue;
            }

            $userRole = UserRole::where('user_id', $user->id)
                ->where('role_id', $role->id)
                ->first();

            if ($userRole) {
                if ($userRole->status === 'inactive') {
                    $userRole->activate();
                    if ($person) {
                        $userRole->update(['person_id' => $person->id]);
                    }
                }
            } else {
                UserRole::create([
                    'user_id' => $user->id,
                    'role_id' => $role->id,
                    'person_id' => $person?->id,
                    'status' => 'active',
                    'assigned_at' => now(),
                ]);
            }
        }
    }

    /**
     * 同步人員檔案
     */
    private function syncPersonProfiles(Person $person, array $roleNames): void
    {
        // 處理教師檔案
        if (in_array('teacher', $roleNames)) {
            if (!$person->teacherProfile) {
                TeacherProfile::create([
                    'person_id' => $person->id,
                    'title' => ['zh-TW' => '', 'en' => ''],
                    'expertise' => ['zh-TW' => [], 'en' => []],
                    'education' => ['zh-TW' => [], 'en' => []],
                ]);
            }
        }

        // 處理職員檔案
        if (in_array('staff', $roleNames)) {
            if (!$person->staffProfile) {
                StaffProfile::create([
                    'person_id' => $person->id,
                    'position' => ['zh-TW' => '', 'en' => ''],
                ]);
            }
        }
    }

    /**
     * 建立新的人員檔案並指派角色
     */
    public function createPersonWithRoles(array $personData, array $roleNames, ?User $user = null): Person
    {
        DB::beginTransaction();

        try {
            // 建立人員基底資料
            $person = Person::create($personData);

            // 如果有使用者帳號，建立關聯
            if ($user) {
                $this->synchronizeUserProfile($user, $roleNames, $person);
            } else {
                // 只建立人員檔案，不關聯使用者
                $this->syncPersonProfiles($person, $roleNames);
            }

            DB::commit();

            return $person;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * 更新人員狀態（啟用/停用/退休）
     */
    public function updatePersonStatus(Person $person, string $status): void
    {
        $person->update(['status' => $status]);

        // 如果是停用或退休，同時停用相關的使用者角色
        if (in_array($status, ['inactive', 'retired'])) {
            $person->userRoles()->where('status', 'active')->each(function ($userRole) {
                $userRole->deactivate();
            });
        }

        Log::info("Person status updated", [
            'person_id' => $person->id,
            'status' => $status,
        ]);
    }

    /**
     * 移除使用者的特定角色
     */
    public function removeUserRole(User $user, string $roleName): void
    {
        $userRole = $user->userRoles()
            ->whereHas('role', function ($q) use ($roleName) {
                $q->where('name', $roleName);
            })
            ->where('status', 'active')
            ->first();

        if ($userRole) {
            $userRole->deactivate();

            Log::info("User role removed", [
                'user_id' => $user->id,
                'role' => $roleName,
            ]);
        }
    }

    /**
     * 取得使用者的所有人員檔案
     */
    public function getUserProfiles(User $user): array
    {
        $profiles = [];

        foreach ($user->people()->get() as $person) {
            $profileData = [
                'person' => $person,
                'roles' => $person->getActiveRoles(),
            ];

            if ($person->teacherProfile) {
                $profileData['teacher_profile'] = $person->teacherProfile;
            }

            if ($person->staffProfile) {
                $profileData['staff_profile'] = $person->staffProfile;
            }

            $profiles[] = $profileData;
        }

        return $profiles;
    }

    /**
     * 檢查使用者是否可以編輯特定人員檔案
     */
    public function canUserEditPerson(User $user, Person $person): bool
    {
        // 管理員可以編輯所有檔案
        if ($user->isAdmin()) {
            return true;
        }

        // 檢查是否為本人的檔案
        $isOwnProfile = $user->people()->where('people.id', $person->id)->exists();
        if ($isOwnProfile) {
            return true;
        }

        // 其他權限邏輯可以在這裡擴充
        return false;
    }
}
