<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\UserProfileLink;
use App\Models\UserRole;
use Illuminate\Support\Facades\DB;

class UserRoleProfileSynchronizer
{
    /**
     * 同步使用者角色並確保個人檔案存在。
     *
     * @param  list<string>  $roles
     */
    public function synchronizeUserProfile(User $user, array $roles, ?array $profileData = null): void
    {
        DB::transaction(function () use ($user, $roles, $profileData) {
            $this->syncUserRoles($user, $roles);
            $this->syncProfile($user, $profileData ?? []);
        });
    }

    /**
     * 將使用者角色更新為指定集合。
     *
     * @param  list<string>  $roleNames
     */
    private function syncUserRoles(User $user, array $roleNames): void
    {
        $desiredRoles = collect($roleNames)->unique()->values();
        $currentRoles = $user->userRoles()->get();

        $currentRoles
            ->filter(fn (UserRole $userRole) => ! $desiredRoles->contains($userRole->role?->name))
            ->each(fn (UserRole $userRole) => $userRole->deactivate());

        $desiredRoles->each(function (string $roleName) use ($user, $currentRoles) {
            $role = Role::where('name', $roleName)->first();
            if (! $role) {
                return;
            }

            /** @var UserRole|null $userRole */
            $userRole = $currentRoles->first(fn (UserRole $record) => $record->role_id === $role->id);

            if ($userRole) {
                if (! $userRole->isActive()) {
                    $userRole->activate();
                }

                return;
            }

            UserRole::create([
                'user_id' => $user->id,
                'role_id' => $role->id,
                'status' => 'active',
                'assigned_at' => now(),
            ]);
        });
    }

    /**
     * 建立或更新使用者個人檔案。
     */
    private function syncProfile(User $user, array $profileData): void
    {
        $profile = $user->profile;

        if (! $profile) {
            $profile = new UserProfile(['user_id' => $user->id]);
        }

        $payload = array_intersect_key($profileData, array_flip([
            'avatar_url',
            'bio',
            'experience',
            'education',
        ]));

        if ($profile->exists) {
            $profile->fill($payload);
        } else {
            $profile->fill($payload + ['experience' => [], 'education' => []]);
        }

        $profile->save();

        if (array_key_exists('links', $profileData) && is_array($profileData['links'])) {
            $profile->links()->delete();

            foreach ($profileData['links'] as $index => $link) {
                if (! is_array($link) || empty($link['url'])) {
                    continue;
                }

                $profile->links()->create([
                    'type' => $link['type'] ?? 'other',
                    'label' => $link['label'] ?? null,
                    'url' => $link['url'],
                    'sort_order' => $link['sort_order'] ?? $index,
                ]);
            }
        }
    }

    public function getUserProfile(User $user): ?UserProfile
    {
        return $user->profile?->load('links');
    }

    public function canUserEditProfile(User $actor, User $target): bool
    {
        if ($actor->isAdmin()) {
            return true;
        }

        return $actor->id === $target->id;
    }
}
