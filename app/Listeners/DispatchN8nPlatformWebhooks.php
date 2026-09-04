<?php

namespace App\Listeners;

use App\Events\AdoptionApplicationStatusUpdatedEvent;
use App\Events\AdoptionApplicationSubmittedEvent;
use App\Events\DonationReceivedEvent;
use App\Events\PetRescueSubmittedEvent;
use App\Jobs\SendN8nWebhookJob;
use Illuminate\Events\Dispatcher;

class DispatchN8nPlatformWebhooks
{
    /**
     * Handle adoption application submission.
     */
    public function handleAdoptionSubmitted(AdoptionApplicationSubmittedEvent $event): void
    {
        $app = $event->application;
        $pet = $app->shelterAnimal;

        SendN8nWebhookJob::dispatch('adoption.application.submitted', [
            'application_id' => $app->id,
            'user_id' => $app->user_id,
            'applicant_name' => $app->full_name,
            'applicant_email' => $app->email,
            'applicant_phone' => $app->phone,
            'pet_id' => $app->shelter_animal_id,
            'pet_name' => $pet?->name ?? 'Unknown',
            'pet_breed' => $pet?->breed ?? 'Unknown',
            'preferred_date' => $app->preferred_date?->toDateString(),
            'submitted_at' => $app->created_at?->toIso8601String() ?? now()->toIso8601String(),
        ]);
    }

    /**
     * Handle adoption application status updates.
     */
    public function handleAdoptionStatusUpdated(AdoptionApplicationStatusUpdatedEvent $event): void
    {
        $app = $event->application;
        $pet = $app->shelterAnimal;
        $statusVal = $app->status instanceof \BackedEnum ? $app->status->value : (string) $app->status;

        SendN8nWebhookJob::dispatch('adoption.application.status_updated', [
            'application_id' => $app->id,
            'user_id' => $app->user_id,
            'applicant_name' => $app->full_name,
            'applicant_email' => $app->email,
            'pet_name' => $pet?->name ?? 'Unknown',
            'status' => $statusVal,
            'rejection_reason' => $app->rejection_reason,
            'notes' => $app->notes,
            'updated_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Handle pet rescue submissions.
     */
    public function handleRescueSubmitted(PetRescueSubmittedEvent $event): void
    {
        $report = $event->report;

        SendN8nWebhookJob::dispatch('pet.rescue.submitted', [
            'report_id' => $report->id,
            'type' => $report->type,
            'animal_type' => $report->animal_type,
            'breed' => $report->breed,
            'location' => $report->location,
            'contact_name' => $report->contact_name,
            'contact_phone' => $report->contact_phone,
            'contact_email' => $report->contact_email,
            'is_duplicate' => (bool) $report->is_duplicate,
            'submitted_at' => $report->created_at?->toIso8601String() ?? now()->toIso8601String(),
        ]);
    }

    /**
     * Handle donation received.
     */
    public function handleDonationReceived(DonationReceivedEvent $event): void
    {
        $donation = $event->donation;

        SendN8nWebhookJob::dispatch('donation.received', [
            'donation_id' => $donation->id,
            'donor_name' => $donation->donor_name,
            'donor_email' => $donation->donor_email,
            'type' => $donation->type,
            'amount' => (float) ($donation->amount ?? 0),
            'status' => $donation->status,
            'reference_number' => $donation->reference_number ?? $donation->transaction_id,
            'submitted_at' => $donation->created_at?->toIso8601String() ?? now()->toIso8601String(),
        ]);
    }

    /**
     * Register listeners for the subscriber.
     */
    public function subscribe(Dispatcher $events): array
    {
        return [
            AdoptionApplicationSubmittedEvent::class => 'handleAdoptionSubmitted',
            AdoptionApplicationStatusUpdatedEvent::class => 'handleAdoptionStatusUpdated',
            PetRescueSubmittedEvent::class => 'handleRescueSubmitted',
            DonationReceivedEvent::class => 'handleDonationReceived',
        ];
    }
}
