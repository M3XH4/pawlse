<?php

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('user defaults to count sidebar notification style', function () {
    $user = User::factory()->user()->create();

    expect($user->sidebar_notification_style)->toBe('count');
});

test('authenticated user can update sidebar notification style to dot', function () {
    $user = User::factory()->user()->create();

    $response = $this->actingAs($user)
        ->from(route('account.user.account-settings'))
        ->patch(route('settings.notifications.update'), [
            'sidebar_notification_style' => 'dot',
        ]);

    $response->assertRedirect(route('account.user.account-settings'));
    expect($user->fresh()->sidebar_notification_style)->toBe('dot');
});

test('authenticated user can update sidebar notification style to none', function () {
    $user = User::factory()->user()->create([
        'sidebar_notification_style' => 'count',
    ]);

    $response = $this->actingAs($user)
        ->from(route('account.user.account-settings'))
        ->patch(route('settings.notifications.update'), [
            'sidebar_notification_style' => 'none',
        ]);

    $response->assertRedirect(route('account.user.account-settings'));
    expect($user->fresh()->sidebar_notification_style)->toBe('none');
});

test('authenticated user can update sidebar notification style to count', function () {
    $user = User::factory()->user()->create([
        'sidebar_notification_style' => 'dot',
    ]);

    $response = $this->actingAs($user)
        ->from(route('account.user.account-settings'))
        ->patch(route('settings.notifications.update'), [
            'sidebar_notification_style' => 'count',
        ]);

    $response->assertRedirect(route('account.user.account-settings'));
    expect($user->fresh()->sidebar_notification_style)->toBe('count');
});

test('updating sidebar notification style validates input', function () {
    $user = User::factory()->user()->create();

    $response = $this->actingAs($user)
        ->from(route('account.user.account-settings'))
        ->patch(route('settings.notifications.update'), [
            'sidebar_notification_style' => 'invalid_style',
        ]);

    $response->assertSessionHasErrors(['sidebar_notification_style']);
    expect($user->fresh()->sidebar_notification_style)->toBe('count');
});

test('unauthenticated user cannot update sidebar notification preferences', function () {
    $response = $this->patch(route('settings.notifications.update'), [
        'sidebar_notification_style' => 'dot',
    ]);

    $response->assertRedirect(route('login'));
});
