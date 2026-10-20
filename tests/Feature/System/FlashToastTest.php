<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

test('profile update flashes success toast to inertia session', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->patch(route('profile.update'), [
            'name' => 'Updated Name',
            'phone' => '+639123456789',
            'location' => 'Quezon City',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('profile.edit'));
    $response->assertInertiaFlash('toast');
    $response->assertInertiaFlash('toast.type', 'success');
});

test('foster care unauthorized redirect flashes toast', function () {
    $volunteer = User::factory()->volunteer()->create();

    $response = $this
        ->actingAs($volunteer)
        ->get(route('account.volunteer.foster-care'));

    $response->assertRedirect(route('account.volunteer.status'));
    $response->assertSessionHas('toast');
});

test('standard session error and success flash keys bridge automatically to inertia toast flash', function () {
    Route::middleware('web')->post('/test-flash/session-error', fn () => redirect('/')->with('error', 'This shelter event is already full.'));
    Route::middleware('web')->post('/test-flash/session-success', fn () => redirect('/')->with('success', 'Your registration has been confirmed.'));

    $this->post('/test-flash/session-error')
        ->assertRedirect('/')
        ->assertSessionHas('error', 'This shelter event is already full.')
        ->assertInertiaFlash('toast.type', 'error')
        ->assertInertiaFlash('toast.title', 'Action Could Not Be Completed')
        ->assertInertiaFlash('toast.description', 'This shelter event is already full.');

    $this->post('/test-flash/session-success')
        ->assertRedirect('/')
        ->assertSessionHas('success', 'Your registration has been confirmed.')
        ->assertInertiaFlash('toast.type', 'success')
        ->assertInertiaFlash('toast.title', 'Completed Successfully')
        ->assertInertiaFlash('toast.description', 'Your registration has been confirmed.');
});

test('custom validation messages provide clear actionable explanations', function () {
    Route::middleware('web')->post('/test-validation/adopt', function (Request $request) {
        $request->validate([
            'pet_id' => ['required', 'integer', 'exists:shelter_animals,id'],
            'uploadedId' => ['required', 'file'],
            'preferredDate' => ['required', 'date', 'after_or_equal:today'],
        ]);

        return redirect('/');
    });

    $response = $this->from('/adopt')
        ->post('/test-validation/adopt', [
            'pet_id' => 999999,
            'preferredDate' => '2020-01-01',
        ]);

    $response->assertRedirect('/adopt');
    $response->assertSessionHasErrors([
        'pet_id' => 'This adoption application could not go through because the selected pet is no longer available or has already been adopted. Please refresh the page and choose an available pet.',
        'uploadedId' => 'Your application could not be submitted because a valid ID photo is required. Please upload a clear photo of your government-issued ID in Step 3.',
        'preferredDate' => 'The preferred interview date cannot be in the past. Please choose today or an upcoming date on the calendar.',
    ]);
});
