<?php

namespace App\Notifications\Concerns;

use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\MailMessage;

trait RendersBrandedMail
{
    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        if ($notifiable instanceof AnonymousNotifiable) {
            return ['mail'];
        }

        return ['database', 'mail'];
    }

    /**
     * Build a modernized PAWLSE MailMessage from the notification's array payload.
     *
     * @param  array<int, array{label: string, value: string}>  $summaryItems
     */
    protected function buildBrandedMail(
        object $notifiable,
        array $summaryItems = [],
        ?string $actionText = null,
        string $level = 'primary',
        ?string $categoryBadge = null,
        ?string $outroLine = null,
        ?string $actionUrl = null,
        ?string $recipientNameOverride = null,
    ): MailMessage {
        $data = method_exists($this, 'toArray') ? $this->toArray($notifiable) : [];
        $title = (string) ($data['title'] ?? 'PAWLSE Notification');
        $message = (string) ($data['message'] ?? $data['description'] ?? 'You have a new update from PAWLSE.');
        $url = (string) ($actionUrl ?? ($data['url'] ?? url('/')));
        $category = strtoupper((string) ($categoryBadge ?? ($data['category'] ?? 'PAWLSE UPDATE')));
        $recipientName = $recipientNameOverride ?? $notifiable->name ?? 'there';

        $ctaText = $actionText ?? 'Open in PAWLSE Portal';

        $mail = (new MailMessage)
            ->level($level)
            ->subject("[PAWLSE] {$title}")
            ->greeting("Hello there, {$recipientName}!")
            ->line($message)
            ->action($ctaText, $url)
            ->salutation("Warm regards,\nPAWLSE • Iligan Stray Feeders Team");

        if ($outroLine) {
            $mail->line($outroLine);
        }

        return $mail->view('emails.notification', [
            'subject' => "[PAWLSE] {$title}",
            'level' => $level,
            'categoryBadge' => $category,
            'greeting' => "Hello there, {$recipientName}!",
            'headline' => $title,
            'introLines' => [$message],
            'summaryItems' => $summaryItems,
            'actionText' => $ctaText,
            'actionUrl' => $url,
            'displayableActionUrl' => $url,
            'outroLines' => $outroLine ? [$outroLine] : [
                'Thank you for being part of the Iligan Stray Feeders community and helping us care for stray and rescued animals.',
            ],
            'salutation' => "Warm regards,\nPAWLSE • Iligan Stray Feeders Team",
        ]);
    }
}
