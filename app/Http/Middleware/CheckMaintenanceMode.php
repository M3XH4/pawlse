<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $settings = SystemSetting::getValue('system_settings', []);
        $isMaintenance = (bool) ($settings['maintenance_mode'] ?? false);

        if (! $isMaintenance) {
            return $next($request);
        }

        // Always allow health checks
        if ($request->is('up')) {
            return $next($request);
        }

        // Allow static assets
        if ($request->is('storage/*', 'build/*', 'assets/*', 'favicon.ico', 'apple-touch-icon.png')) {
            return $next($request);
        }

        // Allow auth routes so administrators can sign in
        if ($request->is(
            'login',
            'logout',
            'two-factor-challenge',
            'two-factor-challenge/*',
            'user/confirm-password',
            'forgot-password',
            'reset-password',
            'reset-password/*'
        )) {
            return $next($request);
        }

        // Allow administrator dashboard route prefixes (auth middleware will handle unauthenticated redirects)
        if ($request->is('account/super-admin*', 'account/admin*')) {
            return $next($request);
        }

        // Allow authenticated staff with admin or super-admin role to access all areas
        $user = $request->user();
        if ($user && method_exists($user, 'hasRole') && $user->hasRole(['super-admin', 'admin'])) {
            return $next($request);
        }

        $appName = $settings['app_name'] ?? config('app.name', 'PAWLSE');
        $maintenanceMessage = $settings['maintenance_message'] ?? 'PAWLSE is currently taking a short paws for scheduled system maintenance. We are working hard to bring everything back as quickly as possible!';
        $contactEmail = $settings['contact_email'] ?? 'support@pawlse.test';
        $contactPhone = $settings['contact_phone'] ?? '09123456789';

        // For API and JSON requests
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => $maintenanceMessage,
                'maintenance_mode' => true,
                'contact_email' => $contactEmail,
                'contact_phone' => $contactPhone,
            ], 503);
        }

        // Render dedicated maintenance page with 503 status
        return Inertia::render('maintenance', [
            'appName' => $appName,
            'message' => $maintenanceMessage,
            'contactEmail' => $contactEmail,
            'contactPhone' => $contactPhone,
        ])->toResponse($request)->setStatusCode(503);
    }
}
