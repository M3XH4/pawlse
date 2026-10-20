<?php

namespace App\Notifications;

use App\Models\Certificate;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VolunteerCertificateIssuedNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public Certificate $certificate) {}

    public function toMail(object $notifiable): MailMessage
    {
        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Certificate Title', 'value' => (string) $this->certificate->title],
                ['label' => 'Certificate Number', 'value' => (string) $this->certificate->certificate_number],
            ],
            actionText: 'View & Download Certificate',
            level: 'success',
            categoryBadge: 'VOLUNTEER RECOGNITION',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Certificate Issued',
            'message' => "Certificate \"{$this->certificate->title}\" (Ref: {$this->certificate->certificate_number}) has been issued.",
            'description' => "Certificate issued: {$this->certificate->title}.",
            'url' => route('account.volunteer.certificates'),
            'icon' => 'certificate',
            'category' => 'certificate',
            'certificate_id' => $this->certificate->id,
        ];
    }
}
