<?php

use App\Enums\DonationStatus;
use App\Enums\DonationType;
use App\Models\Donation;
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
