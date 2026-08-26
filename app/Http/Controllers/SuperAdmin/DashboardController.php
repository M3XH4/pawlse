<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Backup;
use App\Models\LoginAttempt;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the super-admin system overview.
     */
    public function index(Request $request): Response
    {
        // 1. Gather stats
        $totalUsers = User::withTrashed()->count();
        $totalAdmins = User::where('role', Role::Admin->value)->count();
        $totalVolunteers = User::where('role', Role::Volunteer->value)->count();
        $totalAuditLogs = AuditLog::count();
        $backupsCount = Backup::where('status', 'completed')->count();

        // Recent security alarms (suspicious logins in last 24 hours)
        $recentAlarms = LoginAttempt::where('is_suspicious', true)
            ->where('created_at', '>=', now()->subDay())
            ->count();

        // Database size calculation
        $dbSize = 0;
        $connection = config('database.default');
        try {
            if ($connection === 'sqlite') {
                $dbPath = config('database.connections.sqlite.database');
                if (file_exists($dbPath)) {
                    $dbSize = filesize($dbPath);
                }
            } elseif ($connection === 'mysql') {
                $dbName = config('database.connections.mysql.database');
                $sizeResult = DB::select('
                    SELECT SUM(data_length + index_length) AS size 
                    FROM information_schema.TABLES 
                    WHERE table_schema = ?
                ', [$dbName]);
                $dbSize = $sizeResult[0]->size ?? 0;
            }
        } catch (\Exception $e) {
            // Fallback to 0 if db access fails
        }

        // Format db size in human readable format
        $dbSizeFormatted = $this->formatBytes($dbSize);

        // 2. Fetch latest audit logs with users
        $recentActivities = AuditLog::with('user')
            ->latest()
            ->limit(6)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user_name' => $log->user ? $log->user->name : 'System / Guest',
                    'action' => $log->action,
                    'description' => $log->description,
                    'time' => $log->created_at->diffForHumans(),
                    'ip_address' => $log->ip_address,
                ];
            });

        return Inertia::render('super-admin/dashboard', [
            'stats' => [
                'total_users' => $totalUsers,
                'total_admins' => $totalAdmins,
                'total_volunteers' => $totalVolunteers,
                'total_audit_logs' => $totalAuditLogs,
                'backups_count' => $backupsCount,
                'recent_alarms' => $recentAlarms,
                'database_size' => $dbSizeFormatted,
            ],
            'recentActivities' => $recentActivities,
        ]);
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
