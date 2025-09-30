<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Publication;
use Illuminate\Auth\Access\HandlesAuthorization;

class PublicationPolicy
{
    use HandlesAuthorization;

    public function before(User $user): bool|null
    {
        return $user->isAdmin() ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    public function view(User $user, Publication $publication): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    public function update(User $user, Publication $publication): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    public function delete(User $user, Publication $publication): bool
    {
        return $user->isAdmin() || $user->isTeacher();
    }

    public function restore(User $user, Publication $publication): bool
    {
        return $user->isAdmin();
    }

    public function forceDelete(User $user, Publication $publication): bool
    {
        return $user->isAdmin();
    }
}
