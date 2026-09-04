<?php

namespace App\Events;

use App\Models\VolunteerApplication;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VolunteerApplicationApprovedEvent
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public VolunteerApplication $application,
    ) {}
}
