<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\LoginAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SecurityController extends Controller
{
    /**
     * Display the security and login logs.
     */
    public function index(Request $request): Response
    {
        $query = LoginAttempt::with('user');

        // Search by email or IP
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        // Filter by Status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by Suspicious
        if ($request->has('suspicious')) {
            $suspicious = $request->boolean('suspicious');
            if ($suspicious) {
                $query->where('is_suspicious', true);
            }
        }

        // Pagination
        $logs = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(function ($log) {
                return [
                    'id' => $log->id,
                    'user_name' => $log->user ? $log->user->name : null,
                    'email' => $log->email,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $log->user_agent,
                    'status' => $log->status,
                    'is_suspicious' => $log->is_suspicious,
                    'created_at' => $log->created_at->toDateTimeString(),
                ];
            });

        // Compute stats
        $stats = [
            'success_count' => LoginAttempt::where('status', 'success')->count(),
            'failed_count' => LoginAttempt::where('status', 'failed')->count(),
            'suspicious_count' => LoginAttempt::where('is_suspicious', true)->count(),
            'unique_ips' => LoginAttempt::distinct('ip_address')->count('ip_address'),
        ];

        return Inertia::render('super-admin/security-access', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'status', 'suspicious']),
            'stats' => $stats,
        ]);
    }
}
