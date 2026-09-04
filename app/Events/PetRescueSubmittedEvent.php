<?php

namespace App\Events;

use App\Models\PetReport;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PetRescueSubmittedEvent
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public PetReport $report,
    ) {}
}
