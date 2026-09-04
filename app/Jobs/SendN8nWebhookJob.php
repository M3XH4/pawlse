<?php

namespace App\Jobs;

use App\Services\N8n\N8nService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendN8nWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var array<int, int>
     */
    public $backoff = [5, 15, 30];

    /**
     * Create a new job instance.
     *
     * @param  string  $event  Event name
     * @param  array<string, mixed>  $data  Event data
     * @param  string|null  $customPath  Optional custom webhook path
     */
    public function __construct(
        public string $event,
        public array $data,
        public ?string $customPath = null,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(N8nService $n8n): void
    {
        $success = $n8n->dispatch($this->event, $this->data, $this->customPath);

        if (! $success && config('n8n.enabled', false)) {
            $this->fail(new \RuntimeException("n8n webhook failed for event {$this->event}"));
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(?Throwable $exception): void
    {
        Log::error("SendN8nWebhookJob permanently failed for event: {$this->event}", [
            'error' => $exception?->getMessage(),
        ]);
    }
}
