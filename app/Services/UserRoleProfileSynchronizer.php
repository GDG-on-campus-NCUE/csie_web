<?php

namespace App\Services;

use App\Events\UserRoleProfilesSynced;
use App\Models\Staff;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Carbon;

class UserRoleProfileSynchronizer
{
    /**
     * 依據使用者角色同步對應的職員與教師檔案。
     */
    public function sync(User $user): void
    {
        $role = $user->role;

        if ($role === 'admin') {
            $this->activateStaffProfile($user);
            $this->deactivateTeacherProfile($user, 'inactive');
        } elseif ($role === 'teacher') {
            $this->activateTeacherProfile($user);
            $this->deactivateStaffProfile($user, 'inactive');
        } else {
            $this->deactivateStaffProfile($user, 'retired');
            $this->deactivateTeacherProfile($user, 'retired');
        }

        event(new UserRoleProfilesSynced($user));
    }

    /**
     * 在刪除帳號時同步停用所有相關檔案。
     */
    public function handleDeletion(User $user): void
    {
        $this->deactivateStaffProfile($user, 'retired', true);
        $this->deactivateTeacherProfile($user, 'retired', true);

        event(new UserRoleProfilesSynced($user));
    }

    /**
     * 在還原帳號時依角色恢復相關檔案。
     */
    public function handleRestoration(User $user): void
    {
        $this->sync($user);
    }

    /**
     * 啟用並更新職員檔案。
     */
    private function activateStaffProfile(User $user): void
    {
        $profile = Staff::withTrashed()->firstOrNew(['user_id' => $user->id]);

        if ($profile->exists === false) {
            $profile->name = [
                'zh-TW' => $user->name,
                'en' => $user->name,
            ];
            $profile->position = [
                'zh-TW' => '行政人員',
                'en' => 'Administrative Staff',
            ];
        }

        if ($profile->trashed()) {
            $profile->restore();
        }

        $profile->email = $user->email;
        $profile->employment_status = 'active';
        $profile->visible = true;
        $profile->employment_started_at ??= Carbon::now();
        $profile->employment_ended_at = null;

        $profile->save();
    }

    /**
     * 啟用並更新教師檔案。
     */
    private function activateTeacherProfile(User $user): void
    {
        $profile = Teacher::withTrashed()->firstOrNew(['user_id' => $user->id]);

        if ($profile->exists === false) {
            $profile->name = [
                'zh-TW' => $user->name,
                'en' => $user->name,
            ];
            $profile->title = [
                'zh-TW' => '教師',
                'en' => 'Teacher',
            ];
        }

        if ($profile->trashed()) {
            $profile->restore();
        }

        $profile->email = $user->email;
        $profile->employment_status = 'active';
        $profile->visible = true;
        $profile->employment_started_at ??= Carbon::now();
        $profile->employment_ended_at = null;

        $profile->save();
    }

    /**
     * 停用職員檔案。
     */
    private function deactivateStaffProfile(User $user, string $status, bool $force = false): void
    {
        $profile = Staff::withTrashed()->where('user_id', $user->id)->first();

        if (! $profile) {
            return;
        }

        if ($force || $profile->employment_status !== $status || $profile->visible !== false) {
            $profile->employment_status = $status;
            if ($status === 'retired') {
                $profile->employment_ended_at = $profile->employment_ended_at ?? Carbon::now();
            } elseif ($status === 'inactive') {
                $profile->employment_ended_at = null;
            }
            $profile->visible = false;
            $profile->save();
        }
    }

    /**
     * 停用教師檔案。
     */
    private function deactivateTeacherProfile(User $user, string $status, bool $force = false): void
    {
        $profile = Teacher::withTrashed()->where('user_id', $user->id)->first();

        if (! $profile) {
            return;
        }

        if ($force || $profile->employment_status !== $status || $profile->visible !== false) {
            $profile->employment_status = $status;
            if ($status === 'retired') {
                $profile->employment_ended_at = $profile->employment_ended_at ?? Carbon::now();
            } elseif ($status === 'inactive') {
                $profile->employment_ended_at = null;
            }
            $profile->visible = false;
            $profile->save();
        }
    }
}
