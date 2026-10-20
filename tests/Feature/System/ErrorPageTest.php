<?php

use App\Enums\DonationStatus;
use App\Exceptions\InvalidDonationTransitionException;
use App\Models\Donation;
use App\Models\ShelterAnimal;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Routing\Exceptions\InvalidSignatureException;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    Route::get('/test-error/400', fn () => abort(400, 'Bad input parameters provided.'));
    Route::get('/test-error/401', fn () => abort(401, 'Please sign in to continue.'));
    Route::get('/test-error/403', fn () => abort(403, 'You are not allowed in this kennel.'));
    Route::get('/test-error/419', fn () => abort(419, 'Session expired.'));
    Route::get('/test-error/429', fn () => abort(429, 'Rate limit exceeded.'));
    Route::get('/test-error/404-custom', fn () => abort(404, 'Adoptable pet profile not found.'));
    Route::get('/test-error/500', fn () => abort(500, 'Internal server glitch.'));
    Route::get('/test-error/503', fn () => abort(503, 'Temporarily unavailable for checkup.'));
});

test('non-existent url renders 404 inertia error page with structured user guidance', function () {
    $this->get('/non-existent-page-random-xyz')
        ->assertStatus(404)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 404)
            ->where('message', null)
            ->has('whyItFailed')
            ->has('whyItHappened')
            ->has('whatToDo', 2)
        );
});

test('abort 404 with custom message renders 404 inertia error page with message and guidance', function () {
    $this->get('/test-error/404-custom')
        ->assertStatus(404)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 404)
            ->where('message', 'Adoptable pet profile not found.')
            ->where('whyItHappened', 'Adoptable pet profile not found.')
            ->has('whatToDo')
        );
});

test('eloquent model not found exception sanitizes technical class names into friendly pet message', function () {
    Route::get('/test-error/missing-pet', fn () => ShelterAnimal::query()->findOrFail(999999));

    $this->get('/test-error/missing-pet')
        ->assertStatus(404)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 404)
            ->where('message', fn (?string $message) => $message !== null
                && ! str_contains($message, 'App\\Models\\')
                && str_contains($message, 'pet profile')
            )
            ->where('whyItFailed', 'The pet profile you tried to view or update could not be found.')
        );
});

test('eloquent model not found exception on donation returns friendly donation explanation', function () {
    Route::get('/test-error/missing-donation', fn () => Donation::query()->findOrFail(999999));

    $this->get('/test-error/missing-donation')
        ->assertStatus(404)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 404)
            ->where('whyItFailed', 'The donation record or checkout session could not be loaded.')
        );
});

test('abort 403 renders 403 inertia error page with custom message', function () {
    $this->get('/test-error/403')
        ->assertStatus(403)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 403)
            ->where('message', 'You are not allowed in this kennel.')
            ->where('whyItHappened', 'You are not allowed in this kennel.')
        );
});

test('invalid signature exception renders 403 error page with clear verification link guidance', function () {
    Route::get('/test-error/invalid-signature', function () {
        throw new InvalidSignatureException;
    });

    $this->get('/test-error/invalid-signature')
        ->assertStatus(403)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 403)
            ->where('whyItFailed', 'The link you clicked could not be verified.')
            ->has('whatToDo', 2)
        );
});

test('abort 401 renders 401 inertia error page with custom message', function () {
    $this->get('/test-error/401')
        ->assertStatus(401)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 401)
            ->where('message', 'Please sign in to continue.')
        );
});

test('abort 419 renders 419 inertia error page on get request', function () {
    $this->get('/test-error/419')
        ->assertStatus(419)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 419)
            ->where('message', 'Session expired.')
            ->has('whatToDo')
        );
});

test('post form submission with 419 redirects back with flash error and toast to preserve form inputs', function () {
    Route::post('/test-error/419-submit', fn () => abort(419));

    $this->from('/sos')
        ->post('/test-error/419-submit', ['title' => 'Stray dog rescue needed'])
        ->assertRedirect('/sos')
        ->assertSessionHas('error')
        ->assertInertiaFlash('toast.type', 'warning');
});

test('post upload exceeding size limit 413 redirects back with friendly size guidance', function () {
    Route::post('/test-error/413-upload', function () {
        throw new PostTooLargeException('POST data is too large.');
    });

    $this->from('/adopt/1/apply')
        ->post('/test-error/413-upload', ['firstName' => 'Maria'])
        ->assertRedirect('/adopt/1/apply')
        ->assertSessionHas('error')
        ->assertInertiaFlash('toast.type', 'error')
        ->assertInertiaFlash('toast.title', 'Uploaded Files Are Too Large');
});

test('invalid donation transition exception redirects back with clear user explanation', function () {
    Route::post('/test-error/donation-transition', function () {
        throw InvalidDonationTransitionException::fromTransition(
            DonationStatus::Completed,
            DonationStatus::PendingPayment
        );
    });

    $this->from('/account/shelter-admin/Validations')
        ->post('/test-error/donation-transition')
        ->assertRedirect('/account/shelter-admin/Validations')
        ->assertSessionHas('error')
        ->assertInertiaFlash('toast.type', 'error')
        ->assertInertiaFlash('toast.title', 'Donation Status Update Blocked');
});

test('abort 429 renders 429 inertia error page and extracts retry after seconds when provided', function () {
    Route::get('/test-error/429-retry', function () {
        throw new ThrottleRequestsException('Too Many Attempts.', null, ['Retry-After' => 45]);
    });

    $this->get('/test-error/429')
        ->assertStatus(429)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 429)
            ->where('message', 'Rate limit exceeded.')
        );

    $this->get('/test-error/429-retry')
        ->assertStatus(429)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 429)
            ->where('retryAfterSeconds', 45)
        );
});

test('abort 503 renders 503 inertia error page with message', function () {
    $this->get('/test-error/503')
        ->assertStatus(503)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 503)
            ->where('message', 'Temporarily unavailable for checkup.')
        );
});

test('500 server error renders 500 inertia error page with reference code without leaking sensitive message when debug is disabled', function () {
    config(['app.debug' => false]);

    $this->get('/test-error/500')
        ->assertStatus(500)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 500)
            ->where('message', null)
            ->where('errorReference', fn (?string $ref) => $ref !== null && str_starts_with($ref, 'ERR-500-'))
            ->has('whyItFailed')
            ->has('whyItHappened')
            ->has('whatToDo')
        );
});

test('api routes return enriched json error responses with structured details and sanitized model messages', function () {
    Route::get('/api/test-missing-pet', fn () => ShelterAnimal::query()->findOrFail(999999));

    $this->getJson('/api/non-existent-endpoint')
        ->assertStatus(404)
        ->assertJsonStructure([
            'message',
            'error_details' => [
                'status',
                'why_it_failed',
                'why_it_happened',
                'what_to_do',
            ],
        ]);

    $response = $this->getJson('/api/test-missing-pet')->assertStatus(404);
    expect($response->json('message'))->not->toContain('App\\Models\\');
    expect($response->json('error_details.why_it_failed'))->toContain('pet profile');
});

test('unauthorized role access returns 403 inertia error page with friendly role message and authenticated user context', function () {
    $this->seed(RoleSeeder::class);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('account.super-admin.dashboard'))
        ->assertStatus(403)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 403)
            ->where('message', fn (?string $msg) => $msg !== null && ! str_contains($msg, 'right roles/permissions'))
            ->has('auth.user')
            ->where('auth.user.id', $user->id)
        );
});
