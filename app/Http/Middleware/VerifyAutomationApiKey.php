<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyAutomationApiKey
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $expectedKey = (string) config('n8n.api_key', '');

        if (empty($expectedKey)) {
            return response()->json([
                'error' => 'Automation API is not configured or disabled.',
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        $providedKey = $request->header('X-Automation-Key');

        if (! $providedKey && $request->bearerToken()) {
            $providedKey = $request->bearerToken();
        }

        if (empty($providedKey) || ! hash_equals($expectedKey, (string) $providedKey)) {
            return response()->json([
                'error' => 'Unauthorized: Invalid or missing automation API key.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $next($request);
    }
}
