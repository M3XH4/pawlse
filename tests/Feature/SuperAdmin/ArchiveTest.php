<?php

use App\Models\AuditLog;
use App\Models\CommunityHonor;
use App\Models\Partner;
use App\Models\ResourceFile;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->superAdmin = User::factory()->superAdmin()->create();
});

test('archives page lists archived partner, resource, and honor records with stats', function () {
    $partner = Partner::factory()->create();
    $partner->delete();

    $resource = ResourceFile::factory()->create();
    $resource->delete();

    $honor = CommunityHonor::factory()->create();
    $honor->delete();

    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.archives', ['type' => 'all']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/archives')
            ->has('stats')
            ->where('stats.partners', 1)
            ->where('stats.resources', 1)
            ->where('stats.honors', 1)
            ->has('items.data', 3)
        );
});

test('archives page can filter specifically by partner type', function () {
    $partner = Partner::factory()->create(['name' => 'PetCare Clinic']);
    $partner->delete();

    $resource = ResourceFile::factory()->create(['title' => 'First Aid Guide']);
    $resource->delete();

    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.archives', ['type' => 'partner']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/archives')
            ->has('items.data', 1)
            ->where('items.data.0.title', 'PetCare Clinic')
            ->where('items.data.0.type', 'partner')
        );
});

test('super admin can restore an archived partner and generate audit log', function () {
    $partner = Partner::factory()->create(['name' => 'City Shelter Supply']);
    $partner->delete();

    expect(Partner::onlyTrashed()->count())->toBe(1);

    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.archives.restore', ['type' => 'partner', 'id' => $partner->id]))
        ->assertRedirect();

    expect(Partner::onlyTrashed()->count())->toBe(0);
    expect(Partner::where('id', $partner->id)->exists())->toBeTrue();

    expect(AuditLog::where('action', 'archive_restore')->where('description', 'like', '%City Shelter Supply%')->exists())->toBeTrue();
});

test('super admin can force delete an archived resource file and generate audit log', function () {
    $resource = ResourceFile::factory()->create(['title' => 'Obsolete Guideline']);
    $resource->delete();

    expect(ResourceFile::withTrashed()->where('id', $resource->id)->exists())->toBeTrue();

    $this->actingAs($this->superAdmin)
        ->delete(route('account.super-admin.archives.force-delete', ['type' => 'resource', 'id' => $resource->id]))
        ->assertRedirect();

    expect(ResourceFile::withTrashed()->where('id', $resource->id)->exists())->toBeFalse();

    expect(AuditLog::where('action', 'archive_force_delete')->where('description', 'like', '%Obsolete Guideline%')->exists())->toBeTrue();
});
