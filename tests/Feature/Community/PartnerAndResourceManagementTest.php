<?php

use App\Models\CommunityHonor;
use App\Models\Partner;
use App\Models\ResourceFile;
use App\Models\SystemSetting;
use App\Models\User;
use Database\Seeders\PartnerAndResourceSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->regularUser = User::factory()->create();
});

test('unauthenticated guests and non-super-admins cannot access partner, resource, or honor management', function () {
    // Guest
    $this->get(route('account.super-admin.partners'))->assertRedirect(route('login'));
    $this->get(route('account.super-admin.resources'))->assertRedirect(route('login'));
    $this->get(route('account.super-admin.community-honors'))->assertRedirect(route('login'));

    // Regular user
    $this->actingAs($this->regularUser)
        ->get(route('account.super-admin.partners'))
        ->assertForbidden();

    $this->actingAs($this->regularUser)
        ->get(route('account.super-admin.resources'))
        ->assertForbidden();

    $this->actingAs($this->regularUser)
        ->get(route('account.super-admin.community-honors'))
        ->assertForbidden();
});

test('super admin can view partner management list with filters and stats', function () {
    Partner::factory()->count(3)->create();

    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.partners'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/partner-management')
            ->has('partners.data')
            ->has('stats.total')
            ->has('stats.veterinary')
            ->has('stats.food_supply')
            ->has('stats.emergency')
        );
});

test('super admin can create, update, toggle status, archive and restore a partner', function () {
    // 1. Create Partner
    $response = $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.partners.store'), [
            'name' => 'Bay Area Vet Care',
            'category' => 'veterinary',
            'badge_title' => 'Emergency Rescue Partner',
            'badges' => ['Emergency Option', 'Trauma Unit'],
            'short_description' => 'Reliable partner for critical animal care',
            'address' => 'Tibanga Highway',
            'city' => 'Iligan City',
            'phone' => '+63 912 345 6789',
            'operating_hours' => '24/7 Emergency',
            'services' => ['Surgery', 'Emergency Care'],
            'is_emergency' => true,
            'is_featured' => true,
            'is_active' => true,
            'display_order' => 1,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('partners', [
        'name' => 'Bay Area Vet Care',
        'is_emergency' => true,
        'is_featured' => true,
    ]);

    $partner = Partner::where('name', 'Bay Area Vet Care')->first();

    // 2. Update Partner
    $this->actingAs($this->superAdmin)
        ->put(route('account.super-admin.partners.update', $partner), [
            'name' => 'Bay Area Vet Care Updated',
            'category' => 'veterinary',
            'badge_title' => 'Emergency Partner',
            'badges' => ['Emergency Option'],
            'address' => 'Updated Tibanga Address',
            'city' => 'Iligan City',
            'phone' => '+63 999 999 9999',
            'is_emergency' => false,
            'is_featured' => false,
            'is_active' => true,
            'display_order' => 2,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('partners', [
        'id' => $partner->id,
        'name' => 'Bay Area Vet Care Updated',
        'is_emergency' => false,
    ]);

    // 3. Toggle Status
    $this->actingAs($this->superAdmin)
        ->patch(route('account.super-admin.partners.toggle-status', $partner))
        ->assertRedirect();

    expect($partner->fresh()->is_active)->toBeFalse();

    // 4. Archive (Soft Delete)
    $this->actingAs($this->superAdmin)
        ->delete(route('account.super-admin.partners.destroy', $partner))
        ->assertRedirect();

    expect($partner->fresh()->trashed())->toBeTrue();

    // 5. Restore
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.partners.restore', $partner->id))
        ->assertRedirect();

    expect($partner->fresh()->trashed())->toBeFalse();
});

test('super admin can create, update, toggle status, archive and restore a resource file', function () {
    // 1. Create Resource
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.resources.store'), [
            'title' => 'Feline Nutrition and Special Diets',
            'category' => 'care_guide',
            'badge' => 'ISF OFFICIAL GUIDE',
            'description' => 'Comprehensive dietary information for recovering rescued cats.',
            'content' => 'High protein diet instructions and portion controls.',
            'file_name' => 'Feline-Diets-Guide.pdf',
            'file_size' => '1.2 MB',
            'file_type' => 'pdf',
            'is_featured' => true,
            'is_active' => true,
            'display_order' => 1,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('resource_files', [
        'title' => 'Feline Nutrition and Special Diets',
        'category' => 'care_guide',
    ]);

    $resource = ResourceFile::where('title', 'Feline Nutrition and Special Diets')->first();

    // 2. Update Resource
    $this->actingAs($this->superAdmin)
        ->put(route('account.super-admin.resources.update', $resource), [
            'title' => 'Feline Nutrition and Special Diets (Updated)',
            'category' => 'care_guide',
            'badge' => 'UPDATED GUIDE',
            'description' => 'Updated dietary info.',
            'file_name' => 'Feline-Diets-Guide-v2.pdf',
            'is_featured' => false,
            'is_active' => true,
            'display_order' => 2,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('resource_files', [
        'id' => $resource->id,
        'title' => 'Feline Nutrition and Special Diets (Updated)',
    ]);

    // 3. Toggle Status
    $this->actingAs($this->superAdmin)
        ->patch(route('account.super-admin.resources.toggle-status', $resource))
        ->assertRedirect();

    expect($resource->fresh()->is_active)->toBeFalse();

    // 4. Archive (Soft Delete)
    $this->actingAs($this->superAdmin)
        ->delete(route('account.super-admin.resources.destroy', $resource))
        ->assertRedirect();

    expect($resource->fresh()->trashed())->toBeTrue();

    // 5. Restore
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.resources.restore', $resource->id))
        ->assertRedirect();

    expect($resource->fresh()->trashed())->toBeFalse();
});

test('super admin can manage community honors and update recognition metrics', function () {
    // 1. Create Community Honor
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.community-honors.store'), [
            'name' => 'Carlos Mendoza',
            'category' => 'donor',
            'tier' => 'gold',
            'role_title' => 'Monthly Sustainer',
            'description' => 'Sponsors medical supplies for rescue puppies.',
            'badges' => ['Recurring Donor', 'Foster Support'],
            'initials' => 'CM',
            'is_featured' => true,
            'is_public' => true,
            'display_order' => 1,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('community_honors', [
        'name' => 'Carlos Mendoza',
        'tier' => 'gold',
    ]);

    $honor = CommunityHonor::where('name', 'Carlos Mendoza')->first();

    // 2. Update Community Honor
    $this->actingAs($this->superAdmin)
        ->put(route('account.super-admin.community-honors.update', $honor), [
            'name' => 'Carlos Mendoza',
            'category' => 'donor',
            'tier' => 'platinum',
            'role_title' => 'Lifetime Sustainer',
            'description' => 'Updated description.',
            'badges' => ['Recurring Donor'],
            'initials' => 'CM',
            'is_featured' => true,
            'is_public' => true,
            'display_order' => 1,
        ])
        ->assertRedirect();

    expect($honor->fresh()->tier)->toBe('platinum');

    // 3. Update Recognition Metrics
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.community-honors.stats'), [
            'core_members_count' => 18,
            'active_volunteers_count' => 55,
            'on_call_volunteers_count' => 30,
            'meals_served_display' => '15k+',
            'pets_rescued_display' => '500+',
            'adoptions_display' => '95+',
            'active_zones_display' => '18',
        ])
        ->assertRedirect();

    $savedMetrics = SystemSetting::getValue('community_honor_stats');
    expect($savedMetrics['core_members_count'])->toBe(18)
        ->and($savedMetrics['meals_served_display'])->toBe('15k+');

    // 4. Delete Community Honor
    $this->actingAs($this->superAdmin)
        ->delete(route('account.super-admin.community-honors.destroy', $honor))
        ->assertRedirect();

    expect($honor->fresh()->trashed())->toBeTrue();
});

test('public vet care page renders successfully with partner clinics and care resources', function () {
    $this->seed(PartnerAndResourceSeeder::class);

    $this->get(route('vet'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('vet')
            ->has('featuredClinic')
            ->has('veterinaryClinics')
            ->has('emergencyClinics')
            ->has('petResources')
            ->has('vetOnRecord')
            ->has('stats')
            ->where('stats.vet_on_record', 1)
        );
});

test('public honor wall renders successfully with supporters and badge catalog', function () {
    $this->seed(PartnerAndResourceSeeder::class);

    $this->get(route('honor'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('honor')
            ->has('allHonors')
            ->has('recognizedSupporters')
            ->has('communitySupporters')
            ->has('volunteerStats')
            ->has('badgesCatalog')
        );
});

test('public about page renders successfully with partners network and community supporters', function () {
    $this->seed(PartnerAndResourceSeeder::class);

    $this->get(route('about'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('about')
            ->has('veterinaryPartners')
            ->has('foodSupplyPartners')
            ->has('auditPartners')
            ->has('featuredSupporters')
            ->has('networkStats')
        );
});

test('public resource download route increments download counter and returns file attachment', function () {
    $resource = ResourceFile::factory()->create([
        'title' => 'Emergency First Aid Guide',
        'file_name' => 'FirstAid.pdf',
        'download_count' => 5,
    ]);

    $response = $this->get(route('resources.download', $resource));

    $response->assertOk();
    $response->assertHeader('Content-Disposition', 'attachment; filename="FirstAid.pdf"');
    expect($resource->fresh()->download_count)->toBe(6);
});

test('public donate page passes auditPartner and supportingDocuments to view', function () {
    $auditPartner = Partner::factory()->create([
        'name' => 'Sycip, Gorres, Velayo & Co.',
        'category' => 'audit',
        'badge_title' => 'INDEPENDENT AUDITOR',
        'is_active' => true,
    ]);

    $auditDoc = ResourceFile::factory()->create([
        'title' => 'ISF Annual Financial Audit 2025',
        'category' => 'audit_report',
        'file_name' => 'ISF_Audit_2025.pdf',
        'is_active' => true,
    ]);

    $this->get(route('donate'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('donate')
            ->has('auditPartner')
            ->where('auditPartner.id', $auditPartner->id)
            ->where('auditPartner.name', 'Sycip, Gorres, Velayo & Co.')
            ->has('supportingDocuments', 1)
            ->where('supportingDocuments.0.title', 'ISF Annual Financial Audit 2025')
        );
});

test('super admin can create partner with audit or accounting category', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.partners.store'), [
            'name' => 'P&A Grant Thornton Philippines',
            'category' => 'audit',
            'badge_title' => 'VERIFIED AUDIT PARTNER',
            'city' => 'Cagayan de Oro / Iligan',
            'is_emergency' => false,
            'is_featured' => true,
            'is_active' => true,
            'display_order' => 1,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('partners', [
        'name' => 'P&A Grant Thornton Philippines',
        'category' => 'audit',
    ]);
});

test('super admin can create resource with audit_report or financial_audit category', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.resources.store'), [
            'title' => '2025 Q4 Financial Transparency Report',
            'category' => 'audit_report',
            'badge' => 'ANNUAL AUDIT',
            'description' => 'Summary of all cash and in-kind disbursements.',
            'file_name' => 'Audit_Report_Q4_2025.pdf',
            'is_featured' => true,
            'is_active' => true,
            'display_order' => 1,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('resource_files', [
        'title' => '2025 Q4 Financial Transparency Report',
        'category' => 'audit_report',
    ]);
});

test('super admin can upload partner image file when creating and updating partner', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->image('audit_firm.jpg', 600, 400);

    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.partners.store'), [
            'name' => 'Veritas Audit & Assurance',
            'category' => 'audit',
            'badge_title' => 'PRC-BOA ACCREDITED',
            'city' => 'Iligan City',
            'image' => $file,
            'is_emergency' => false,
            'is_featured' => true,
            'is_active' => true,
            'display_order' => 1,
        ])
        ->assertRedirect();

    $partner = Partner::where('name', 'Veritas Audit & Assurance')->first();
    expect($partner)->not->toBeNull();
    expect($partner->image_url)->toStartWith('/storage/partners/');

    $storagePath = str_replace('/storage/', '', $partner->image_url);
    Storage::disk('public')->assertExists($storagePath);

    // Update with new image
    $newFile = UploadedFile::fake()->image('audit_firm_updated.jpg', 800, 600);
    $this->actingAs($this->superAdmin)
        ->put(route('account.super-admin.partners.update', $partner), [
            'name' => 'Veritas Audit & Assurance Updated',
            'category' => 'audit',
            'image' => $newFile,
            'is_emergency' => false,
            'is_featured' => true,
            'is_active' => true,
            'display_order' => 1,
        ])
        ->assertRedirect();

    $updatedPartner = $partner->fresh();
    expect($updatedPartner->name)->toBe('Veritas Audit & Assurance Updated');
    $newStoragePath = str_replace('/storage/', '', $updatedPartner->image_url);
    Storage::disk('public')->assertExists($newStoragePath);
});

test('partner seeder seeds Valdez Accounting & Audit Partners and renders on donate transparency section', function () {
    $this->seed(PartnerAndResourceSeeder::class);

    $auditPartner = Partner::where('category', 'audit')
        ->where('slug', 'valdez-accounting-audit-partners')
        ->first();

    expect($auditPartner)->not->toBeNull();
    expect($auditPartner->name)->toBe('Valdez Accounting & Audit Partners, CPAs');
    expect($auditPartner->badge_title)->toBe('INDEPENDENT AUDITING PARTNER');
    expect($auditPartner->is_emergency)->toBeFalse();

    $this->get(route('donate'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('donate')
            ->has('auditPartner')
            ->where('auditPartner.name', 'Valdez Accounting & Audit Partners, CPAs')
        );
});
