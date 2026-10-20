<?php

namespace App\Notifications;

use App\Enums\DonationStatus;
use App\Enums\DonationType;
use App\Models\AdoptionApplication;
use App\Models\Donation;
use App\Models\PetReport;
use App\Models\RehomingRequest;
use App\Models\ShelterVisit;
use App\Models\VolunteerApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubmissionEReceiptNotification extends Notification
{
    use Queueable;

    /**
     * @param  array<int, array{label: string, value: string}>  $items
     */
    public function __construct(
        public string $referenceNumber,
        public string $title,
        public string $receiptCategory,
        public string $recipientName,
        public string $recipientEmail,
        public array $items = [],
        public string $highlightLabel = 'Receipt Status',
        public string $highlightValue = 'CONFIRMED',
        public string $methodLabel = 'PAWLSE Portal',
        public string $statusLabel = 'RECEIVED & LOGGED',
        public string $privacyLabel = 'PUBLIC SUPPORTER',
        public ?string $purposeText = null,
        public ?string $footerMessage = null,
        public ?string $actionText = null,
        public ?string $actionUrl = null,
        public string $bannerTheme = 'orange',
    ) {}

    public static function forDonation(Donation $donation, string $stage = 'submitted'): self
    {
        $donation->loadMissing(['payments', 'inKindDonation', 'feedingSponsorship']);

        $type = $donation->type instanceof DonationType ? $donation->type->value : (string) $donation->type;
        $status = $donation->status instanceof DonationStatus ? $donation->status->value : (string) $donation->status;
        $isCompleted = in_array($status, [DonationStatus::Completed->value, DonationStatus::Verified->value], true) || $stage === 'verified';

        $typeLabel = match ($type) {
            DonationType::Cash->value => 'Cash Donation',
            DonationType::InKind->value => 'In-Kind Contribution',
            DonationType::FeedingSponsorship->value => 'Feeding Sponsorship',
            default => ucfirst(str_replace('_', ' ', $type)),
        };

        $formattedAmount = $donation->amount
            ? '₱ '.number_format((float) $donation->amount, 2)
            : ($donation->inKindDonation?->quantity ?: 'In-Kind Supplies');

        $payment = $donation->payments->first();
        $methodLabel = $payment?->method
            ? strtoupper(str_replace('_', ' ', $payment->method))
            : ($type === DonationType::InKind->value ? 'Shelter Drop-Off' : 'PAWLSE Checkout');

        $items = [
            ['label' => 'Contribution Type', 'value' => $typeLabel],
            ['label' => 'Reference Number', 'value' => $donation->public_reference],
        ];

        if ($donation->amount) {
            $items[] = ['label' => 'Contribution Amount', 'value' => '₱ '.number_format((float) $donation->amount, 2)];
        }

        if ($type === DonationType::InKind->value && $donation->inKindDonation) {
            $items[] = ['label' => 'Pledged Supplies', 'value' => $donation->inKindDonation->description];
            if ($donation->inKindDonation->quantity) {
                $items[] = ['label' => 'Quantity', 'value' => $donation->inKindDonation->quantity];
            }
            if ($donation->inKindDonation->drop_off_date) {
                $items[] = ['label' => 'Scheduled Drop-Off', 'value' => (string) $donation->inKindDonation->drop_off_date];
            }
        }

        if ($type === DonationType::FeedingSponsorship->value && $donation->feedingSponsorship) {
            $items[] = ['label' => 'Sponsored Feeding Date', 'value' => (string) $donation->feedingSponsorship->preferred_date];
            if ($donation->feedingSponsorship->occasion) {
                $items[] = ['label' => 'Occasion', 'value' => $donation->feedingSponsorship->occasion];
            }
        }

        if ($payment?->payment_reference) {
            $items[] = ['label' => 'Payment Reference', 'value' => $payment->payment_reference];
        }

        $items[] = [
            'label' => 'Designated Purpose',
            'value' => $donation->purpose ?: 'Veterinary care, rescue operations, and stray feeding support',
        ];

        $heroTitle = match (true) {
            $isCompleted => 'Hope you know you saved a life today!',
            $stage === 'proof_submitted' => 'We received your payment proof!',
            $type === DonationType::InKind->value => 'Your shelter drop-off is scheduled!',
            default => 'Thank you for initiating your contribution!',
        };

        $statusLabel = match (true) {
            $isCompleted => 'COMPLETED & VERIFIED',
            $stage === 'proof_submitted' => 'PROOF UNDER VERIFICATION',
            $type === DonationType::InKind->value => 'SCHEDULED DROP-OFF',
            default => 'AWAITING PAYMENT COMPLETION',
        };

        $actionUrl = $isCompleted
            ? route('donate')
            : ($type === DonationType::InKind->value ? route('donate') : route('donate.checkout', $donation->public_reference));

        $actionText = $isCompleted
            ? 'View Public Transparency Ledger'
            : ($type === DonationType::InKind->value ? 'View Donation Portal' : 'Complete Checkout / Upload Receipt');

        $footerMessage = $isCompleted
            ? 'Your official contribution has been verified by Iligan Stray Feeders and recorded in the PAWLSE Transparency Ledger.'
            : ($type === DonationType::InKind->value
                ? 'Please bring this e-receipt reference when dropping off your supplies at the Iligan Stray Feeders Shelter (9:00 AM – 5:00 PM).'
                : 'Keep this e-receipt reference for your records. Once payment verification is completed, your verified e-receipt will be issued automatically.');

        return new self(
            referenceNumber: $donation->public_reference,
            title: $heroTitle,
            receiptCategory: "{$typeLabel} E-Receipt",
            recipientName: $donation->anonymous ? ($donation->donor_name ?: 'Anonymous Supporter').' (Anonymous)' : ($donation->donor_name ?: 'Generous Donor'),
            recipientEmail: (string) $donation->donor_email,
            items: $items,
            highlightLabel: $donation->amount ? ($isCompleted ? 'Total Paid' : 'Pledged Amount') : 'Contribution Summary',
            highlightValue: $formattedAmount,
            methodLabel: $methodLabel,
            statusLabel: $statusLabel,
            privacyLabel: $donation->anonymous ? 'ANONYMOUS SUPPORTER' : 'PUBLIC SUPPORTER',
            purposeText: $donation->purpose ?: 'Veterinary care, rescue operations, and stray feeding support in Iligan City.',
            footerMessage: $footerMessage,
            actionText: $actionText,
            actionUrl: $actionUrl,
            bannerTheme: $isCompleted ? 'green' : 'orange',
        );
    }

    public static function forVolunteerApplication(VolunteerApplication $application): self
    {
        $items = [
            ['label' => 'Reference Number', 'value' => $application->reference_number ?: 'VOL-PENDING'],
            ['label' => 'Applicant Name', 'value' => $application->full_name],
            ['label' => 'Preferred Role', 'value' => $application->role],
            ['label' => 'Contact Mobile', 'value' => $application->mobile],
            ['label' => 'City / Address', 'value' => $application->address],
        ];

        if ($application->role === 'Foster Volunteer' && $application->foster_capacity) {
            $items[] = ['label' => 'Foster Capacity', 'value' => $application->foster_capacity.' pet(s)'];
        }

        return new self(
            referenceNumber: $application->reference_number ?: 'VOL-'.$application->id,
            title: 'Welcome to the Iligan Stray Feeders family!',
            receiptCategory: 'Volunteer Application E-Receipt',
            recipientName: $application->full_name,
            recipientEmail: $application->email,
            items: $items,
            highlightLabel: 'Preferred Role',
            highlightValue: $application->role,
            methodLabel: 'Volunteer Portal',
            statusLabel: 'APPLICATION RECEIVED',
            privacyLabel: 'VOLUNTEER APPLICANT',
            purposeText: "Volunteer registration for {$application->role} with Iligan Stray Feeders.",
            footerMessage: 'Our volunteer coordinator will contact you within 24 hours via SMS or email regarding your orientation schedule.',
            actionText: 'View Volunteer Portal',
            actionUrl: route('volunteer'),
            bannerTheme: 'blue',
        );
    }

    public static function forAdoptionApplication(AdoptionApplication $application): self
    {
        $application->loadMissing('shelterAnimal');
        $petName = $application->shelterAnimal?->name ?? 'Shelter Pet';
        $ref = 'ADP-'.str_pad((string) $application->id, 5, '0', STR_PAD_LEFT);

        $items = [
            ['label' => 'Application Ref', 'value' => $ref],
            ['label' => 'Pet Applied For', 'value' => $petName],
            ['label' => 'Applicant Name', 'value' => $application->full_name],
            ['label' => 'Preferred Interview Date', 'value' => $application->preferred_date ? $application->preferred_date->format('M d, Y') : 'To be coordinated'],
            ['label' => 'Preferred Time', 'value' => $application->preferred_time ?: 'Flexible'],
            ['label' => 'Residence Type', 'value' => $application->residence_type ?: 'Specified in form'],
        ];

        return new self(
            referenceNumber: $ref,
            title: "Your adoption application for {$petName} is in!",
            receiptCategory: 'Adoption Application E-Receipt',
            recipientName: $application->full_name,
            recipientEmail: $application->email,
            items: $items,
            highlightLabel: 'Adoption Candidate',
            highlightValue: $petName,
            methodLabel: 'Adoption Portal',
            statusLabel: 'PENDING REVIEW',
            privacyLabel: 'ADOPTION APPLICANT',
            purposeText: "Loving forever-home application for {$petName} at Iligan Stray Feeders Shelter.",
            footerMessage: 'Our adoption screening team will review your questionnaire and home photos and reach out to confirm your interview.',
            actionText: 'Track My Application',
            actionUrl: route('account.user.adoption-applications'),
            bannerTheme: 'orange',
        );
    }

    public static function forShelterVisit(ShelterVisit $visit): self
    {
        $ref = 'VIS-'.str_pad((string) $visit->id, 5, '0', STR_PAD_LEFT);
        $dateStr = $visit->preferred_date ? $visit->preferred_date->format('M d, Y') : 'Scheduled Date';

        $items = [
            ['label' => 'Visit Reference', 'value' => $ref],
            ['label' => 'Visitor Name', 'value' => $visit->full_name],
            ['label' => 'Preferred Date', 'value' => $dateStr],
            ['label' => 'Time Slot', 'value' => $visit->preferred_time_slot ?: 'Standard Hours'],
            ['label' => 'Group Size', 'value' => $visit->number_of_visitors.' visitor(s)'],
            ['label' => 'Visit Purpose', 'value' => ucfirst(str_replace('_', ' ', (string) $visit->purpose))],
        ];

        return new self(
            referenceNumber: $ref,
            title: 'Your shelter visit request is received!',
            receiptCategory: 'Shelter Visit E-Receipt',
            recipientName: $visit->full_name,
            recipientEmail: (string) $visit->email,
            items: $items,
            highlightLabel: 'Requested Date',
            highlightValue: $dateStr,
            methodLabel: 'Shelter Booking',
            statusLabel: 'AWAITING CONFIRMATION',
            privacyLabel: 'SHELTER VISITOR',
            purposeText: 'Scheduled community visit to Iligan Stray Feeders Shelter, Zone 5, Barangay Tambo, Iligan City.',
            footerMessage: 'ISF will review visitor capacity for your chosen slot and send a confirmation update shortly.',
            actionText: 'Explore Our Shelter Pets',
            actionUrl: route('adopt'),
            bannerTheme: 'blue',
        );
    }

    public static function forRehomingRequest(RehomingRequest $rehomingRequest): self
    {
        $ref = 'REH-'.str_pad((string) $rehomingRequest->id, 5, '0', STR_PAD_LEFT);

        $items = [
            ['label' => 'Request Reference', 'value' => $ref],
            ['label' => 'Pet Name', 'value' => $rehomingRequest->animal_name],
            ['label' => 'Species / Gender', 'value' => "{$rehomingRequest->species} ({$rehomingRequest->gender})"],
            ['label' => 'Current Location', 'value' => $rehomingRequest->current_location],
            ['label' => 'Reason for Rehoming', 'value' => $rehomingRequest->reason],
        ];

        return new self(
            referenceNumber: $ref,
            title: "Rehoming request for {$rehomingRequest->animal_name} received",
            receiptCategory: 'Rehoming Assistance E-Receipt',
            recipientName: $rehomingRequest->full_name,
            recipientEmail: $rehomingRequest->email,
            items: $items,
            highlightLabel: 'Pet Registered',
            highlightValue: $rehomingRequest->animal_name,
            methodLabel: 'Rehoming Portal',
            statusLabel: 'UNDER SHELTER REVIEW',
            privacyLabel: 'PET GUARDIAN',
            purposeText: "Safe rehoming & community screening assistance for {$rehomingRequest->animal_name}.",
            footerMessage: 'Our shelter coordinators will evaluate your request for community adoption board posting or shelter intake.',
            actionText: 'Visit PAWLSE Adoption Hub',
            actionUrl: route('adopt'),
            bannerTheme: 'orange',
        );
    }

    public static function forPetReport(PetReport $report): self
    {
        $type = strtoupper((string) ($report->type ?: 'rescue'));
        $ref = $type.'-'.str_pad((string) $report->id, 5, '0', STR_PAD_LEFT);
        $typeLabel = match ($report->type) {
            'missing' => 'Missing Pet Report',
            'sos' => 'SOS Emergency Report',
            default => 'Stray Rescue Report',
        };

        $items = [
            ['label' => 'Report Reference', 'value' => $ref],
            ['label' => 'Report Type', 'value' => $typeLabel],
            ['label' => 'Animal Type', 'value' => (string) $report->animal_type],
            ['label' => 'Location', 'value' => (string) $report->location],
        ];

        if ($report->name) {
            $items[] = ['label' => 'Pet Name', 'value' => $report->name];
        }

        return new self(
            referenceNumber: $ref,
            title: "Your {$typeLabel} has been logged!",
            receiptCategory: "{$typeLabel} E-Receipt",
            recipientName: $report->contact_name ?: 'Community Reporter',
            recipientEmail: (string) $report->contact_email,
            items: $items,
            highlightLabel: 'Report ID',
            highlightValue: $ref,
            methodLabel: 'PAWLSE Dispatch',
            statusLabel: 'DISPATCH QUEUED',
            privacyLabel: 'COMMUNITY REPORTER',
            purposeText: "Field rescue & community alert coordination at {$report->location}.",
            footerMessage: 'Our rescue coordinators and on-call volunteers have been alerted. Keep your contact line open for location verification.',
            actionText: 'View Rescue & Missing Hub',
            actionUrl: $report->type === 'missing' ? route('missing') : route('rescue'),
            bannerTheme: 'orange',
        );
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("[PAWLSE E-Receipt] {$this->receiptCategory} ({$this->referenceNumber})")
            ->greeting("Hello {$this->recipientName},")
            ->line($this->title)
            ->line("Reference Number: **{$this->referenceNumber}**")
            ->view('emails.e-receipt', [
                'referenceNumber' => $this->referenceNumber,
                'heroTitle' => $this->title,
                'receiptCategory' => $this->receiptCategory,
                'subtitle' => $this->receiptCategory.' • Iligan Stray Feeders',
                'issuedDate' => now()->format('d M Y, g:i A'),
                'recipientName' => $this->recipientName,
                'recipientEmail' => $this->recipientEmail,
                'items' => $this->items,
                'highlightLabel' => $this->highlightLabel,
                'highlightValue' => $this->highlightValue,
                'methodLabel' => $this->methodLabel,
                'statusLabel' => $this->statusLabel,
                'statusBadgeText' => $this->statusLabel,
                'privacyLabel' => $this->privacyLabel,
                'purposeText' => $this->purposeText,
                'footerMessage' => $this->footerMessage,
                'actionText' => $this->actionText,
                'actionUrl' => $this->actionUrl,
                'bannerTheme' => $this->bannerTheme,
            ]);
    }
}
