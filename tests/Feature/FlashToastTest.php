<?php

use App\Models\User;

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
