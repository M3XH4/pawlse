<?php

namespace App\Notifications;

use App\Models\HelpDeskReply;
use App\Models\HelpDeskTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class HelpDeskTicketRepliedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public HelpDeskTicket $ticket,
        public HelpDeskReply $reply
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
        $author = $this->reply->user?->name ?? 'Support Staff';
        $recipientRole = $notifiable->role ?? 'user';

        $url = match ($recipientRole) {
            'super-admin' => route('account.super-admin.help-desk'),
            'admin' => route('account.admin.help-desk'),
            'volunteer' => route('account.volunteer.help-desk'),
            default => route('account.user.help-desk'),
        };

        return [
            'title' => "Reply on Ticket #{$this->ticket->ticket_number}",
            'message' => "{$author} replied: \"".Str::limit($this->reply->message, 80).'"',
            'description' => "{$author} replied on ticket #{$this->ticket->ticket_number}",
            'url' => $url,
            'icon' => 'task',
            'category' => 'help_desk',
            'ticket_id' => $this->ticket->id,
            'ticket_number' => $this->ticket->ticket_number,
        ];
    }
}
