<?php

namespace App\Policies;

use App\Models\Attachment;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AttachmentPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->role === 'teacher';
    }

    public function view(User $user, Attachment $attachment): bool
    {
        return (int) $attachment->uploaded_by === (int) $user->id;
    }

    public function download(User $user, Attachment $attachment): bool
    {
        return (int) $attachment->uploaded_by === (int) $user->id;
    }

    public function delete(User $user, Attachment $attachment): bool
    {
        return false;
    }

    public function restore(User $user, Attachment $attachment): bool
    {
        return false;
    }

    public function forceDelete(User $user, Attachment $attachment): bool
    {
        return false;
    }
}

