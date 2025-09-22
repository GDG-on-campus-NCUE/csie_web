<?php

namespace App\Policies;

use App\Models\Attachment;
use App\Models\User;

class AttachmentPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    public function view(?User $user, Attachment $attachment): bool
    {
        if (! $attachment->isPrivate()) {
            return true;
        }

        if (! $user) {
            return false;
        }

        if (in_array($user->role, ['admin', 'manager'], true)) {
            return true;
        }

        return $attachment->uploaded_by !== null && $attachment->uploaded_by === $user->id;
    }

    public function delete(User $user, Attachment $attachment): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    public function restore(User $user, Attachment $attachment): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    public function forceDelete(User $user, Attachment $attachment): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }
}
