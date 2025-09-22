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
        return $user->role === 'admin' ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'teacher'], true);
    }

    public function view(User $user, Publication $publication): bool
    {
        return in_array($user->role, ['admin', 'teacher'], true);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'teacher'], true);
    }

    public function update(User $user, Publication $publication): bool
    {
        return in_array($user->role, ['admin', 'teacher'], true);
    }

    public function delete(User $user, Publication $publication): bool
    {
        return in_array($user->role, ['admin', 'teacher'], true);
    }

    public function restore(User $user, Publication $publication): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Publication $publication): bool
    {
        return $user->role === 'admin';
    }
}
