<?php

namespace App\Http\Controllers\Api;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\AdoptionApplication;
use App\Models\AuditLog;
use App\Models\Backup;
use App\Models\Donation;
use App\Models\FeedingSchedule;
use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use App\Models\PetReport;
use App\Models\ShelterAnimal;
use App\Models\SystemSetting;
use App\Models\User;
use App\Models\VolunteerApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AutomationController extends Controller
{
    /**
     * Get aggregated application statistics for scheduled reporting workflows.
     */
    public function statistics(Request $request): JsonResponse
    {
        $sevenDaysAgo = now()->subDays(7);
        $thirtyDaysAgo = now()->subDays(30);

        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'environment' => config('app.env'),
            'summary' => [
                'rescues' => [
                    'total' => PetReport::count(),
                    'pending' => PetReport::where('status', 'pending')->count(),
                    'in_progress' => PetReport::where('status', 'in_progress')->count(),
                    'resolved' => PetReport::where('status', 'resolved')->count(),
                    'last_7_days' => PetReport::where('created_at', '>=', $sevenDaysAgo)->count(),
                    'last_30_days' => PetReport::where('created_at', '>=', $thirtyDaysAgo)->count(),
                ],
                'adoptions' => [
                    'total_applications' => AdoptionApplication::count(),
                    'pending' => AdoptionApplication::where('status', 'pending')->count(),
                    'approved' => AdoptionApplication::where('status', 'approved')->count(),
                    'rejected' => AdoptionApplication::where('status', 'rejected')->count(),
                    'last_7_days' => AdoptionApplication::where('created_at', '>=', $sevenDaysAgo)->count(),
                ],
                'donations' => [
                    'total_cash_amount' => (float) Donation::where('type', 'cash')->where('status', 'verified')->sum('amount'),
                    'verified_cash_count' => Donation::where('type', 'cash')->where('status', 'verified')->count(),
                    'verified_inkind_count' => Donation::where('type', 'in-kind')->where('status', 'verified')->count(),
                    'last_7_days_cash_amount' => (float) Donation::where('type', 'cash')->where('status', 'verified')->where('created_at', '>=', $sevenDaysAgo)->sum('amount'),
                ],
                'volunteers' => [
                    'active_count' => User::where('role', Role::Volunteer->value)->count(),
                    'pending_applications' => VolunteerApplication::where('status', 'pending')->count(),
                    'approved_total' => VolunteerApplication::where('status', 'approved')->count(),
                ],
                'shelter_animals' => [
                    'total' => ShelterAnimal::count(),
                    'available' => ShelterAnimal::where('status', 'available')->count(),
                    'adopted' => ShelterAnimal::where('status', 'adopted')->count(),
                ],
            ],
        ]);
    }

    /**
     * Get database backup health and status for automated monitoring workflows.
     */
    public function backupStatus(Request $request): JsonResponse
    {
        $settings = SystemSetting::getValue('backup_settings', [
            'auto_enabled' => false,
            'interval' => 'daily',
            'retention_days' => 30,
        ]);

        $latestBackup = Backup::query()->latest('created_at')->first();
        $totalBackups = Backup::query()->count();

        $isHealthy = true;
        $healthMessage = 'Backup system is healthy.';

        if (! $latestBackup) {
            $isHealthy = false;
            $healthMessage = 'No backups found in the system.';
        } elseif ($latestBackup->status !== 'completed') {
            $isHealthy = false;
            $healthMessage = "Latest backup has status: {$latestBackup->status}";
        } else {
            // If automated backups are enabled and interval is daily, check if latest backup is older than 36h
            $ageHours = $latestBackup->created_at ? now()->diffInHours($latestBackup->created_at) : 999;
            $maxAgeAllowed = match ($settings['interval'] ?? 'daily') {
                'weekly' => 24 * 8,
                'monthly' => 24 * 32,
                default => 36,
            };

            if (($settings['auto_enabled'] ?? false) && $ageHours > $maxAgeAllowed) {
                $isHealthy = false;
                $healthMessage = "Latest backup is {$ageHours} hours old, which exceeds the threshold of {$maxAgeAllowed} hours.";
            }
        }

        return response()->json([
            'status' => $isHealthy ? 'healthy' : 'unhealthy',
            'timestamp' => now()->toIso8601String(),
            'is_healthy' => $isHealthy,
            'message' => $healthMessage,
            'settings' => [
                'auto_enabled' => (bool) ($settings['auto_enabled'] ?? false),
                'interval' => $settings['interval'] ?? 'daily',
                'retention_days' => (int) ($settings['retention_days'] ?? 30),
            ],
            'backups_summary' => [
                'total_count' => $totalBackups,
                'latest_backup' => $latestBackup ? [
                    'id' => $latestBackup->id,
                    'filename' => $latestBackup->filename,
                    'disk' => $latestBackup->disk,
                    'size_bytes' => $latestBackup->size,
                    'size_formatted' => $this->formatBytes($latestBackup->size ?? 0),
                    'status' => $latestBackup->status,
                    'created_at' => $latestBackup->created_at?->toIso8601String(),
                    'age_hours' => $latestBackup->created_at ? now()->diffInHours($latestBackup->created_at) : null,
                ] : null,
            ],
        ]);
    }

    /**
     * Get inventory items below threshold or expiring for automated supply alerts.
     */
    public function inventoryAlerts(Request $request): JsonResponse
    {
        $lowStockItems = InventoryItem::query()
            ->whereColumn('quantity', '<=', 'min_threshold')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'category' => $item->category,
                    'quantity' => $item->quantity,
                    'min_threshold' => $item->min_threshold,
                    'unit' => $item->unit,
                ];
            });

        $expiringBatches = InventoryBatch::query()
            ->with('item')
            ->where('expiry_date', '<=', now()->addDays(30))
            ->where('quantity', '>', 0)
            ->get()
            ->map(function ($batch) {
                return [
                    'id' => $batch->id,
                    'item_name' => $batch->item?->name ?? 'Unknown',
                    'batch_number' => $batch->batch_number,
                    'quantity' => $batch->quantity,
                    'expiry_date' => $batch->expiry_date?->toDateString(),
                    'days_until_expiry' => $batch->expiry_date ? (int) now()->diffInDays($batch->expiry_date, false) : 0,
                ];
            });

        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'has_alerts' => ($lowStockItems->isNotEmpty() || $expiringBatches->isNotEmpty()),
            'low_stock_count' => $lowStockItems->count(),
            'expiring_batches_count' => $expiringBatches->count(),
            'low_stock_items' => $lowStockItems,
            'expiring_batches' => $expiringBatches,
        ]);
    }

    /**
     * Get today's upcoming feeding routes and assigned volunteers for morning brief workflows.
     */
    public function upcomingFeeding(Request $request): JsonResponse
    {
        $dayOfWeek = now()->timezone('Asia/Manila')->format('l');

        $schedules = FeedingSchedule::query()
            ->with(['assignedTasks.user'])
            ->where('status', 'active')
            ->where(function ($q) use ($dayOfWeek) {
                $q->where('day', $dayOfWeek)
                    ->orWhere('day', 'Daily');
            })
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'zone' => $schedule->zone,
                    'time' => $schedule->time,
                    'day' => $schedule->day,
                    'strays_count' => $schedule->strays,
                    'volunteers_needed' => $schedule->volunteers,
                    'assigned_volunteers' => $schedule->assignedTasks->map(function ($task) {
                        return [
                            'user_id' => $task->user_id,
                            'name' => $task->user?->name ?? 'Volunteer',
                            'email' => $task->user?->email,
                            'role' => $task->role,
                            'status' => $task->status,
                        ];
                    }),
                ];
            });

        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'day' => $dayOfWeek,
            'total_routes' => $schedules->count(),
            'routes' => $schedules,
        ]);
    }

    /**
     * Handle external form submissions from n8n Form Triggers.
     */
    public function externalIntake(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:volunteer_inquiry,stray_sighting,corporate_sponsor_pledge'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'message' => ['nullable', 'string', 'max:5000'],
            'payload' => ['nullable', 'array'],
        ]);

        AuditLog::log('automation_form_intake', "Received external form intake ({$validated['type']}) from {$validated['name']} ({$validated['email']})");

        return response()->json([
            'status' => 'success',
            'message' => 'Form intake recorded successfully.',
            'intake_id' => (string) Str::uuid(),
            'recorded_at' => now()->toIso8601String(),
        ], 201);
    }

    /**
     * Helper to format bytes into readable units.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision).' '.$units[$pow];
    }
}
