<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RealtimeDomainEventPushed implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param  array<string, mixed>  $eventData
     */
    public function __construct(
        public array $eventData,
    ) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [new Channel('app-realtime')];

        if (! empty($this->eventData['targetUserId'])) {
            $channels[] = new PrivateChannel('users.'.$this->eventData['targetUserId']);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'app.event';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return $this->eventData;
    }
}
