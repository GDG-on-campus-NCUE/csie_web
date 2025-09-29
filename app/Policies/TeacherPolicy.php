<?php

namespace App\Policies;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TeacherPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'teacher'], true);
    }

    public function view(User $user, Teacher $teacher): bool
    {
        return in_array($user->role, ['admin', 'teacher'], true);
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Teacher $teacher): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'teacher') {
            return (int) $teacher->getAttribute('user_id') === $user->id;
        }

        return false;
    }

    public function delete(User $user, Teacher $teacher): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, Teacher $teacher): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Teacher $teacher): bool
    {
        return $user->role === 'admin';
    }
}
