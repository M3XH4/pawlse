<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\Account\LinkGuestRecordsToUser;
use Illuminate\Auth\Events\Login;

class LinkGuestRecordsOnLogin
{
    public function __construct(public LinkGuestRecordsToUser $linker) {}

    public function handle(Login $event): void
    {
        if (! $event->user instanceof User || ! $event->user->hasVerifiedEmail()) {
            return;
        }

        $this->linker->handle($event->user);
    }
}
