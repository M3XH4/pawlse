<?php

use App\Enums\DonationStatus;
use App\Enums\DonationType;
use App\Enums\PaymentStatus;
use App\Models\CareSustainability;
use App\Models\CareSustainabilityHistory;
use App\Models\Donation;
use App\Models\InKindDonation;
use App\Models\InventoryItem;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('care sustainability current singleton initializes default record', function () {
    $sustainability = CareSustainability::current();

    expect($sustainability)->not->toBeNull();
    expect($sustainability->daily_cost)->toBe(500.0);
    expect($sustainability->resource_category)->toBe('General Animal Care');
    expect($sustainability->threshold_stable_days)->toBe(7.0);
    expect($sustainability->threshold_needs_support_days)->toBe(3.0);
    expect($sustainability->threshold_urgent_days)->toBe(1.0);
    expect($sustainability->threshold_critical_days)->toBe(0.25);
});

test('recalculate accurately computes endpoint and logs history', function () {
    $sustainability = CareSustainability::current();
    $admin = User::factory()->admin()->create();

    $now = Carbon::parse('2026-10-15 12:00:00');
    Carbon::setTestNow($now);

    // 5000 funds with 500 daily cost = 10 days
    $sustainability->recalculate(
        funds: 5000,
        dailyCost: 500,
        category: 'Food & Medicine',
        notes: 'Monthly budget replenishment',
        user: $admin
    );

    $sustainability->refresh();

    expect($sustainability->verified_funds)->toBe(5000.0);
    expect($sustainability->daily_cost)->toBe(500.0);
    expect($sustainability->resource_category)->toBe('Food & Medicine');
    expect($sustainability->sustainability_endpoint->equalTo($now->copy()->addDays(10)))->toBeTrue();
    expect($sustainability->getUrgencyStatus($now))->toBe('STABLE');

    $history = CareSustainabilityHistory::latest('id')->first();
    expect($history)->not->toBeNull();
    expect($history->action)->toBe('recalculated');
    expect($history->funds_amount)->toBe(5000.0);
    expect($history->days_added)->toBe(10.0);
    expect($history->performed_by)->toBe($admin->name);

    Carbon::setTestNow();
});

test('urgency status correctly identifies status levels across thresholds', function () {
    $sustainability = CareSustainability::current();
    $now = Carbon::parse('2026-10-15 12:00:00');
    Carbon::setTestNow($now);

    // 8 days in future (>= 7) => STABLE
    $sustainability->update(['sustainability_endpoint' => $now->copy()->addDays(8)]);
    expect($sustainability->getUrgencyStatus($now))->toBe('STABLE');

    // 4 days in future (>= 3, < 7) => NEEDS SUPPORT
    $sustainability->update(['sustainability_endpoint' => $now->copy()->addDays(4)]);
    expect($sustainability->getUrgencyStatus($now))->toBe('NEEDS SUPPORT');

    // 2 days in future (>= 1, < 3) => URGENT
    $sustainability->update(['sustainability_endpoint' => $now->copy()->addDays(2)]);
    expect($sustainability->getUrgencyStatus($now))->toBe('URGENT');

    // 0.5 days in future (>= 0.25, < 1) => CRITICAL
    $sustainability->update(['sustainability_endpoint' => $now->copy()->addHours(12)]);
    expect($sustainability->getUrgencyStatus($now))->toBe('CRITICAL');

    // Endpoint in past => DEPLETED
    $sustainability->update(['sustainability_endpoint' => $now->copy()->subMinutes(10)]);
    expect($sustainability->getUrgencyStatus($now))->toBe('DEPLETED');

    Carbon::setTestNow();
});

test('extending timer by donation amount adds days and extends endpoint', function () {
    $sustainability = CareSustainability::current();
    $admin = User::factory()->admin()->create();

    $now = Carbon::parse('2026-10-15 12:00:00');
    Carbon::setTestNow($now);

    // Initial: 2 days in future
    $initialEndpoint = $now->copy()->addDays(2);
    $sustainability->update([
        'daily_cost' => 500,
        'verified_funds' => 1000,
        'sustainability_endpoint' => $initialEndpoint,
    ]);

    // Extend by ₱1,500 (3 days)
    $sustainability->extendByAmount(1500, 'Donation extension', $admin);
    $sustainability->refresh();

    expect($sustainability->verified_funds)->toBe(2500.0);
    // Initial 2 days + 3 days = 5 days from now
    expect($sustainability->sustainability_endpoint->equalTo($initialEndpoint->copy()->addDays(3)))->toBeTrue();

    Carbon::setTestNow();
});

test('admin can recalculate sustainability via admin endpoint', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('account.admin.donation-monitoring.sustainability.recalculate'), [
        'verified_funds' => 6000,
        'daily_cost' => 600,
        'resource_category' => 'Rescue & Shelter Operations',
        'calculation_notes' => 'Recalculated with updated costs',
        'threshold_stable_days' => 7,
        'threshold_needs_support_days' => 3,
        'threshold_urgent_days' => 1,
        'threshold_critical_days' => 0.25,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $current = CareSustainability::current();
    expect($current->verified_funds)->toBe(6000.0);
    expect($current->daily_cost)->toBe(600.0);
    expect($current->resource_category)->toBe('Rescue & Shelter Operations');
});

test('admin can save configuration only without altering endpoint', function () {
    $admin = User::factory()->admin()->create();
    $current = CareSustainability::current();
    $origEndpoint = $current->sustainability_endpoint;

    $response = $this->actingAs($admin)->post(route('account.admin.donation-monitoring.sustainability.config'), [
        'daily_cost' => 750,
        'resource_category' => 'General Animal Care',
        'calculation_notes' => 'Updated daily care rate',
        'threshold_stable_days' => 8,
        'threshold_needs_support_days' => 4,
        'threshold_urgent_days' => 2,
        'threshold_critical_days' => 0.5,
    ]);

    $response->assertSessionHasNoErrors();
    $current->refresh();

    expect($current->daily_cost)->toBe(750.0);
    expect($current->threshold_stable_days)->toBe(8.0);
    expect($current->sustainability_endpoint?->toIsoString())->toBe($origEndpoint?->toIsoString());
});

test('admin can extend care timer with verified amount', function () {
    $admin = User::factory()->admin()->create();
    $current = CareSustainability::current();
    $initialFunds = $current->verified_funds;

    $response = $this->actingAs($admin)->post(route('account.admin.donation-monitoring.sustainability.extend'), [
        'amount' => 1000,
        'notes' => 'Manual care fund replenishment',
    ]);

    $response->assertSessionHasNoErrors();
    $current->refresh();

    expect($current->verified_funds)->toBe($initialFunds + 1000.0);
});

test('verifying cash donation in donation monitoring automatically extends care timer', function () {
    $admin = User::factory()->admin()->create();
    $current = CareSustainability::current();
    $initialFunds = $current->verified_funds;

    $donation = Donation::create([
        'public_reference' => 'DON-CASH-TEST',
        'donor_name' => 'Generous Supporter',
        'donor_email' => 'donor@example.com',
        'type' => DonationType::Cash->value,
        'amount' => 2000,
        'status' => DonationStatus::PendingVerification->value,
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.donation-monitoring.verify-cash', $donation));
    $response->assertSessionHasNoErrors();

    $current->refresh();
    expect($current->verified_funds)->toBe($initialFunds + 2000.0);

    $history = CareSustainabilityHistory::where('donation_id', $donation->id)->first();
    expect($history)->not->toBeNull();
    expect($history->amount_added)->toBe(2000.0);
});

test('completing payment at checkout automatically extends care timer', function () {
    $current = CareSustainability::current();
    $initialFunds = $current->verified_funds;

    $donation = Donation::create([
        'public_reference' => 'DON-PAY-TEST',
        'donor_name' => 'Online Donor',
        'donor_email' => 'online@example.com',
        'type' => DonationType::Cash->value,
        'amount' => 1500,
        'status' => DonationStatus::PendingPayment->value,
    ]);

    Payment::create([
        'donation_id' => $donation->id,
        'method' => 'gcash',
        'provider' => 'gcash',
        'amount' => 1500,
        'payment_reference' => 'PAY-TEST-999',
        'status' => PaymentStatus::Pending->value,
    ]);

    $response = $this->post(route('donate.pay', $donation->public_reference), [
        'action' => 'success',
    ]);

    $response->assertRedirect();

    $current->refresh();
    expect($current->verified_funds)->toBe($initialFunds + 1500.0);
});

test('homepage and donate page render with care sustainability data', function () {
    $homeResponse = $this->get(route('home'));
    $homeResponse->assertOk();
    $homeResponse->assertInertia(fn ($page) => $page
        ->component('welcome')
        ->has('careSustainability')
        ->where('careSustainability.resource_category', 'General Animal Care')
    );

    $donateResponse = $this->get(route('donate'));
    $donateResponse->assertOk();
    $donateResponse->assertInertia(fn ($page) => $page
        ->component('donate')
        ->has('careSustainability')
        ->where('careSustainability.resource_category', 'General Animal Care')
    );
});

test('admin donation monitoring page renders sustainability data and history', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('account.admin.donation-monitoring'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/donation-monitoring')
        ->has('sustainability')
        ->has('sustainabilityHistory')
    );
});

test('verifying in-kind donation with extend_care_timer enabled adds days to care timer', function () {
    $admin = User::factory()->admin()->create();
    $current = CareSustainability::current();
    $initialFunds = $current->verified_funds;

    $donation = Donation::create([
        'public_reference' => 'DON-INKIND-EXTEND',
        'donor_name' => 'Kibble Sponsor',
        'donor_email' => 'kibble@example.com',
        'type' => DonationType::InKind->value,
        'status' => DonationStatus::PendingVerification->value,
    ]);

    InKindDonation::create([
        'donation_id' => $donation->id,
        'description' => '20kg Premium Dog Food',
        'quantity' => '4 bags',
        'drop_off_date' => now()->toDateString(),
        'contact_person' => 'Shelter Staff',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.donation-monitoring.in-kind.verify', $donation), [
        'itemName' => 'Premium Dog Food',
        'quantity' => 4,
        'unit' => 'bags',
        'category' => 'Food',
        'batch_number' => 'LOT-DOG-001',
        'storage_location' => 'Pantry A',
        'estimated_value' => 3000,
        'extend_care_timer' => true,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $current->refresh();
    expect($current->verified_funds)->toBe($initialFunds + 3000.0);

    $history = CareSustainabilityHistory::where('donation_id', $donation->id)->first();
    expect($history)->not->toBeNull();
    expect($history->amount_added)->toBe(3000.0);
    expect($history->notes)->toContain('DON-INKIND-EXTEND');
});

test('verifying in-kind donation without extend_care_timer does not alter care timer', function () {
    $admin = User::factory()->admin()->create();
    $current = CareSustainability::current();
    $initialFunds = $current->verified_funds;

    $donation = Donation::create([
        'public_reference' => 'DON-INKIND-NO-EXT',
        'donor_name' => 'Towel Donor',
        'donor_email' => 'towel@example.com',
        'type' => DonationType::InKind->value,
        'status' => DonationStatus::PendingVerification->value,
    ]);

    InKindDonation::create([
        'donation_id' => $donation->id,
        'description' => 'Towels and Blankets',
        'quantity' => '10 pcs',
        'drop_off_date' => now()->toDateString(),
        'contact_person' => 'Shelter Staff',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.donation-monitoring.in-kind.verify', $donation), [
        'itemName' => 'Towels and Blankets',
        'quantity' => 10,
        'unit' => 'pcs',
        'category' => 'Supplies',
        'estimated_value' => 1500,
        'extend_care_timer' => false,
    ]);

    $response->assertSessionHasNoErrors();
    $current->refresh();
    expect($current->verified_funds)->toBe($initialFunds);
});

test('inventory item daily_usage_rate calculates days of supply', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('account.admin.donation-monitoring.inventory.store'), [
        'name' => 'Puppy Chow Formula',
        'unit' => 'kg',
        'category' => 'Food',
        'min_threshold' => 10,
        'daily_usage_rate' => 5.0,
        'initial_quantity' => 50,
        'batch_number' => 'INIT-PUPPY-50',
    ]);

    $response->assertSessionHasNoErrors();

    $item = InventoryItem::where('name', 'Puppy Chow Formula')->first();
    expect($item)->not->toBeNull();
    expect((float) $item->daily_usage_rate)->toBe(5.0);
    // 50 kg / 5 kg/day = 10.0 days of supply
    expect((float) $item->estimated_days_of_supply)->toBe(10.0);

    // Update daily usage rate to 10.0 kg/day
    $this->actingAs($admin)->put(route('account.admin.donation-monitoring.inventory.update', $item), [
        'name' => 'Puppy Chow Formula',
        'unit' => 'kg',
        'category' => 'Food',
        'min_threshold' => 10,
        'daily_usage_rate' => 10.0,
    ]);

    $item->refresh();
    expect((float) $item->daily_usage_rate)->toBe(10.0);
    // 50 kg / 10 kg/day = 5.0 days of supply
    expect((float) $item->estimated_days_of_supply)->toBe(5.0);
});
