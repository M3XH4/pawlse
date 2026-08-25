<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests cannot view the otp verification screen', function () {
    $this->get(route('verification.notice'))
        ->assertRedirect(route('login'));
});

test('otp validation requires a six digit code', function (?string $otp) {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->post(route('verification.verify'), ['otp' => $otp])
        ->assertSessionHasErrors('otp');
})->with([
    'missing' => null,
    'short' => '12345',
    'letters' => 'ABC123',
]);

test('unverified users are redirected away from protected dashboards', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->get(route('account.user.index'))
        ->assertRedirect(route('verification.notice'));
});
