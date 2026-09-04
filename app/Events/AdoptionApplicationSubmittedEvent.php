<?php

namespace App\Events;

use App\Models\AdoptionApplication;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdoptionApplicationSubmittedEvent
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public AdoptionApplication $application,
    ) {}
}
