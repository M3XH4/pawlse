<?php

use App\Enums\Role;
use App\Models\AdoptionApplication;
use App\Models\AssignedTask;
use App\Models\Certificate;
use App\Models\ContactMessage;
use App\Models\Donation;
use App\Models\Event;
use App\Models\PetReport;
use App\Models\RehomingRequest;
use App\Models\ShelterAnimal;
use App\Models\ShelterVisit;
use App\Models\User;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Verified;
use Spatie\Permission\Models\Role as PermissionRole;

test('verifying email links all matching guest records to the newly verified user account', function () {
    $animal = ShelterAnimal::factory()->create();
    $event = Event::factory()->create();

    $adoption = AdoptionApplication::factory()->create([
        'user_id' => null,
        'shelter_animal_id' => $animal->id,
        'email' => 'alice@example.com',
    ]);

    $donation = Donation::factory()->create([
        'user_id' => null,
        'donor_email' => 'ALICE@EXAMPLE.COM',
    ]);

    $petReport = PetReport::factory()->create([
        'user_id' => null,
        'contact_email' => 'alice@example.com',
    ]);

    $rehoming = RehomingRequest::factory()->create([
        'user_id' => null,
        'email' => 'alice@example.com',
    ]);

    $visit = ShelterVisit::factory()->create([
        'user_id' => null,
        'email' => 'alice@example.com',
    ]);

    $task = AssignedTask::factory()->create([
        'user_id' => null,
        'event_id' => $event->id,
        'guest_email' => 'alice@example.com',
    ]);

    $certificate = Certificate::factory()->create([
        'user_id' => null,
        'event_id' => $event->id,
        'guest_email' => 'alice@example.com',
    ]);

    $contact = ContactMessage::factory()->create([
        'user_id' => null,
        'email' => 'alice@example.com',
    ]);

    // Unrelated guest & already-owned records must remain untouched
    $otherGuestDonation = Donation::factory()->create([
        'user_id' => null,
        'donor_email' => 'bob@example.com',
    ]);
    $otherUser = User::factory()->create(['email' => 'existing@example.com']);
    $ownedDonation = Donation::factory()->create([
        'user_id' => $otherUser->id,
        'donor_email' => 'alice@example.com',
    ]);

    PermissionRole::findOrCreate(Role::User->value, 'web');
    $user = User::factory()->unverified()->create([
        'email' => 'Alice@Example.com',
        'role' => Role::User->value,
    ]);
    $user->syncRoles([Role::User]);

    // Before verification, records are still unlinked
    expect($adoption->fresh()->user_id)->toBeNull()
        ->and($donation->fresh()->user_id)->toBeNull()
        ->and($task->fresh()->user_id)->toBeNull();

    // Simulate OTP verification completing
    $user->markEmailAsVerified();
    event(new Verified($user));

    expect($adoption->fresh()->user_id)->toBe($user->id)
        ->and($donation->fresh()->user_id)->toBe($user->id)
        ->and($petReport->fresh()->user_id)->toBe($user->id)
        ->and($rehoming->fresh()->user_id)->toBe($user->id)
        ->and($visit->fresh()->user_id)->toBe($user->id)
        ->and($task->fresh()->user_id)->toBe($user->id)
        ->and($certificate->fresh()->user_id)->toBe($user->id)
        ->and($contact->fresh()->user_id)->toBe($user->id)
        ->and($otherGuestDonation->fresh()->user_id)->toBeNull()
        ->and($ownedDonation->fresh()->user_id)->toBe($otherUser->id);

    // Confirm linked records are accessible in the user dashboard
    $this->actingAs($user)
        ->get(route('account.user.adoption-applications'))
        ->assertOk();

    $this->actingAs($user)
        ->get(route('account.user.donations'))
        ->assertOk();

    $this->actingAs($user)
        ->get(route('account.user.joined-events'))
        ->assertOk();
});

test('verified login links any subsequent guest submissions made with the same email', function () {
    $user = User::factory()->create([
        'email' => 'carol@example.com',
    ]);

    $laterDonation = Donation::factory()->create([
        'user_id' => null,
        'donor_email' => 'carol@example.com',
    ]);

    event(new Login('web', $user, false));

    expect($laterDonation->fresh()->user_id)->toBe($user->id);
});

test('unverified login does not link guest records', function () {
    $user = User::factory()->unverified()->create([
        'email' => 'dave@example.com',
    ]);

    $guestDonation = Donation::factory()->create([
        'user_id' => null,
        'donor_email' => 'dave@example.com',
    ]);

    event(new Login('web', $user, false));

    expect($guestDonation->fresh()->user_id)->toBeNull();
});
