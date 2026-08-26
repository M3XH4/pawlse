<?php

namespace App\Console\Commands;

use App\Models\Backup;
use App\Models\SystemSetting;
use Illuminate\Console\Command;

class AutoBackupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:auto-backup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run scheduled automated backups based on system settings';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $settings = SystemSetting::getValue('backup_settings', [
            'auto_enabled' => false,
            'interval' => 'daily',
            'retention_days' => 30,
        ]);

        if (! ($settings['auto_enabled'] ?? false)) {
            $this->info('Auto backup is disabled.');

            return;
        }

        $interval = $settings['interval'] ?? 'daily';
        $shouldBackup = false;

        if ($interval === 'daily') {
            $shouldBackup = true;
        } elseif ($interval === 'weekly') {
            $shouldBackup = now()->isSunday();
        } elseif ($interval === 'monthly') {
            $shouldBackup = (now()->day === 1);
        }

        if (! $shouldBackup) {
            $this->info("Backup is scheduled {$interval}, not running today.");

            return;
        }

        $this->info('Starting automated database backup...');

        try {
            $backup = Backup::createBackup();
            $this->info("Backup successfully completed: {$backup->filename}");

            // Clean up old backups
            $retentionDays = (int) ($settings['retention_days'] ?? 30);
            if ($retentionDays > 0) {
                $cutoffDate = now()->subDays($retentionDays);
                $oldBackups = Backup::where('created_at', '<', $cutoffDate)->get();

                foreach ($oldBackups as $oldBackup) {
                    $filePath = storage_path("app/backups/{$oldBackup->filename}");
                    if (file_exists($filePath)) {
                        unlink($filePath);
                    }
                    $oldBackup->delete();
                    $this->info("Pruned old backup: {$oldBackup->filename}");
                }
            }
        } catch (\Exception $exception) {
            $this->error('Backup failed: '.$exception->getMessage());
        }
    }
}
