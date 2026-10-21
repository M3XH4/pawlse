<?php

namespace App\Notifications;

use App\Models\RehomingRequest;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RehomingRequestStatusUpdatedNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public RehomingRequest $rehomingRequest) {}

    public function toMail(object $notifiable): MailMessage
    {
        $ref = 'REH-'.str_pad((string) $this->rehomingRequest->id, 5, '0', STR_PAD_LEFT);

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Request Reference', 'value' => $ref],
                ['label' => 'Pet Name', 'value' => (string) $this->rehomingRequest->animal_name],
                ['label' => 'Species', 'value' => (string) $this->rehomingRequest->species],
                ['label' => 'Status', 'value' => strtoupper(str_replace('_', ' ', (string) $this->rehomingRequest->status))],
            ],
            actionText: 'Track Rehoming Request Status',
            level: in_array($this->rehomingRequest->status, ['posted', 'home_found', 'shelter_intake'], true) ? 'success' : ($this->rehomingRequest->status === 'declined' ? 'error' : 'primary'),
            categoryBadge: "REHOMING REQUEST ({$ref})",
            actionUrl: route('track', [
                'reference' => $ref,
                'email' => $this->rehomingRequest->email,
            ]),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $ref = 'REH-'.str_pad((string) $this->rehomingRequest->id, 5, '0', STR_PAD_LEFT);
        $status = match ($this->rehomingRequest->status) {
            'reviewed' => 'Reviewed',
            'posted' => 'Cross-Posted to Community Socials',
            'shelter_intake' => 'Admitted to Shelter Sanctuary',
            'home_found' => 'Home Found / Placed',
            'declined' => 'Declined',
            default => ucfirst($this->rehomingRequest->status),
        };

        $message = match ($this->rehomingRequest->status) {
            'reviewed' => "Your rehoming request for {$this->rehomingRequest->animal_name} (Ref: {$ref}) has been reviewed by the shelter team.",
            'posted' => "Your rehoming request for {$this->rehomingRequest->animal_name} (Ref: {$ref}) has been cross-posted to ISF community social channels to help locate prospective adopters.",
            'shelter_intake' => "Great news! {$this->rehomingRequest->animal_name} (Ref: {$ref}) has been safely admitted into the ISF shelter sanctuary as an available adoptable pet.",
            'home_found' => "Great news! A permanent adoptive home has been finalized for {$this->rehomingRequest->animal_name} (Ref: {$ref}).",
            'declined' => "Your rehoming request for {$this->rehomingRequest->animal_name} (Ref: {$ref}) could not be accepted at this time.".($this->rehomingRequest->admin_notes ? " Notes: {$this->rehomingRequest->admin_notes}" : ''),
            default => "The status of your rehoming request for {$this->rehomingRequest->animal_name} (Ref: {$ref}) has been updated to {$status}.",
        };

        $url = $this->rehomingRequest->user_id
            ? route('account.user.rehoming-requests')
            : route('track', [
                'reference' => $ref,
                'email' => $this->rehomingRequest->email,
            ]);

        return [
            'title' => "Rehoming Request: {$status} ({$ref})",
            'message' => $message,
            'description' => $message,
            'url' => $url,
            'icon' => 'adoption',
            'category' => 'rehoming',
            'rehoming_request_id' => $this->rehomingRequest->id,
            'status' => $this->rehomingRequest->status,
        ];
    }
}
