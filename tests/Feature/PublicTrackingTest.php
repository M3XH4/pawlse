<?php

use App\Enums\AdoptionApplicationStatus;
use App\Enums\DonationStatus;
use App\Enums\DonationType;
use App\Enums\ShelterAnimalStatus;
use App\Models\AdoptionApplication;
use App\Models\Donation;
use App\Models\PetReport;
use App\Models\RehomingRequest;
use App\Models\ShelterAnimal;
use App\Models\ShelterVisit;
use App\Models\User;
use App\Notifications\AdoptionApplicationStatusUpdatedNotification;
use App\Notifications\RehomingRequestStatusUpdatedNotification;
use App\Notifications\RescueStatusUpdatedNotification;
use App\Notifications\ShelterVisitStatusUpdatedNotification;
use App\Notifications\SubmissionEReceiptNotification;

test('public user can track their adoption application on unified track with reference and email', function () {
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);
    $app = AdoptionApplication::factory()->create([
        'shelter_animal_id' => $pet->id,
        'user_id' => null,
        'email' => 'public_adopter@example.com',
        'status' => AdoptionApplicationStatus::Pending,
    ]);

    $ref = 'ADP-'.str_pad((string) $app->id, 5, '0', STR_PAD_LEFT);

    $response = $this->get(route('track', ['reference' => $ref, 'email' => 'public_adopter@example.com']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('track')
        ->where('searchedReference', $ref)
        ->where('searchedEmail', 'public_adopter@example.com')
        ->where('item.category', 'adoption')
        ->where('item.id', $app->id)
    );
});

test('public user can track their donation on unified track with reference and email', function () {
    $donation = Donation::factory()->create([
        'public_reference' => 'DON-TEST1234',
        'donor_email' => 'donor@example.com',
        'amount' => 500,
        'status' => DonationStatus::Completed,
        'type' => DonationType::Cash,
    ]);

    $response = $this->get(route('track', ['reference' => 'DON-TEST1234', 'email' => 'donor@example.com']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('track')
        ->where('item.category', 'donation')
        ->where('item.reference', 'DON-TEST1234')
    );
});

test('public user can track their missing pet report on unified track with reference and email', function () {
    $report = PetReport::factory()->create([
        'type' => 'missing',
        'contact_email' => 'reporter@example.com',
        'name' => 'Fluffy',
        'status' => 'pending',
    ]);

    $ref = 'MIS-'.str_pad((string) $report->id, 5, '0', STR_PAD_LEFT);

    $response = $this->get(route('track', ['reference' => $ref, 'email' => 'reporter@example.com']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('track')
        ->where('item.category', 'missing')
        ->where('item.id', $report->id)
    );
});

test('public user can track their rescue report on unified track with reference and email', function () {
    $report = PetReport::factory()->create([
        'type' => 'rescue',
        'contact_email' => 'rescuer@example.com',
        'animal_type' => 'Dog',
        'status' => 'pending',
    ]);

    $ref = 'RES-'.str_pad((string) $report->id, 5, '0', STR_PAD_LEFT);

    $response = $this->get(route('track', ['reference' => $ref, 'email' => 'rescuer@example.com']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('track')
        ->where('item.category', 'rescue')
        ->where('item.id', $report->id)
    );
});

test('public user can track their rehoming request on unified track with reference and email', function () {
    $rehoming = RehomingRequest::factory()->create([
        'email' => 'rehome@example.com',
        'animal_name' => 'Buddy',
        'species' => 'Dog',
        'status' => 'pending',
    ]);

    $ref = 'REH-'.str_pad((string) $rehoming->id, 5, '0', STR_PAD_LEFT);

    $response = $this->get(route('track', ['reference' => $ref, 'email' => 'rehome@example.com']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('track')
        ->where('item.category', 'rehoming')
        ->where('item.id', $rehoming->id)
    );
});

test('public user can track their shelter visit on unified track with reference and email', function () {
    $visit = ShelterVisit::factory()->create([
        'email' => 'visitor@example.com',
        'full_name' => 'Visitor Name',
        'status' => 'pending',
    ]);

    $ref = 'VIS-'.str_pad((string) $visit->id, 5, '0', STR_PAD_LEFT);

    $response = $this->get(route('track', ['reference' => $ref, 'email' => 'visitor@example.com']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('track')
        ->where('item.category', 'shelter_visit')
        ->where('item.id', $visit->id)
    );
});

test('public user cannot track without matching email or reference', function () {
    $donation = Donation::factory()->create([
        'public_reference' => 'DON-SECRET99',
        'donor_email' => 'secret_donor@example.com',
    ]);

    // Wrong email
    $response = $this->get(route('track', ['reference' => 'DON-SECRET99', 'email' => 'other@example.com']));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('track')
        ->where('item', null)
    );

    // Reference only without email
    $response2 = $this->get(route('track', ['reference' => 'DON-SECRET99']));
    $response2->assertOk();
    $response2->assertInertia(fn ($page) => $page
        ->component('track')
        ->where('item', null)
    );
});

test('authenticated user visiting track without query params is directed to user dashboard', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('track'));

    $response->assertRedirect(route('account.user.bookmark'));
});

test('notifications include reference number and one-click tracking URL', function () {
    // 1. Adoption Application Status Updated Notification
    $pet = ShelterAnimal::factory()->create();
    $app = AdoptionApplication::factory()->create([
        'shelter_animal_id' => $pet->id,
        'email' => 'adopter@example.com',
        'status' => AdoptionApplicationStatus::Approved,
    ]);
    $adoptionMail = (new AdoptionApplicationStatusUpdatedNotification($app))->toMail(new User);
    $expectedAdpRef = 'ADP-'.str_pad((string) $app->id, 5, '0', STR_PAD_LEFT);
    $expectedAdpUrl = route('track', ['reference' => $expectedAdpRef, 'email' => 'adopter@example.com']);
    expect($adoptionMail->actionUrl)->toBe($expectedAdpUrl);

    // 2. Shelter Visit Status Updated Notification
    $visit = ShelterVisit::factory()->create([
        'email' => 'visitor@example.com',
        'status' => 'approved',
    ]);
    $visitMail = (new ShelterVisitStatusUpdatedNotification($visit))->toMail(new User);
    $expectedVisRef = 'VIS-'.str_pad((string) $visit->id, 5, '0', STR_PAD_LEFT);
    $expectedVisUrl = route('track', ['reference' => $expectedVisRef, 'email' => 'visitor@example.com']);
    expect($visitMail->actionUrl)->toBe($expectedVisUrl);

    // 3. Rehoming Request Status Updated Notification
    $rehoming = RehomingRequest::factory()->create([
        'email' => 'rehoming@example.com',
        'status' => 'approved',
    ]);
    $rehomingMail = (new RehomingRequestStatusUpdatedNotification($rehoming))->toMail(new User);
    $expectedRehRef = 'REH-'.str_pad((string) $rehoming->id, 5, '0', STR_PAD_LEFT);
    $expectedRehUrl = route('track', ['reference' => $expectedRehRef, 'email' => 'rehoming@example.com']);
    expect($rehomingMail->actionUrl)->toBe($expectedRehUrl);

    // 4. Rescue / Pet Report Status Updated Notification
    $report = PetReport::factory()->create([
        'type' => 'rescue',
        'contact_email' => 'rescue@example.com',
        'status' => 'investigating',
    ]);
    $rescueMail = (new RescueStatusUpdatedNotification($report))->toMail(new User);
    $expectedResRef = 'RES-'.str_pad((string) $report->id, 5, '0', STR_PAD_LEFT);
    $expectedResUrl = route('track', ['reference' => $expectedResRef, 'email' => 'rescue@example.com']);
    expect($rescueMail->actionUrl)->toBe($expectedResUrl);

    // 5. Submission E-Receipt Notification
    $eReceipt = SubmissionEReceiptNotification::forShelterVisit($visit);
    $eReceiptMail = $eReceipt->toMail(new User);
    expect($eReceiptMail->actionUrl)->toBe($expectedVisUrl);
});
