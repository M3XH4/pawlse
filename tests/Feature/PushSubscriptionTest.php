<?php

use App\Jobs\SendWebPushNotification;
use App\Models\PushSubscription;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\WebPushNotificationService;
use App\Support\WebPushCrypto;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot subscribe, unlink, test, or view vapid keys', function () {
    $keys = WebPushCrypto::generateVapidKeys();
    Config::set('services.webpush.public_key', $keys['publicKey']);
    Config::set('services.webpush.private_key', $keys['privateKey']);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user', null)
            ->where('webPush.enabled', false)
            ->where('webPush.publicKey', null)
            ->where('webPush.hasSubscription', false)
            ->where('webPush.devicesCount', 0),
        );

    $this->post(route('account.push-subscriptions.store'), [
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/sample-endpoint',
        'keys' => [
            'p256dh' => 'BOrSamplePublicKey1234567890',
            'auth' => 'SampleAuthSecret123',
        ],
    ])->assertRedirect(route('login'));

    $this->delete(route('account.push-subscriptions.destroy'))
        ->assertRedirect(route('login'));

    $this->post(route('account.push-subscriptions.test'))
        ->assertRedirect(route('login'));
});

test('verified user can store push subscription and new user on same device claims ownership', function () {
    $keys = WebPushCrypto::generateVapidKeys();
    Config::set('services.webpush.public_key', $keys['publicKey']);
    Config::set('services.webpush.private_key', $keys['privateKey']);

    $firstUser = User::factory()->create();
    $secondUser = User::factory()->create();
    $endpoint = 'https://fcm.googleapis.com/fcm/send/device-token-123';

    $this->actingAs($firstUser)
        ->postJson(route('account.push-subscriptions.store'), [
            'endpoint' => $endpoint,
            'keys' => [
                'p256dh' => 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM',
                'auth' => 'tBHItJI5svbpez7KI4CCXg',
            ],
            'isStandalone' => true,
        ])
        ->assertOk()
        ->assertJson([
            'subscribed' => true,
            'devices_count' => 1,
        ]);

    expect(PushSubscription::query()->count())->toBe(1);
    expect(PushSubscription::query()->first()->user_id)->toBe($firstUser->id);
    expect(PushSubscription::query()->first()->is_standalone)->toBeTrue();

    $this->actingAs($firstUser)
        ->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('webPush.enabled', true)
            ->where('webPush.publicKey', $keys['publicKey'])
            ->where('webPush.hasSubscription', true)
            ->where('webPush.devicesCount', 1),
        );

    $this->actingAs($secondUser)
        ->postJson(route('account.push-subscriptions.store'), [
            'endpoint' => $endpoint,
            'keys' => [
                'p256dh' => 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM',
                'auth' => 'tBHItJI5svbpez7KI4CCXg',
            ],
            'isStandalone' => true,
        ])
        ->assertOk()
        ->assertJson([
            'subscribed' => true,
            'devices_count' => 1,
        ]);

    expect(PushSubscription::query()->count())->toBe(1);
    expect(PushSubscription::query()->first()->user_id)->toBe($secondUser->id);
    expect($firstUser->pushSubscriptions()->count())->toBe(0);
});

test('user can unlink only their own device subscription on logout', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();

    $ownerEndpoint = 'https://fcm.googleapis.com/fcm/send/owner-device';
    $otherEndpoint = 'https://fcm.googleapis.com/fcm/send/other-device';

    PushSubscription::query()->create([
        'user_id' => $owner->id,
        'endpoint' => $ownerEndpoint,
        'endpoint_hash' => PushSubscription::hashEndpoint($ownerEndpoint),
        'public_key' => 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM',
        'auth_token' => 'tBHItJI5svbpez7KI4CCXg',
    ]);

    PushSubscription::query()->create([
        'user_id' => $otherUser->id,
        'endpoint' => $otherEndpoint,
        'endpoint_hash' => PushSubscription::hashEndpoint($otherEndpoint),
        'public_key' => 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM',
        'auth_token' => 'tBHItJI5svbpez7KI4CCXg',
    ]);

    $this->actingAs($owner)
        ->deleteJson(route('account.push-subscriptions.destroy'), [
            'endpoint' => $otherEndpoint,
        ])
        ->assertOk()
        ->assertJson(['deleted' => 0]);

    expect($otherUser->pushSubscriptions()->count())->toBe(1);

    $this->actingAs($owner)
        ->deleteJson(route('account.push-subscriptions.destroy'), [
            'endpoint' => $ownerEndpoint,
        ])
        ->assertOk()
        ->assertJson(['deleted' => 1, 'devices_count' => 0]);

    expect($owner->pushSubscriptions()->count())->toBe(0);
});

test('creating a database notification dispatches queued web push job', function () {
    Queue::fake();

    $keys = WebPushCrypto::generateVapidKeys();
    Config::set('services.webpush.public_key', $keys['publicKey']);
    Config::set('services.webpush.private_key', $keys['privateKey']);

    $user = User::factory()->create();

    DatabaseNotification::query()->create([
        'id' => (string) Str::uuid(),
        'type' => 'App\\Notifications\\GenericNotification',
        'notifiable_type' => User::class,
        'notifiable_id' => $user->id,
        'data' => [
            'title' => 'Adoption Approved',
            'description' => 'Your application was approved.',
            'url' => '/account/user/adoption-applications',
            'category' => 'adoption',
        ],
    ]);

    Queue::assertPushed(SendWebPushNotification::class, function (SendWebPushNotification $job) use ($user): bool {
        return $job->userId === $user->id
            && $job->payload['title'] === 'Adoption Approved'
            && $job->payload['url'] === '/account/user/adoption-applications'
            && $job->unreadCount === 1;
    });
});

test('web push service encrypts payload, sends vapid headers, and prunes 410 gone subscriptions', function () {
    $keys = WebPushCrypto::generateVapidKeys();
    $clientKeys = WebPushCrypto::generateVapidKeys();
    $clientAuth = WebPushCrypto::base64UrlEncode(random_bytes(16));

    Config::set('services.webpush.public_key', $keys['publicKey']);
    Config::set('services.webpush.private_key', $keys['privateKey']);
    Config::set('services.webpush.subject', 'mailto:support@iliganstrayfeeders.site');

    $user = User::factory()->create(['push_suppress_when_visible' => true]);

    $activeEndpoint = 'https://fcm.googleapis.com/fcm/send/active-sub';
    $goneEndpoint = 'https://web.push.apple.com/gone-sub';

    PushSubscription::query()->create([
        'user_id' => $user->id,
        'endpoint' => $activeEndpoint,
        'endpoint_hash' => PushSubscription::hashEndpoint($activeEndpoint),
        'public_key' => $clientKeys['publicKey'],
        'auth_token' => $clientAuth,
    ]);

    PushSubscription::query()->create([
        'user_id' => $user->id,
        'endpoint' => $goneEndpoint,
        'endpoint_hash' => PushSubscription::hashEndpoint($goneEndpoint),
        'public_key' => $clientKeys['publicKey'],
        'auth_token' => $clientAuth,
    ]);

    Http::fake([
        $activeEndpoint => Http::response('', 201),
        $goneEndpoint => Http::response('', 410),
    ]);

    $service = app(WebPushNotificationService::class);
    $result = $service->sendToUser($user, [
        'id' => 'notif-1',
        'title' => 'Rescue Update',
        'description' => 'Volunteer assigned to your rescue report.',
        'url' => '/account/user/rescue-reports',
        'unreadCount' => 2,
    ]);

    expect($result)->toBe(['sent' => 1, 'failed' => 0, 'pruned' => 1]);
    expect($user->pushSubscriptions()->count())->toBe(1);
    expect($user->pushSubscriptions()->first()->endpoint)->toBe($activeEndpoint);

    Http::assertSent(function ($request) use ($activeEndpoint, $keys): bool {
        if ($request->url() !== $activeEndpoint) {
            return true;
        }

        $authHeader = $request->header('Authorization')[0] ?? '';

        return str_starts_with($authHeader, 'vapid t=')
            && str_contains($authHeader, ', k='.$keys['publicKey'])
            && ($request->header('Content-Encoding')[0] ?? '') === 'aes128gcm'
            && strlen($request->body()) > 86;
    });
});

test('user can update push foreground suppression preference in notification settings', function () {
    $user = User::factory()->create(['push_suppress_when_visible' => true]);

    $this->actingAs($user)
        ->patch(route('settings.notifications.update'), [
            'sidebar_notification_style' => 'dot',
            'push_suppress_when_visible' => false,
        ])
        ->assertRedirect();

    $user->refresh();
    expect($user->sidebar_notification_style)->toBe('dot');
    expect($user->push_suppress_when_visible)->toBeFalse();
});

test('test push alert respects super admin system setting toggle', function () {
    $keys = WebPushCrypto::generateVapidKeys();
    $clientKeys = WebPushCrypto::generateVapidKeys();
    $clientAuth = WebPushCrypto::base64UrlEncode(random_bytes(16));

    Config::set('services.webpush.public_key', $keys['publicKey']);
    Config::set('services.webpush.private_key', $keys['privateKey']);

    $user = User::factory()->create();
    $endpoint = 'https://fcm.googleapis.com/fcm/send/test-device';

    PushSubscription::query()->create([
        'user_id' => $user->id,
        'endpoint' => $endpoint,
        'endpoint_hash' => PushSubscription::hashEndpoint($endpoint),
        'public_key' => $clientKeys['publicKey'],
        'auth_token' => $clientAuth,
    ]);

    Http::fake([
        $endpoint => Http::response('', 201),
    ]);

    // Disabled by default in system_settings
    $this->actingAs($user)
        ->postJson(route('account.push-subscriptions.test'))
        ->assertForbidden();

    // Super Admin enables test alert in system settings
    SystemSetting::setValue('system_settings', [
        'push_test_alert_enabled' => true,
    ]);

    $this->actingAs($user)
        ->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('webPush.testAlertEnabled', true));

    $this->actingAs($user)
        ->postJson(route('account.push-subscriptions.test'))
        ->assertOk()
        ->assertJson([
            'ok' => true,
            'sent' => 1,
            'failed' => 0,
            'pruned' => 0,
        ]);
});
