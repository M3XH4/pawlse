<?php

namespace App\Support;

use App\Exceptions\InvalidDonationTransitionException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Routing\Exceptions\InvalidSignatureException;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Spatie\Permission\Exceptions\UnauthorizedException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class UserFriendlyErrorResolver
{
    /**
     * Resolve user-friendly error details answering:
     * 1. Why it did not go through (whyItFailed)
     * 2. Why it happened (whyItHappened)
     * 3. What the user should do (whatToDo)
     *
     * @return array{
     *     status: int,
     *     message: string|null,
     *     whyItFailed: string,
     *     whyItHappened: string,
     *     whatToDo: list<string>,
     *     errorReference: string|null,
     *     retryAfterSeconds: int|null
     * }
     */
    public static function resolveForErrorPage(
        int $status,
        ?Throwable $exception = null,
        ?Request $request = null,
        ?Response $response = null,
    ): array {
        $raw = $exception instanceof HttpExceptionInterface ? trim($exception->getMessage()) : '';
        $retryAfterSeconds = self::extractRetryAfterSeconds($exception, $response);
        $modelNotFound = self::extractModelNotFound($exception, $raw);

        if ($modelNotFound !== null && $status === 404) {
            return self::resolveModelNotFoundDetails($modelNotFound);
        }

        if ($status === 403 && self::isInvalidSignature($exception, $raw)) {
            return [
                'status' => 403,
                'message' => 'This verification or security link has expired or is no longer valid.',
                'whyItFailed' => 'The link you clicked could not be verified.',
                'whyItHappened' => 'Security and verification links expire after a set time or become invalid once they have already been used.',
                'whatToDo' => [
                    'Sign in to your account and request a new verification or action link.',
                    'Check your email inbox for the most recent message from PAWLSE and use that link instead.',
                ],
                'errorReference' => null,
                'retryAfterSeconds' => null,
            ];
        }

        if ($status === 403 && self::isDefaultAuthorizationMessage($exception, $raw)) {
            $friendlyMessage = $raw !== '' && ! self::isTechnicalPermissionMessage($raw)
                ? $raw
                : 'Your current account role does not have permission to open this page or perform this action.';

            return [
                'status' => 403,
                'message' => $friendlyMessage,
                'whyItFailed' => 'Access to this page or action was restricted.',
                'whyItHappened' => 'This section requires specific staff, administrator, or approved volunteer permissions that are not active on your account right now.',
                'whatToDo' => [
                    'Return to your main dashboard to access features available for your account role.',
                    'If you are an approved volunteer, make sure you have switched into Volunteer Mode from your dashboard.',
                    'If you believe you should have access, contact an administrator via the Help Desk.',
                ],
                'errorReference' => null,
                'retryAfterSeconds' => null,
            ];
        }

        $message = self::resolveCleanMessage($status, $exception, $raw);
        $errorReference = null;

        if ($status >= 500 && $status !== 503) {
            $errorReference = 'ERR-'.$status.'-'.Str::upper(Str::random(6));
            rescue(function () use ($errorReference, $exception, $request, $status): void {
                Log::error("User encountered HTTP {$status} error [{$errorReference}]", [
                    'error_reference' => $errorReference,
                    'status' => $status,
                    'url' => $request?->fullUrl(),
                    'method' => $request?->method(),
                    'user_id' => $request?->user()?->id,
                    'exception_class' => $exception ? $exception::class : null,
                    'exception_message' => $exception?->getMessage(),
                ]);
            }, report: false);
        }

        $guidance = self::statusGuidance($status, $message, $retryAfterSeconds, $errorReference, $exception);

        return [
            'status' => $status,
            'message' => $message,
            'whyItFailed' => $guidance['whyItFailed'],
            'whyItHappened' => $guidance['whyItHappened'],
            'whatToDo' => $guidance['whatToDo'],
            'errorReference' => $errorReference,
            'retryAfterSeconds' => $retryAfterSeconds,
        ];
    }

    /**
     * Resolve a user-friendly message for mutating requests that can safely redirect back
     * without losing the user's form inputs (e.g., 419 CSRF expiration, 413 payload too large,
     * 429 rate limit on form submit, or domain transition exceptions).
     *
     * @return array{title: string, message: string, description: string, type: 'error'|'warning'}
     */
    public static function resolveRedirectBackFeedback(
        int $status,
        ?Throwable $exception = null,
        ?Response $response = null,
    ): array {
        if ($exception instanceof InvalidDonationTransitionException) {
            $msg = $exception->getUserFriendlyMessage();

            return [
                'type' => 'error',
                'title' => 'Donation Status Update Blocked',
                'message' => $msg,
                'description' => $msg,
            ];
        }

        if ($status === 419 || $exception instanceof TokenMismatchException) {
            $msg = 'Your security session expired while the page was open. Your form could not be submitted—please review your entries and submit again.';

            return [
                'type' => 'warning',
                'title' => 'Session Expired — Please Submit Again',
                'message' => $msg,
                'description' => 'Your security token timed out due to inactivity. Simply click submit again to complete your request.',
            ];
        }

        if ($status === 413 || $exception instanceof PostTooLargeException) {
            $msg = 'Your upload could not go through because the attached files exceed the maximum size limit. Please select smaller photos (under 8 MB each) or upload fewer files and try again.';

            return [
                'type' => 'error',
                'title' => 'Uploaded Files Are Too Large',
                'message' => $msg,
                'description' => 'The total size of your photos or documents exceeded the server limit. Choose smaller images or fewer files and resubmit.',
            ];
        }

        if ($status === 429 || $exception instanceof ThrottleRequestsException) {
            $retryAfter = self::extractRetryAfterSeconds($exception, $response);
            $waitText = $retryAfter ? "Please wait {$retryAfter} seconds" : 'Please wait a moment';
            $msg = "Your request did not go through because too many attempts were made in a short time. {$waitText} before submitting again.";

            return [
                'type' => 'warning',
                'title' => 'Too Many Attempts — Please Wait',
                'message' => $msg,
                'description' => "{$waitText} and avoid clicking the submit button multiple times.",
            ];
        }

        return [
            'type' => 'error',
            'title' => 'Request Could Not Be Completed',
            'message' => 'Your request did not go through due to an unexpected issue. Please check your entries and try again.',
            'description' => 'Please review your inputs and try submitting again.',
        ];
    }

    /**
     * Normalize any session flash message ('error', 'success', 'warning', 'info') or toast payload
     * so the user gets clear, structured feedback explaining what happened and what to do.
     *
     * @return array{type: 'success'|'error'|'warning'|'info', title: string, message: string, description?: string}
     */
    public static function normalizeToast(mixed $payload, string $defaultType = 'info'): array
    {
        if (is_array($payload)) {
            $type = in_array($payload['type'] ?? '', ['success', 'error', 'warning', 'info'], true)
                ? $payload['type']
                : $defaultType;
            $message = trim((string) ($payload['message'] ?? $payload['description'] ?? $payload['title'] ?? ''));
            $title = isset($payload['title']) && is_string($payload['title']) && trim($payload['title']) !== ''
                ? trim($payload['title'])
                : null;
            $description = isset($payload['description']) && is_string($payload['description']) && trim($payload['description']) !== ''
                ? trim($payload['description'])
                : null;

            if ($title !== null && $description !== null) {
                return [
                    'type' => $type,
                    'title' => $title,
                    'message' => $message !== '' ? $message : $description,
                    'description' => $description,
                ];
            }

            return self::enrichSingleMessage($message, $type, $title);
        }

        return self::enrichSingleMessage(trim((string) $payload), $defaultType);
    }

    /**
     * Enrich a JSON error response with structured, user-friendly diagnostic details
     * while preserving top-level keys (`message`, `errors`, `error`) for backward compatibility.
     *
     * @param  array<string, mixed>  $originalData
     * @return array<string, mixed>
     */
    public static function enrichJsonErrorPayload(
        int $status,
        ?Throwable $exception,
        Request $request,
        Response $response,
        array $originalData,
    ): array {
        $details = self::resolveForErrorPage($status, $exception, $request, $response);

        // Sanitize leaked internal model class names or SQL errors in top-level message
        $currentMessage = isset($originalData['message']) && is_string($originalData['message'])
            ? $originalData['message']
            : '';

        if ($status === 404 && str_starts_with($currentMessage, 'No query results for model')) {
            $originalData['message'] = $details['message'] ?? 'The requested record could not be found.';
        } elseif ($status >= 500 && ! config('app.debug') && ($exception instanceof QueryException || str_contains($currentMessage, 'SQLSTATE'))) {
            $originalData['message'] = 'An unexpected server error occurred. Please try again shortly.';
        } elseif ($originalData['message'] === null || $originalData['message'] === '') {
            $originalData['message'] = $details['message'] ?? $details['whyItFailed'];
        }

        if (! isset($originalData['error_details'])) {
            $originalData['error_details'] = [
                'status' => $details['status'],
                'why_it_failed' => $details['whyItFailed'],
                'why_it_happened' => $details['whyItHappened'],
                'what_to_do' => $details['whatToDo'],
                'error_reference' => $details['errorReference'],
            ];
        }

        return $originalData;
    }

    private static function resolveCleanMessage(int $status, ?Throwable $exception, string $raw): ?string
    {
        if ($status === 500) {
            return null;
        }

        if ($status === 404) {
            if ($raw === '' || (str_starts_with($raw, 'The route ') && str_contains($raw, 'could not be found'))) {
                return null;
            }
        }

        if ($raw !== '') {
            return $raw;
        }

        if ($exception instanceof AuthenticationException) {
            return 'Please sign in to your account to continue.';
        }

        if ($exception instanceof AuthorizationException) {
            $msg = trim($exception->getMessage());

            return ($msg !== '' && $msg !== 'This action is unauthorized.')
                ? $msg
                : 'You do not have permission to perform this action.';
        }

        return null;
    }

    /**
     * @return array{whyItFailed: string, whyItHappened: string, whatToDo: list<string>}
     */
    private static function statusGuidance(
        int $status,
        ?string $customMessage,
        ?int $retryAfterSeconds,
        ?string $errorReference,
        ?Throwable $exception = null,
    ): array {
        return match ($status) {
            400 => [
                'whyItFailed' => 'Your request could not be processed by the server.',
                'whyItHappened' => $customMessage
                    ?: 'Some of the information or parameters in the link or form were incomplete, malformed, or out of date.',
                'whatToDo' => [
                    'Go back to the previous page and double-check the information you entered.',
                    'If you clicked an external or bookmarked link, try navigating from the PAWLSE homepage instead.',
                ],
            ],
            401 => [
                'whyItFailed' => 'This page or action requires you to be signed in.',
                'whyItHappened' => 'You are currently browsing as a guest, or your login session has ended.',
                'whatToDo' => [
                    'Click "Sign In Now" below to log in with your PAWLSE account.',
                    'If you do not have an account yet, you can register for free on the sign-in page.',
                ],
            ],
            403 => [
                'whyItFailed' => 'You could not open this page or complete this action because access is restricted.',
                'whyItHappened' => $customMessage
                    ?: 'Your current account does not have the required role or permission for this area.',
                'whatToDo' => [
                    'Return to your dashboard or the homepage to use features available to your account.',
                    'If you are an approved volunteer or foster parent, check that you are signed into the right account.',
                    'Need access? Reach out to our team through the Help Desk.',
                ],
            ],
            404 => [
                'whyItFailed' => 'We could not find the page or record you were looking for.',
                'whyItHappened' => $customMessage
                    ?: 'The link may have a typo, the page may have moved, or the item may have been removed.',
                'whatToDo' => [
                    'Check the web address (URL) for any spelling mistakes.',
                    'Use the "Go Back" button or the quick links below to find adoptable pets, rescue reports, or events.',
                ],
            ],
            405 => [
                'whyItFailed' => 'This action link cannot be opened directly in your browser.',
                'whyItHappened' => 'You visited or refreshed an address that only accepts form submissions or button clicks.',
                'whatToDo' => [
                    'Click "Go Back" to return to the previous page and use the form or button provided there.',
                    'Return to the homepage if you were trying to browse the site.',
                ],
            ],
            408 => [
                'whyItFailed' => 'Your request took too long and timed out before finishing.',
                'whyItHappened' => 'A slow internet connection or large file upload prevented the server from receiving your request in time.',
                'whatToDo' => [
                    'Check your internet connection and click "Try Again".',
                    'If you were uploading photos, try uploading fewer or smaller images at once.',
                ],
            ],
            413 => [
                'whyItFailed' => 'Your upload could not go through because the files are too large.',
                'whyItHappened' => 'The photos or documents you attached exceed the maximum upload size limit allowed by the server.',
                'whatToDo' => [
                    'Click "Go Back" and select smaller image files (under 8 MB per photo).',
                    'Try uploading fewer photos at once or compressing high-resolution camera photos.',
                ],
            ],
            419 => [
                'whyItFailed' => 'Your form or action did not go through because your security session expired.',
                'whyItHappened' => 'The page was left open without activity for a while, or your login state changed in another tab.',
                'whatToDo' => [
                    'Click "Try Again" or refresh the page to renew your security session.',
                    'Go back, review your form information, and submit your request again.',
                ],
            ],
            422 => [
                'whyItFailed' => 'Your submission could not be saved because some details need attention.',
                'whyItHappened' => $customMessage
                    ?: 'One or more required fields were missing or did not match the expected format.',
                'whatToDo' => [
                    'Click "Go Back" to return to your form.',
                    'Review the highlighted fields and follow the instructions next to each input before submitting again.',
                ],
            ],
            429 => [
                'whyItFailed' => 'Your request was temporarily paused due to too many rapid attempts.',
                'whyItHappened' => 'To keep PAWLSE fast and secure for animal emergencies, our system limits how quickly requests can be sent in a row.',
                'whatToDo' => [
                    $retryAfterSeconds
                        ? "Wait about {$retryAfterSeconds} seconds before clicking \"Try Again\"."
                        : 'Wait 30 to 60 seconds before trying your action again.',
                    'Avoid clicking submit or refresh buttons repeatedly while a request is loading.',
                ],
            ],
            503 => [
                'whyItFailed' => 'PAWLSE is temporarily unavailable and cannot process your request right now.',
                'whyItHappened' => $customMessage
                    ?: 'We are performing scheduled maintenance or a quick system health checkup.',
                'whatToDo' => [
                    'Wait a few minutes and click "Try Again" to see if we are back online.',
                    'For urgent stray rescue or animal emergencies, call our hotline directly at 09123456789.',
                ],
            ],
            default => [
                'whyItFailed' => 'Your request could not be completed due to an unexpected server error.',
                'whyItHappened' => $exception instanceof QueryException
                    ? 'A temporary database issue prevented us from saving or loading the requested information.'
                    : 'Something unexpected went wrong on our end while processing your request—this was not caused by anything you did.',
                'whatToDo' => array_values(array_filter([
                    'Wait a moment and click "Try Again" to reload the page.',
                    'If you were submitting a form, go back and check your dashboard first to see if it already went through.',
                    $errorReference
                        ? "If this keeps happening, please contact Support or the Help Desk and mention reference code {$errorReference}."
                        : 'If this keeps happening, please reach out to our team via Support or the Help Desk.',
                ])),
            ],
        };
    }

    private static function extractModelNotFound(?Throwable $exception, string $raw): ?string
    {
        if ($exception instanceof ModelNotFoundException) {
            return class_basename($exception->getModel());
        }

        if ($exception?->getPrevious() instanceof ModelNotFoundException) {
            return class_basename($exception->getPrevious()->getModel());
        }

        if (preg_match('/No query results for model \[([^\]]+)\]/i', $raw, $matches)) {
            return class_basename($matches[1]);
        }

        return null;
    }

    /**
     * @return array{
     *     status: int,
     *     message: string,
     *     whyItFailed: string,
     *     whyItHappened: string,
     *     whatToDo: list<string>,
     *     errorReference: null,
     *     retryAfterSeconds: null
     * }
     */
    private static function resolveModelNotFoundDetails(string $modelBasename): array
    {
        [$message, $whyItFailed, $whyItHappened, $whatToDo] = match ($modelBasename) {
            'ShelterAnimal' => [
                "We couldn't find that pet profile. The pet may have already been adopted or removed from our listings.",
                'The pet profile you tried to view or update could not be found.',
                'This animal may have already found a forever home, been transferred, or the profile link is outdated.',
                [
                    'Visit the Adopt Pets page to browse animals currently available for adoption.',
                    'If you bookmarked this pet earlier, refresh the adoption gallery to see updated listings.',
                ],
            ],
            'Donation', 'Payment', 'FeedingSponsorship', 'InKindDonation' => [
                "We couldn't find a donation matching that reference number. Please double-check your reference code.",
                'The donation record or checkout session could not be loaded.',
                'The donation reference code in the link may have a typo, or the record was removed.',
                [
                    'Check your donation receipt or confirmation email for the exact reference code (e.g., DON-...).',
                    'Visit your Donations dashboard if you were signed in when making the donation.',
                ],
            ],
            'BlogPost' => [
                "We couldn't find that story or article. It may have been unpublished or moved.",
                'The community story or blog article could not be opened.',
                'The author or an administrator may have unpublished, updated, or removed this post.',
                [
                    'Browse our Community Stories & Blog page to read other rescue and adoption updates.',
                    'If this is your own story, check its review status in your Stories dashboard.',
                ],
            ],
            'Event', 'FeedingSchedule' => [
                "We couldn't find that community event or feeding schedule.",
                'The event or feeding route you selected could not be found.',
                'The activity may have already concluded, been rescheduled, or been removed by coordinators.',
                [
                    'Visit the Events & Feeding Schedules page to see currently open activities.',
                    'Check your Joined Events or Assigned Tasks tab for your active schedules.',
                ],
            ],
            'PetReport' => [
                "We couldn't find that rescue, SOS, or missing pet report.",
                'The pet report you requested could not be loaded.',
                'The report may have already been resolved, merged as a duplicate, or archived.',
                [
                    'Check the Lost & Found or Rescue Reports dashboard for active reports.',
                    'If you need to report a new animal emergency, use the Report SOS page.',
                ],
            ],
            'AdoptionApplication' => [
                "We couldn't find that adoption application record.",
                'The adoption application could not be opened.',
                'The application ID may be invalid, or the record was archived.',
                [
                    'Open your Adoption Applications dashboard to view your active submissions.',
                ],
            ],
            'HelpDeskTicket' => [
                "We couldn't find that Help Desk support ticket.",
                'The support ticket you tried to view or reply to could not be found.',
                'The ticket number may be incorrect, or the ticket was removed.',
                [
                    'Return to the Help Desk page to view your open and resolved support tickets.',
                ],
            ],
            default => [
                'The record you are looking for could not be found. It may have been moved, archived, or deleted.',
                'The item or record requested in this action could not be found in our database.',
                'It may have recently been deleted or archived in another tab, or the link is outdated.',
                [
                    'Click "Go Back" and refresh the list before trying your action again.',
                    'Return to your dashboard or the homepage to continue browsing.',
                ],
            ],
        };

        return [
            'status' => 404,
            'message' => $message,
            'whyItFailed' => $whyItFailed,
            'whyItHappened' => $whyItHappened,
            'whatToDo' => $whatToDo,
            'errorReference' => null,
            'retryAfterSeconds' => null,
        ];
    }

    private static function isInvalidSignature(?Throwable $exception, string $raw): bool
    {
        if ($exception instanceof InvalidSignatureException || $exception?->getPrevious() instanceof InvalidSignatureException) {
            return true;
        }

        return str_contains(strtolower($raw), 'invalid signature');
    }

    private static function isDefaultAuthorizationMessage(?Throwable $exception, string $raw): bool
    {
        if ($exception instanceof UnauthorizedException || $exception?->getPrevious() instanceof UnauthorizedException) {
            return true;
        }

        return self::isTechnicalPermissionMessage($raw);
    }

    private static function isTechnicalPermissionMessage(string $raw): bool
    {
        $normalized = strtolower(trim($raw));

        return in_array($normalized, [
            'user does not have the right roles.',
            'user does not have the right permissions.',
            'user does not have any of the necessary access rights.',
            'user is not logged in.',
            'this action is unauthorized.',
            'unauthorized.',
            'unauthorized',
        ], true);
    }

    private static function extractRetryAfterSeconds(?Throwable $exception, ?Response $response): ?int
    {
        $retryAfter = $response?->headers->get('Retry-After');

        if ($retryAfter === null && $exception instanceof HttpExceptionInterface) {
            $headers = $exception->getHeaders();
            $retryAfter = $headers['Retry-After'] ?? $headers['retry-after'] ?? null;
        }

        if (is_numeric($retryAfter) && (int) $retryAfter > 0) {
            return (int) $retryAfter;
        }

        return null;
    }

    /**
     * @return array{type: 'success'|'error'|'warning'|'info', title: string, message: string, description?: string}
     */
    private static function enrichSingleMessage(string $message, string $type, ?string $explicitTitle = null): array
    {
        $validType = in_array($type, ['success', 'error', 'warning', 'info'], true) ? $type : 'info';

        if ($message === '') {
            $defaultTitle = match ($validType) {
                'success' => 'Action Completed',
                'error' => 'Action Could Not Be Completed',
                'warning' => 'Attention Needed',
                default => 'Notice',
            };

            return [
                'type' => $validType,
                'title' => $explicitTitle ?? $defaultTitle,
                'message' => $explicitTitle ?? $defaultTitle,
            ];
        }

        // Enhance common error patterns with clear "Why & What to do" guidance if not already present
        if ($validType === 'error' || $validType === 'warning') {
            $lower = strtolower($message);

            if (str_contains($lower, 'security session expired')) {
                return [
                    'type' => 'warning',
                    'title' => $explicitTitle ?? 'Security Session Expired',
                    'message' => $message,
                    'description' => 'Your page was inactive for a while, so your request did not go through. Please review your form and submit again.',
                ];
            }

            if (str_contains($lower, 'payment was cancelled or failed')) {
                return [
                    'type' => 'error',
                    'title' => $explicitTitle ?? 'Payment Did Not Go Through',
                    'message' => $message,
                    'description' => 'The payment gateway reported a cancellation or failure. You can try again or upload a manual payment receipt on the checkout page.',
                ];
            }

            if (str_contains($lower, 'cannot delete default system role')) {
                return [
                    'type' => 'error',
                    'title' => $explicitTitle ?? 'System Role Protected',
                    'message' => $message,
                    'description' => 'Default PAWLSE roles are required for platform security. You can edit custom roles or adjust user assignments instead.',
                ];
            }

            if (str_contains($lower, 'because it is assigned to users')) {
                return [
                    'type' => 'error',
                    'title' => $explicitTitle ?? 'Role Currently In Use',
                    'message' => $message,
                    'description' => 'Reassign the users currently holding this role to another role first, then try deleting it again.',
                ];
            }

            if (str_contains($lower, 'cannot delete yourself')) {
                return [
                    'type' => 'error',
                    'title' => $explicitTitle ?? 'Cannot Archive Active Account',
                    'message' => $message,
                    'description' => 'You cannot archive the account you are currently signed in with. Ask another Super Admin if this account needs to be removed.',
                ];
            }

            if (str_starts_with($lower, 'backup failed:') || str_starts_with($lower, 'restoration failed:')) {
                return [
                    'type' => 'error',
                    'title' => $explicitTitle ?? 'Database Backup Operation Failed',
                    'message' => $message,
                    'description' => 'Check that the storage disk has sufficient free space and write permissions, then try running the operation again.',
                ];
            }
        }

        $defaultTitle = match ($validType) {
            'success' => 'Completed Successfully',
            'error' => 'Action Could Not Be Completed',
            'warning' => 'Attention Needed',
            default => 'Notice',
        };

        return [
            'type' => $validType,
            'title' => $explicitTitle ?? $defaultTitle,
            'message' => $message,
            'description' => $message,
        ];
    }
}
