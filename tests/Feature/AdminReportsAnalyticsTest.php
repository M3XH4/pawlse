<?php

use App\Models\Donation;
use App\Models\PetReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('admin reports analytics page renders and loads expected timeline data', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)
        ->get(route('account.admin.reports-analytics'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/reports-analytics')
            ->has('monthly')
            ->has('weekly')
            ->has('yearly')
            ->has('summary')
            ->has('months')
            ->has('weeks')
            ->has('years')
            ->has('animalBreakdown')
            ->has('donationBreakdown')
        );
});

test('admin can export summary report as csv', function () {
    $admin = User::factory()->admin()->create();

    PetReport::factory()->create(['status' => 'pending']);
    Donation::create([
        'public_reference' => 'REF789',
        'donor_name' => 'Charlie',
        'donor_email' => 'charlie@example.com',
        'type' => 'cash',
        'amount' => 1500,
        'status' => 'verified',
    ]);

    $response = $this->actingAs($admin)
        ->get(route('account.admin.reports-analytics.export', ['type' => 'summary']));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    $disposition = $response->headers->get('Content-Disposition');
    expect($disposition)->toContain('attachment; filename="pawlse_summary_report_')
        ->and($disposition)->toEndWith('.csv"');

    $content = $response->streamedContent();
    expect($content)->toContain('PAWLSE ANIMAL WELFARE PLATFORM OVERVIEW SUMMARY REPORT')
        ->and($content)->toContain('Total Rescue Reports')
        ->and($content)->toContain('Total Cash Donations (PHP)');
});

test('admin can export detailed rescues log as csv', function () {
    $admin = User::factory()->admin()->create();

    PetReport::factory()->create([
        'type' => 'rescue',
        'location' => 'Sector 4 Parks',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)
        ->get(route('account.admin.reports-analytics.export', ['type' => 'rescues']));

    $response->assertOk();
    $content = $response->streamedContent();
    expect($content)->toContain('PAWLSE DETAILED RESCUES REPORT')
        ->and($content)->toContain('Sector 4 Parks');
});

test('admin can export detailed donations log as csv', function () {
    $admin = User::factory()->admin()->create();

    Donation::create([
        'public_reference' => 'REF888',
        'donor_name' => 'David Miller',
        'donor_email' => 'david@example.com',
        'type' => 'cash',
        'amount' => 2000,
        'status' => 'verified',
    ]);

    $response = $this->actingAs($admin)
        ->get(route('account.admin.reports-analytics.export', ['type' => 'donations']));

    $response->assertOk();
    $content = $response->streamedContent();
    expect($content)->toContain('PAWLSE DETAILED DONATIONS REPORT')
        ->and($content)->toContain('David Miller')
        ->and($content)->toContain('2000');
});
