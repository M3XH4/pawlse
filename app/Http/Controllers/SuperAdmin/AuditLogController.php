<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    /**
     * Display the audit trail.
     */
    public function index(Request $request): Response
    {
        $query = AuditLog::with('user');

        // Search action, description, ip_address, user name, or user email
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uQ) use ($search) {
                        $uQ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                if (stripos('system', $search) !== false || stripos('guest', $search) !== false) {
                    $q->orWhereNull('user_id');
                }
            });
        }

        // Filter by Role
        if ($role = $request->input('role')) {
            if ($role === 'system') {
                $query->whereNull('user_id');
            } else {
                $query->whereHas('user', function ($q) use ($role) {
                    $q->where('role', $role);
                });
            }
        }

        // Filter by specific User
        if ($userId = $request->input('user_id')) {
            if ($userId === 'system') {
                $query->whereNull('user_id');
            } else {
                $query->where('user_id', $userId);
            }
        }

        // Filter by Action Type
        if ($action = $request->input('action')) {
            $query->where('action', $action);
        }

        // Filter by Date Range
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        // Pagination
        $logs = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(function ($log) {
                return [
                    'id' => $log->id,
                    'user_name' => $log->user ? $log->user->name : 'System / Guest',
                    'user_role' => $log->user ? $log->user->role : 'system',
                    'action' => $log->action,
                    'description' => $log->description,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $log->user_agent,
                    'created_at' => $log->created_at->toDateTimeString(),
                ];
            });

        // Get users list for dropdown (all with logs or administrative roles)
        $users = User::whereHas('auditLogs')
            ->orWhereIn('role', ['admin', 'super-admin'])
            ->select('id', 'name', 'role')
            ->orderBy('name')
            ->get();

        // Get unique recorded actions
        $actions = AuditLog::select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        // Calculate Stats
        $totalLogs = AuditLog::count();
        $uniqueUsers = AuditLog::whereNotNull('user_id')->distinct('user_id')->count('user_id');
        $systemLogs = AuditLog::whereNull('user_id')->count();

        return Inertia::render('super-admin/audit-logs', [
            'logs' => $logs,
            'users' => $users,
            'actions' => $actions,
            'filters' => $request->only(['search', 'role', 'user_id', 'action', 'date_from', 'date_to']),
            'stats' => [
                'total_logs' => $totalLogs,
                'unique_users' => $uniqueUsers,
                'system_logs' => $systemLogs,
            ],
        ]);
    }
}
