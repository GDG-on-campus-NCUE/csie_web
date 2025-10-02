<?php

namespace App\Policies;

use App\Models\Attachment;
use App\Models\User;

class AttachmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(?User $user, Attachment $attachment): bool
    {
        if (! $attachment->isPrivate()) {
            return true;
        }

        if (! $user) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        return $attachment->uploaded_by !== null && $attachment->uploaded_by === $user->id;
    }

    public function delete(User $user, Attachment $attachment): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Attachment $attachment): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, Attachment $attachment): bool
    {
        return $user->isAdmin();
    }

    public function forceDelete(User $user, Attachment $attachment): bool
    {
        return $user->isAdmin();
    }
}
