<?php

use App\Exceptions\InvalidDonationTransitionException;
use App\Http\Middleware\CheckMaintenanceMode;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\VerifyAutomationApiKey;
use App\Support\UserFriendlyErrorResolver;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpFoundation\Response;

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
            if ($exception instanceof InvalidDonationTransitionException) {
                $feedback = UserFriendlyErrorResolver::resolveRedirectBackFeedback(422, $exception, $response);

                if ($request->expectsJson() || $request->is('api/*', 'webhooks/*')) {
                    return response()->json([
                        'message' => $feedback['message'],
                        'error_details' => [
                            'status' => 422,
                            'why_it_failed' => 'The donation status could not be updated.',
                            'why_it_happened' => $exception->getMessage(),
                            'what_to_do' => [
                                'Refresh the page to check the latest donation status.',
                                'Follow the required verification steps in order.',
                            ],
                            'error_reference' => null,
                        ],
                    ], 422);
                }

                Inertia::flash('toast', $feedback);

                return back()->with([
                    'error' => $feedback['message'],
                    'toast' => $feedback,
                ]);
            }

            $status = $response->getStatusCode();

            if ($request->expectsJson() || $request->is('api/*', 'webhooks/*')) {
                if ($response instanceof JsonResponse && $status >= 400 && $status !== 422) {
                    $data = $response->getData(true);
                    if (is_array($data)) {
                        $response->setData(
                            UserFriendlyErrorResolver::enrichJsonErrorPayload($status, $exception, $request, $response, $data)
                        );
                    }
                }

                return $response;
            }

            if ($status === 500 && config('app.debug')) {
                return $response;
            }

            if (in_array($status, [413, 419], true) && in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
                $feedback = UserFriendlyErrorResolver::resolveRedirectBackFeedback($status, $exception, $response);

                Inertia::flash('toast', $feedback);

                return back()
                    ->withInput($request->except(['password', 'password_confirmation', 'current_password']))
                    ->with([
                        'error' => $feedback['message'],
                        'toast' => $feedback,
                    ]);
            }

            if (in_array($status, [400, 401, 403, 404, 405, 408, 413, 419, 422, 429, 500, 503], true)) {
                $details = UserFriendlyErrorResolver::resolveForErrorPage($status, $exception, $request, $response);

                return Inertia::render('error', $details)
                    ->toResponse($request)
                    ->setStatusCode($status);
            }

            return $response;
        });
    })->create();
