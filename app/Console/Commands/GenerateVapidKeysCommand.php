<?php

namespace App\Console\Commands;

use App\Support\WebPushCrypto;
use Illuminate\Console\Command;

class GenerateVapidKeysCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pawlse:vapid-keys {--write : Persist the generated VAPID keys into the .env file}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate VAPID public and private keys for mobile PWA Web Push notifications.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $keys = WebPushCrypto::generateVapidKeys();

        if ($this->option('write')) {
            $envPath = base_path('.env');
            if (! is_file($envPath)) {
                $this->error('.env file not found.');

                return self::FAILURE;
            }

            $contents = (string) file_get_contents($envPath);
            $contents = $this->upsertEnvKey($contents, 'VAPID_PUBLIC_KEY', $keys['publicKey']);
            $contents = $this->upsertEnvKey($contents, 'VAPID_PRIVATE_KEY', $keys['privateKey']);
            if (! str_contains($contents, 'VAPID_SUBJECT=')) {
                $contents = rtrim($contents)."\nVAPID_SUBJECT=mailto:support@iliganstrayfeeders.site\n";
            }

            file_put_contents($envPath, $contents);
            $this->info('VAPID keys generated and written to .env.');
        } else {
            $this->info('Generated VAPID keys:');
        }

        $this->line('VAPID_PUBLIC_KEY='.$keys['publicKey']);
        $this->line('VAPID_PRIVATE_KEY='.$keys['privateKey']);

        return self::SUCCESS;
    }

    private function upsertEnvKey(string $contents, string $key, string $value): string
    {
        $pattern = '/^'.preg_quote($key, '/').'=.*/m';
        $line = $key.'='.$value;

        if (preg_match($pattern, $contents) === 1) {
            return (string) preg_replace($pattern, $line, $contents);
        }

        return rtrim($contents)."\n".$line."\n";
    }
}
