<?php

use App\Events\NotificationPushed;
use App\Models\AdoptionApplication;
use App\Models\User;
use App\Notifications\AdoptionApplicationSubmittedNotification;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('authenticated user can connect to notification sse stream', function () {
    $user = User::factory()->user()->create();
    $application = AdoptionApplication::factory()->create();

    $user->notify(new AdoptionApplicationSubmittedNotification($application));

    $response = $this->actingAs($user)
        ->get(route('account.notifications.stream'));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/event-stream; charset=UTF-8');

    // In unit test environment, the stream yields the init event and finishes
    ob_start();
    $response->sendContent();
    $content = ob_get_clean();

    expect($content)->toContain('event: init')
        ->and($content)->toContain('"unreadCount":1');
});

test('unauthenticated guest cannot connect to notification sse stream', function () {
    $response = $this->get(route('account.notifications.stream'));

    $response->assertRedirect(route('login'));
});

test('authenticated user can poll notifications and unread count', function () {
    $user = User::factory()->user()->create();
    $application = AdoptionApplication::factory()->create();

    $user->notify(new AdoptionApplicationSubmittedNotification($application));
    $user->notify(new AdoptionApplicationSubmittedNotification($application));

    $response = $this->actingAs($user)
        ->getJson(route('account.notifications.poll'));

    $response->assertOk();
    $response->assertJsonStructure([
        'unreadCount',
        'notifications' => [
            '*' => [
                'id',
                'title',
                'description',
                'time',
                'url',
                'icon',
                'category',
                'read',
                'readUrl',
                'deleteUrl',
                'createdAt',
            ],
        ],
    ]);

    expect($response->json('unreadCount'))->toBe(2)
        ->and($response->json('notifications'))->toHaveCount(2);
});

test('unauthenticated guest cannot poll notifications', function () {
    $response = $this->getJson(route('account.notifications.poll'));

    $response->assertUnauthorized();
});

test('notification pushed event is dispatched when database notification is created', function () {
    Event::fake([NotificationPushed::class]);

    $user = User::factory()->user()->create();
    $application = AdoptionApplication::factory()->create();

    $user->notify(new AdoptionApplicationSubmittedNotification($application));

    Event::assertDispatched(NotificationPushed::class, function (NotificationPushed $event) use ($user) {
        return (string) $event->userId === (string) $user->id
            && $event->unreadCount === 1
            && isset($event->notification['title'])
            && isset($event->notification['id']);
    });
});

test('notification pushed event broadcasts on correct channel', function () {
    $user = User::factory()->user()->create();
    $event = new NotificationPushed(
        $user->id,
        ['id' => 'notif-1', 'title' => 'Test Notification'],
        1
    );

    $channels = $event->broadcastOn();

    expect($channels)->toHaveCount(1)
        ->and($channels[0]->name)->toBe('private-users.'.$user->id)
        ->and($event->broadcastAs())->toBe('notification.pushed')
        ->and($event->broadcastWith())->toBe([
            'notification' => ['id' => 'notif-1', 'title' => 'Test Notification'],
            'unreadCount' => 1,
        ]);
});

test('homepage does not share notifications or unread count for authenticated users', function () {
    $user = User::factory()->user()->create();
    $application = AdoptionApplication::factory()->create();

    $user->notify(new AdoptionApplicationSubmittedNotification($application));

    $response = $this->actingAs($user)->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('dashboardRole', null)
        ->where('unreadNotificationCount', 0)
        ->where('dashboardNotifications', [])
        ->where('dashboardNotificationActions', null)
    );
});

test('dashboards share notifications and unread count for authenticated users', function () {
    $user = User::factory()->user()->create();
    $application = AdoptionApplication::factory()->create();

    $user->notify(new AdoptionApplicationSubmittedNotification($application));

    $response = $this->actingAs($user)->get(route('account.user.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('dashboardRole', 'user')
        ->where('unreadNotificationCount', 1)
        ->has('dashboardNotifications', 1)
        ->where('dashboardNotificationActions.markAllReadUrl', route('account.notifications.read-all'))
    );
});
