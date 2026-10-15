<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('users.{id}', function (User $user, int|string $id): bool {
    return (string) $user->id === (string) $id;
});
