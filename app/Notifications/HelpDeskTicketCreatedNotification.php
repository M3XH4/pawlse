<?php

namespace App\Notifications;

use App\Models\HelpDeskTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class HelpDeskTicketCreatedNotification extends Notification
{
    use Queueable;

    public function __construct(public HelpDeskTicket $ticket) {}

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
        $role = $this->ticket->user?->role ?? 'user';
        $targetUrl = $this->ticket->target_role === 'super-admin'
            ? route('account.super-admin.help-desk')
            : route('account.admin.help-desk');

        return [
            'title' => "New Support Ticket: #{$this->ticket->ticket_number}",
            'message' => "{$this->ticket->user?->name} ({$role}) opened a ticket: {$this->ticket->subject}",
            'description' => "{$this->ticket->user?->name} ({$role}) opened a ticket: {$this->ticket->subject}",
            'url' => $targetUrl,
            'icon' => 'system',
            'category' => 'help_desk',
            'ticket_id' => $this->ticket->id,
            'ticket_number' => $this->ticket->ticket_number,
        ];
    }
}
