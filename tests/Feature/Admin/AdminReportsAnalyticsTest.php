<?php

use App\Enums\DonationStatus;
use App\Enums\DonationType;
use App\Enums\ShelterAnimalStatus;
use App\Models\AssignedTask;
use App\Models\Donation;
use App\Models\FosterParent;
use App\Models\FosterPlacement;
use App\Models\HelpDeskTicket;
use App\Models\InventoryItem;
use App\Models\PetReport;
use App\Models\ShelterAnimal;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('admin reports analytics page renders and loads expanded telemetry data', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();

    Donation::create([
        'public_reference' => 'REF-COMP',
        'donor_name' => 'Completed Donor',
        'donor_email' => 'completed@example.com',
        'type' => DonationType::Cash->value,
        'amount' => 500,
        'status' => DonationStatus::Completed->value,
    ]);

    Donation::create([
        'public_reference' => 'REF-INKIND',
        'donor_name' => 'InKind Donor',
        'donor_email' => 'inkind@example.com',
        'type' => DonationType::InKind->value,
        'amount' => null,
        'status' => DonationStatus::Verified->value,
    ]);

    Donation::create([
        'public_reference' => 'REF-SPONSOR',
        'donor_name' => 'Sponsor Donor',
        'donor_email' => 'sponsor@example.com',
        'type' => DonationType::FeedingSponsorship->value,
        'amount' => 1200,
        'status' => DonationStatus::Completed->value,
    ]);

    $animal = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Available->value,
        'vaccinated' => true,
    ]);

    $fosterParent = FosterParent::factory()->create([
        'status' => 'approved',
        'capacity' => 4,
    ]);

    FosterPlacement::factory()->create([
        'shelter_animal_id' => $animal->id,
        'foster_parent_id' => $fosterParent->id,
        'status' => 'active',
    ]);

    AssignedTask::factory()->create([
        'user_id' => $volunteer->id,
        'status' => 'completed',
        'hours_logged' => 6.5,
    ]);

    InventoryItem::create([
        'name' => 'Puppy Kibble Bag',
        'quantity' => 2,
        'min_threshold' => 10,
        'unit' => 'bags',
        'category' => 'food',
    ]);

    PetReport::factory()->create([
        'location' => 'Iligan City Plaza',
        'status' => 'resolved',
    ]);

    HelpDeskTicket::factory()->create([
        'status' => 'open',
    ]);

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
            ->has('dateRange')
            ->has('kpis')
            ->has('shelterCensus')
            ->has('fosterMetrics')
            ->has('volunteerImpact')
            ->has('communityMetrics')
            ->has('inventorySustainability')
            ->has('topRescueLocations')
            ->has('adminInsights', fn (Assert $insights) => $insights
                ->has('animalCare')
                ->has('rescueFunnel')
                ->has('adoptionPipeline')
                ->has('fosterVolunteerOps')
                ->has('donationsAndSupport')
            )
            ->where('donationBreakdown.cash', 1)
            ->where('donationBreakdown.inkind', 1)
            ->where('donationBreakdown.sponsor', 1)
            ->where('summary.donations.total_cash', 500)
            ->where('shelterCensus.total', 1)
            ->where('fosterMetrics.active_placements', 1)
            ->where('inventorySustainability.low_stock_count', 1)
            ->where('communityMetrics.help_desk_open', 1)
        );
});

test('admin reports analytics supports custom date range filtering', function () {
    $admin = User::factory()->admin()->create();

    $start = now()->subDays(10)->toDateString();
    $end = now()->toDateString();

    $response = $this->actingAs($admin)
        ->get(route('account.admin.reports-analytics', [
            'period' => 'custom',
            'start_date' => $start,
            'end_date' => $end,
        ]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/reports-analytics')
            ->where('period', 'custom')
            ->where('dateRange.start', $start)
            ->where('dateRange.end', $end)
        );
});

test('admin can export summary, operations, and full reports as csv', function (string $type, string $expectedHeader) {
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
        ->get(route('account.admin.reports-analytics.export', ['type' => $type]));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    $disposition = $response->headers->get('Content-Disposition');
    expect($disposition)->toContain("attachment; filename=\"pawlse_{$type}_report_")
        ->and($disposition)->toEndWith('.csv"');

    $content = $response->streamedContent();
    expect($content)->toContain($expectedHeader);
})->with([
    'summary' => ['summary', 'PAWLSE ANIMAL WELFARE PLATFORM OVERVIEW SUMMARY REPORT'],
    'operations' => ['operations', 'PAWLSE SHELTER OPERATIONS, FOSTER & FIELD IMPACT REPORT'],
    'full' => ['full', 'SHELTER CENSUS & OPERATIONS BREAKDOWN'],
]);

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

test('admin can generate modernized pdf report with embedded logos and full details', function () {
    $admin = User::factory()->admin()->create(['name' => 'Maria Clara']);

    PetReport::factory()->create([
        'type' => 'rescue',
        'animal_type' => 'dog',
        'location' => 'Tibanga Highway Zone 2',
        'status' => 'resolved',
    ]);

    Donation::create([
        'public_reference' => 'REF-PDF-101',
        'donor_name' => 'Elena Rostova',
        'donor_email' => 'elena@example.com',
        'type' => DonationType::Cash->value,
        'amount' => 3250,
        'status' => DonationStatus::Verified->value,
    ]);

    InventoryItem::create([
        'name' => 'Antiseptic Spray',
        'quantity' => 1,
        'min_threshold' => 5,
        'unit' => 'bottles',
        'category' => 'medical',
    ]);

    $response = $this->actingAs($admin)
        ->get(route('account.admin.reports-analytics.pdf', ['period' => '30d']));

    $response->assertOk()
        ->assertSee('Executive Shelter & Operations Report')
        ->assertSee('Admin Operational Modules Breakdown')
        ->assertSee('background: transparent;', false)
        ->assertSee('data:image/png;base64,', false)
        ->assertSee('<svg', false)
        ->assertSee('Maria Clara')
        ->assertSee('Tibanga Highway Zone 2')
        ->assertSee('Elena Rostova')
        ->assertSee('REF-PDF-101')
        ->assertSee('Antiseptic Spray');
});

test('admin pdf report supports section filtering', function (string $section, string $expectedTitle) {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('account.admin.reports-analytics.pdf', ['section' => $section]))
        ->assertOk()
        ->assertSee($expectedTitle);
})->with([
    'rescues' => ['rescues', 'Rescue & Emergency Response Report'],
    'adoptions' => ['adoptions', 'Adoptions & Placement Pipeline Report'],
    'donations' => ['donations', 'Financial Donations & Sustainability Report'],
    'operations' => ['operations', 'Shelter Census, Foster & Field Ops Report'],
]);

test('unauthorized users and admins without export permission cannot export pdf or csv reports', function () {
    $regularUser = User::factory()->user()->create();

    $this->actingAs($regularUser)
        ->get(route('account.admin.reports-analytics'))
        ->assertForbidden();

    $this->actingAs($regularUser)
        ->get(route('account.admin.reports-analytics.pdf'))
        ->assertForbidden();

    $adminWithoutExport = User::factory()->admin()->create([
        'revoked_permissions' => ['analytics.export'],
    ]);

    $this->actingAs($adminWithoutExport)
        ->get(route('account.admin.reports-analytics'))
        ->assertOk();

    $this->actingAs($adminWithoutExport)
        ->get(route('account.admin.reports-analytics.pdf'))
        ->assertForbidden();

    $this->actingAs($adminWithoutExport)
        ->get(route('account.admin.reports-analytics.export'))
        ->assertForbidden();
});
