<?php

use App\Enums\DonationStatus;
use App\Enums\DonationType;
use App\Models\Donation;
use App\Models\FeedingSponsorship;
use App\Models\InKindDonation;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('anonymous donations are shown as Anonymous in the public feed but with name on owner dashboard', function () {
    $this->seed(RoleSeeder::class);
    $user = User::factory()->create();

    // 1. Create a public donation (created first)
    $publicDonation = Donation::create([
        'public_reference' => 'DON-PUB-123',
        'user_id' => $user->id,
        'donor_name' => 'Public Supporter',
        'donor_email' => 'public@example.com',
        'anonymous' => false,
        'type' => DonationType::Cash->value,
        'amount' => 1000,
        'status' => DonationStatus::Completed->value,
    ]);

    // 2. Create an anonymous donation (created second, so it is latest and appears first)
    $anonDonation = Donation::create([
        'public_reference' => 'DON-ANON-123',
        'user_id' => $user->id,
        'donor_name' => 'Secret Donor',
        'donor_email' => 'secret@example.com',
        'anonymous' => true,
        'type' => DonationType::Cash->value,
        'amount' => 5000,
        'status' => DonationStatus::Completed->value,
    ]);

    // 3. Check public feed props
    $response = $this->get(route('donate'));
    $response->assertOk();

    // Verify Inertia props for recent donations
    $response->assertInertia(fn (Assert $page) => $page
        ->component('donate')
        ->has('recentDonations', 2)
        // The first one (latest) should be Anonymous
        ->where('recentDonations.0.name', 'Anonymous')
        // The second one should be Public Supporter
        ->where('recentDonations.1.name', 'Public Supporter')
    );

    // 4. Check owner dashboard props
    $response = $this->actingAs($user)->get(route('account.user.donations'));
    $response->assertOk();

    // Verify owner dashboard props
    $response->assertInertia(fn (Assert $page) => $page
        ->component('user/donations')
        ->has('donations.data', 2)
        // Confirm that the user sees their own actual names on their dashboard
        ->where('donations.data.0.donor_name', 'Secret Donor')
        ->where('donations.data.1.donor_name', 'Public Supporter')
    );
});

test('public transparency audit history includes verified cash, in-kind, and sponsor feeding donations', function () {
    $this->seed(RoleSeeder::class);

    // 1. Cash donation
    $cash = Donation::create([
        'public_reference' => 'DON-CASH-1',
        'donor_name' => 'Maria Santos',
        'donor_email' => 'maria@example.com',
        'anonymous' => false,
        'type' => DonationType::Cash->value,
        'amount' => 1000,
        'purpose' => 'Veterinary medicine for rescued dogs',
        'status' => DonationStatus::Completed->value,
    ]);

    // 2. In-kind donation
    $inKind = Donation::create([
        'public_reference' => 'DON-INKIND-1',
        'donor_name' => 'John Cruz',
        'donor_email' => 'john@example.com',
        'anonymous' => false,
        'type' => DonationType::InKind->value,
        'purpose' => 'In-kind drop-off: 5kg Vitality Dog Kibble',
        'status' => DonationStatus::Completed->value,
    ]);

    InKindDonation::create([
        'donation_id' => $inKind->id,
        'description' => '5kg Vitality Dog Kibble',
        'quantity' => '5kg',
        'contact_person' => 'John Cruz',
        'status' => 'received',
    ]);

    // 3. Feeding Sponsorship
    $sponsor = Donation::create([
        'public_reference' => 'DON-SPONSOR-1',
        'donor_name' => 'Dave Miller',
        'donor_email' => 'dave@example.com',
        'anonymous' => false,
        'type' => DonationType::FeedingSponsorship->value,
        'amount' => 3500,
        'purpose' => 'Full route stray feeding day',
        'status' => DonationStatus::Completed->value,
    ]);

    FeedingSponsorship::create([
        'public_reference' => 'FS-1',
        'donation_id' => $sponsor->id,
        'donor_name' => 'Dave Miller',
        'donor_email' => 'dave@example.com',
        'donor_mobile' => '09123456789',
        'preferred_date' => now()->addDays(2)->format('Y-m-d'),
        'occasion' => 'Birthday Feeding',
        'amount' => 3500,
        'status' => 'completed',
    ]);

    $response = $this->get(route('donate'));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('donate')
        ->has('auditRecords', 3)
        ->where('auditRecords.0.receipt', 'DON-SPONSOR-1')
        ->where('auditRecords.0.type_label', 'Sponsor Feeding')
        ->where('auditRecords.1.receipt', 'DON-INKIND-1')
        ->where('auditRecords.1.type_label', 'In-Kind')
        ->where('auditRecords.1.in_kind_quantity', '5kg')
        ->where('auditRecords.2.receipt', 'DON-CASH-1')
        ->where('auditRecords.2.type_label', 'Cash')
        ->where('auditRecords.2.amount', 1000)
    );
});
