<?php

namespace App\Notifications;

use App\Models\RehomingRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class RehomingRequestStatusUpdatedNotification extends Notification
{
    use Queueable;

    public function __construct(public RehomingRequest $rehomingRequest) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $status = match ($this->rehomingRequest->status) {
            'reviewed' => 'Reviewed',
            'posted' => 'Posted to Community Board',
            'home_found' => 'Home Found / Shelter Intake Completed',
            'declined' => 'Declined',
            default => ucfirst($this->rehomingRequest->status),
        };

        $message = match ($this->rehomingRequest->status) {
            'reviewed' => "Your rehoming request for {$this->rehomingRequest->animal_name} has been reviewed by the shelter team.",
            'posted' => "Your rehoming request for {$this->rehomingRequest->animal_name} is now posted for community adoption.",
            'home_found' => "Great news! A placement or shelter intake has been finalized for {$this->rehomingRequest->animal_name}.",
            'declined' => "Your rehoming request for {$this->rehomingRequest->animal_name} could not be accepted at this time.".($this->rehomingRequest->admin_notes ? " Notes: {$this->rehomingRequest->admin_notes}" : ''),
            default => "The status of your rehoming request for {$this->rehomingRequest->animal_name} has been updated to {$status}.",
        };

        return [
            'title' => "Rehoming Request: {$status}",
            'message' => $message,
            'description' => $message,
            'url' => route('account.user.notifications'),
            'icon' => 'heart',
            'category' => 'rehoming',
            'rehoming_request_id' => $this->rehomingRequest->id,
            'status' => $this->rehomingRequest->status,
        ];
    }
}
