<?php

use App\Events\RealtimeDomainEventPushed;
use App\Models\AdoptionApplication;
use App\Models\Donation;
use App\Models\PetReport;
use App\Models\ShelterAnimal;
use App\Models\User;
use App\Models\VolunteerApplication;
use App\Services\RealtimeEventBroadcaster;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('submitting adoption application dispatches realtime domain event', function () {
    Event::fake([RealtimeDomainEventPushed::class]);

    $user = User::factory()->user()->create();
    $animal = ShelterAnimal::factory()->create();

    AdoptionApplication::factory()->create([
        'user_id' => $user->id,
        'shelter_animal_id' => $animal->id,
        'full_name' => 'John Doe',
    ]);

    Event::assertDispatched(RealtimeDomainEventPushed::class, function (RealtimeDomainEventPushed $event) {
        return $event->eventData['domain'] === 'adoption'
            && $event->eventData['action'] === 'submitted'
            && in_array('admin', $event->eventData['targetRoles'] ?? []);
    });
});

test('updating adoption application status dispatches realtime domain event to applicant', function () {
    Event::fake([RealtimeDomainEventPushed::class]);

    $user = User::factory()->user()->create();
    $application = AdoptionApplication::factory()->create([
        'user_id' => $user->id,
        'status' => 'pending',
    ]);

    $application->update(['status' => 'approved']);

    Event::assertDispatched(RealtimeDomainEventPushed::class, function (RealtimeDomainEventPushed $event) use ($user) {
        return $event->eventData['domain'] === 'adoption'
            && $event->eventData['action'] === 'status_updated'
            && (string) $event->eventData['targetUserId'] === (string) $user->id;
    });
});

test('creating pet rescue report dispatches realtime domain event', function () {
    Event::fake([RealtimeDomainEventPushed::class]);

    PetReport::factory()->create([
        'type' => 'rescue',
        'location' => 'Main St, Iligan',
    ]);

    Event::assertDispatched(RealtimeDomainEventPushed::class, function (RealtimeDomainEventPushed $event) {
        return $event->eventData['domain'] === 'rescue'
            && $event->eventData['action'] === 'submitted';
    });
});

test('creating donation dispatches realtime domain event', function () {
    Event::fake([RealtimeDomainEventPushed::class]);

    Donation::factory()->create([
        'donor_name' => 'Jane Donor',
        'amount' => 1000,
        'type' => 'cash',
    ]);

    Event::assertDispatched(RealtimeDomainEventPushed::class, function (RealtimeDomainEventPushed $event) {
        return $event->eventData['domain'] === 'donation'
            && $event->eventData['action'] === 'submitted';
    });
});

test('submitting volunteer application dispatches realtime domain event', function () {
    Event::fake([RealtimeDomainEventPushed::class]);

    VolunteerApplication::factory()->create([
        'full_name' => 'Alice Volunteer',
    ]);

    Event::assertDispatched(RealtimeDomainEventPushed::class, function (RealtimeDomainEventPushed $event) {
        return $event->eventData['domain'] === 'volunteer'
            && $event->eventData['action'] === 'submitted';
    });
});

test('realtime domain event broadcaster filters events by role and user', function () {
    $timestamp = microtime(true) - 1;

    $admin = User::factory()->admin()->create();
    $user = User::factory()->user()->create();

    RealtimeEventBroadcaster::publish(
        domain: 'adoption',
        action: 'submitted',
        title: 'New Application',
        message: 'Application test',
        targetRoles: ['admin'],
    );

    $adminEvents = RealtimeEventBroadcaster::getEventsSince($timestamp, $admin);
    $userEvents = RealtimeEventBroadcaster::getEventsSince($timestamp, $user);

    expect($adminEvents)->toHaveCount(1)
        ->and($adminEvents[0]['domain'])->toBe('adoption')
        ->and($userEvents)->toHaveCount(0);
});
