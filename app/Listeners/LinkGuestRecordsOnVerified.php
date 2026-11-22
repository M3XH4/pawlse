<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\Account\LinkGuestRecordsToUser;
use Illuminate\Auth\Events\Verified;

class LinkGuestRecordsOnVerified
{
    public function __construct(public LinkGuestRecordsToUser $linker) {}

    public function handle(Verified $event): void
    {
        if (! $event->user instanceof User) {
            return;
        }

        $this->linker->handle($event->user);
    }
}
