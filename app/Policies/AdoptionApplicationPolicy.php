<?php

namespace App\Policies;

use App\Models\AdoptionApplication;
use App\Models\User;

class AdoptionApplicationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, AdoptionApplication $adoptionApplication): bool
    {
        if ($user->isAdmin() || $user->isSuperAdmin()) {
            return true;
        }

        if ($adoptionApplication->user_id !== null && $adoptionApplication->user_id === $user->id) {
            return true;
        }

        return $adoptionApplication->email !== null && strcasecmp($adoptionApplication->email, $user->email) === 0;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, AdoptionApplication $adoptionApplication): bool
    {
        if ($user->isAdmin() || $user->isSuperAdmin()) {
            return true;
        }

        if ($adoptionApplication->user_id !== null && $adoptionApplication->user_id === $user->id) {
            return true;
        }

        return $adoptionApplication->email !== null && strcasecmp($adoptionApplication->email, $user->email) === 0;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, AdoptionApplication $adoptionApplication): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, AdoptionApplication $adoptionApplication): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, AdoptionApplication $adoptionApplication): bool
    {
        return false;
    }
}
