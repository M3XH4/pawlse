<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Backup;
use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BackupController extends Controller
{
    /**
     * Display backup page.
     */
    public function index(Request $request): Response
    {
        $backups = Backup::latest()
            ->paginate(10)
            ->through(function ($backup) {
                return [
                    'id' => $backup->id,
                    'filename' => $backup->filename,
                    'disk' => $backup->disk,
                    'size' => $this->formatBytes($backup->size),
                    'status' => $backup->status,
                    'created_at' => $backup->created_at->toDateTimeString(),
                ];
            });

        $settings = SystemSetting::getValue('backup_settings', [
            'auto_enabled' => false,
            'interval' => 'daily',
            'retention_days' => 30,
        ]);

        return Inertia::render('super-admin/backup-restore', [
            'backups' => $backups,
            'settings' => $settings,
        ]);
    }

    /**
     * Trigger a manual backup.
     */
    public function runBackup(): RedirectResponse
    {
        try {
            $backup = Backup::createBackup();
            AuditLog::log('backup_create', "Manually generated database backup: {$backup->filename}");

            return redirect()->back()->with('success', 'Backup completed successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Backup failed: '.$e->getMessage());
        }
    }

    /**
     * Restore from a backup.
     */
    public function restoreBackup(Backup $backup): RedirectResponse
    {
        try {
            $success = $backup->restoreBackup();

            if ($success) {
                AuditLog::log('backup_restore', "Restored database from backup: {$backup->filename}");

                return redirect()->back()->with('success', 'Database successfully restored from backup.');
            } else {
                return redirect()->back()->with('error', 'Backup file not found on disk.');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Restoration failed: '.$e->getMessage());
        }
    }

    /**
     * Delete a backup.
     */
    public function destroyBackup(Backup $backup): RedirectResponse
    {
        $filePath = storage_path("app/backups/{$backup->filename}");
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        $filename = $backup->filename;
        $backup->delete();

        AuditLog::log('backup_delete', "Deleted backup file: {$filename}");

        return redirect()->back()->with('success', 'Backup deleted successfully.');
    }

    /**
     * Update backup schedule settings.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $request->validate([
            'auto_enabled' => ['required', 'boolean'],
            'interval' => ['required', 'string', 'in:daily,weekly,monthly'],
            'retention_days' => ['required', 'integer', 'min:1', 'max:365'],
        ]);

        SystemSetting::setValue('backup_settings', $request->only([
            'auto_enabled',
            'interval',
            'retention_days',
        ]));

        AuditLog::log('backup_settings_update', 'Updated automated backup settings');

        return redirect()->back()->with('success', 'Backup settings updated successfully.');
    }

    private function formatBytes($bytes, $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision).' '.$units[$pow];
    }
}
