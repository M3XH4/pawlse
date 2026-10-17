<?php

namespace App\Notifications;

use App\Models\HelpDeskTicket;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class HelpDeskTicketEscalatedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public HelpDeskTicket $ticket,
        public User $adminUser,
        public ?string $escalationReason = null
    ) {}

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
            'title' => "Ticket Escalated to Super Admin: #{$this->ticket->ticket_number}",
            'message' => "Admin {$this->adminUser->name} escalated ticket '{$this->ticket->subject}': {$this->escalationReason}",
            'description' => "Admin {$this->adminUser->name} requested Super Admin intervention on ticket #{$this->ticket->ticket_number}",
            'url' => route('account.super-admin.help-desk'),
            'icon' => 'system',
            'category' => 'help_desk',
            'ticket_id' => $this->ticket->id,
            'ticket_number' => $this->ticket->ticket_number,
        ];
    }
}
