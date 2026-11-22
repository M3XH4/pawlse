<?php

namespace App\Notifications;

use App\Models\Badge;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BadgeUnlockedNotification extends Notification
{
    use Queueable;

    public function __construct(public Badge $badge) {}

    /**
     * @return list<string>
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
        $audience = $this->badge->audience === Badge::AUDIENCE_VOLUNTEER ? 'volunteer' : 'user';

        return [
            'title' => "Badge Unlocked: {$this->badge->name}",
            'message' => "You earned the {$this->badge->name} ({$this->badge->tier}) badge and +{$this->badge->xp_reward} Impact XP!",
            'badge_slug' => $this->badge->slug,
            'badge_name' => $this->badge->name,
            'tier' => $this->badge->tier,
            'xp_reward' => $this->badge->xp_reward,
            'url' => "/account/{$audience}/achievements",
            'action_url' => "/account/{$audience}/achievements",
            'icon' => 'achievement',
            'category' => 'achievement',
        ];
    }
}
