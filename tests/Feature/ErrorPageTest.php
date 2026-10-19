<?php

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

test('non-existent url renders 404 inertia error page', function () {
    $this->get('/non-existent-page-random-xyz')
        ->assertStatus(404)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 404)
            ->where('message', null)
        );
});

test('abort 404 with custom message renders 404 inertia error page with message', function () {
    $this->get('/test-error/404-custom')
        ->assertStatus(404)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 404)
            ->where('message', 'Adoptable pet profile not found.')
        );
});

test('abort 403 renders 403 inertia error page with custom message', function () {
    $this->get('/test-error/403')
        ->assertStatus(403)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 403)
            ->where('message', 'You are not allowed in this kennel.')
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
        );
});

test('post form submission with 419 redirects back with flash error to preserve form inputs', function () {
    Route::post('/test-error/419-submit', fn () => abort(419));

    $this->from('/sos')
        ->post('/test-error/419-submit', ['title' => 'Stray dog rescue needed'])
        ->assertRedirect('/sos')
        ->assertSessionHas('error');
});

test('abort 429 renders 429 inertia error page', function () {
    $this->get('/test-error/429')
        ->assertStatus(429)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 429)
            ->where('message', 'Rate limit exceeded.')
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

test('500 server error renders 500 inertia error page without leaking sensitive message when debug is disabled', function () {
    config(['app.debug' => false]);

    $this->get('/test-error/500')
        ->assertStatus(500)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 500)
            ->where('message', null)
        );
});

test('api routes return json error responses and do not render inertia error page', function () {
    $this->getJson('/api/non-existent-endpoint')
        ->assertStatus(404)
        ->assertJsonStructure(['message']);
});

test('unauthorized role access returns 403 inertia error page with authenticated user context', function () {
    $this->seed(RoleSeeder::class);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('account.super-admin.dashboard'))
        ->assertStatus(403)
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 403)
            ->has('auth.user')
            ->where('auth.user.id', $user->id)
        );
});
