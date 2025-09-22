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
        return in_array($user->role, ['admin', 'manager'], true) ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager', 'teacher']);
    }

    public function view(User $user, Publication $publication): bool
    {
        return in_array($user->role, ['admin', 'manager', 'teacher']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager', 'teacher']);
    }

    public function update(User $user, Publication $publication): bool
    {
        return in_array($user->role, ['admin', 'manager', 'teacher']);
    }

    public function delete(User $user, Publication $publication): bool
    {
        return in_array($user->role, ['admin', 'manager', 'teacher']);
    }

    public function restore(User $user, Publication $publication): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    public function forceDelete(User $user, Publication $publication): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }
}
