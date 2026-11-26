<?php

use App\Models\User;
use App\Services\FieldGroupLifecycleService;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('users.{id}', function (User $user, int|string $id): bool {
    return (string) $user->id === (string) $id;
});

Broadcast::channel('field-group.{type}.{id}', function (User $user, string $type, int|string $id): bool {
    return app(FieldGroupLifecycleService::class)->canAccessGroupChat($user, $type, (int) $id);
});
