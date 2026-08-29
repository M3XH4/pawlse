<?php

namespace App\Notifications;

use App\Models\Certificate;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class VolunteerCertificateIssuedNotification extends Notification
{
    use Queueable;

    public function __construct(public Certificate $certificate) {}

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
