<?php

use App\Http\Middleware\CheckMaintenanceMode;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\VerifyAutomationApiKey;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->validateCsrfTokens(except: ['webhooks/*']);

        $middleware->alias([
            'permission' => PermissionMiddleware::class,
            'role' => RoleMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
            'automation.auth' => VerifyAutomationApiKey::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            CheckMaintenanceMode::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->api(prepend: [
            CheckMaintenanceMode::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request): Response {
            $status = $response->getStatusCode();

            if ($request->expectsJson() || $request->is('api/*', 'webhooks/*')) {
                return $response;
            }

            if ($status === 500 && config('app.debug')) {
                return $response;
            }

            if ($status === 419 && in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
                return back()->with([
                    'error' => 'Your security session expired. Please submit your request again.',
                ]);
            }

            if (in_array($status, [400, 401, 403, 404, 419, 429, 500, 503])) {
                $message = null;
                if ($exception instanceof HttpExceptionInterface) {
                    $raw = $exception->getMessage();
                    if ($status === 404 && (empty($raw) || (str_starts_with($raw, 'The route ') && str_contains($raw, 'could not be found')))) {
                        $message = null;
                    } elseif ($status !== 500 && ! empty($raw)) {
                        $message = $raw;
                    }
                }

                return Inertia::render('error', [
                    'status' => $status,
                    'message' => $message,
                ])->toResponse($request)->setStatusCode($status);
            }

            return $response;
        });
    })->create();
