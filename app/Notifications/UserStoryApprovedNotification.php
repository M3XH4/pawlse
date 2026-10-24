<?php

namespace App\Notifications;

use App\Models\BlogPost;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserStoryApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public BlogPost $post) {}

    public function toMail(object $notifiable): MailMessage
    {
        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Story Title', 'value' => (string) $this->post->title],
                ['label' => 'Status', 'value' => 'PUBLISHED LIVE'],
            ],
            actionText: 'Read Published Story',
            level: 'success',
            categoryBadge: 'COMMUNITY STORY PUBLISHED',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $petName = $this->post->shelterAnimal?->name;
        $isTestimonial = $this->post->category === 'testimonial';
        $title = $isTestimonial ? 'Testimonial Approved & Published!' : 'Adoption Story Approved & Published!';
        $message = $petName
            ? "Your adoption story for {$petName} (\"{$this->post->title}\") has been approved and is now live on our blog!"
            : ($isTestimonial
                ? "Your community testimonial \"{$this->post->title}\" has been approved and published to the blog!"
                : "Your story \"{$this->post->title}\" has been approved and published to the blog!");

        return [
            'title' => $title,
            'message' => $message,
            'description' => $message,
            'url' => route('blog.show', $this->post->slug),
            'icon' => 'blog',
            'category' => 'blog',
            'post_id' => $this->post->id,
            'slug' => $this->post->slug,
        ];
    }
}
