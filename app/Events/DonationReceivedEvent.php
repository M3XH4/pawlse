<?php

namespace App\Events;

use App\Models\Donation;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DonationReceivedEvent
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Donation $donation,
    ) {}
}
