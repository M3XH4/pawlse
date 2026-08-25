<?php

use App\Models\Donation;
use App\Models\InKindDonation;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use App\Models\User;
use Database\Seeders\RoleSeeder;

test('admin can view donation monitoring and inventory logs', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('account.admin.donation-monitoring'));
    $response->assertOk();
});

test('admin can verify in-kind donation and items are added to inventory', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->admin()->create();

    $donation = Donation::create([
        'public_reference' => 'DON-INKIND-TEST',
        'donor_name' => 'Alice InKind',
        'donor_email' => 'alice@example.com',
        'type' => 'in_kind',
        'status' => 'pending_verification',
    ]);

    $inKind = InKindDonation::create([
        'donation_id' => $donation->id,
        'description' => '5kg Premium dog food and blankets',
        'drop_off_date' => '2026-09-10',
        'contact_person' => 'Alice',
        'status' => 'scheduled',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.donation-monitoring.in-kind.verify', $donation->id), [
        'itemName' => 'Dog Food',
        'quantity' => 5,
        'unit' => 'kg',
        'category' => 'Food',
    ]);

    $donation->refresh();
    $inKind->refresh();

    expect($donation->status)->toBe('completed');
    expect($inKind->status)->toBe('verified');
    expect($inKind->quantity)->toBe('5 kg');

    $item = InventoryItem::where('name', 'Dog Food')->first();
    expect($item)->not->toBeNull();
    expect($item->quantity)->toBe(5);

    $log = InventoryLog::where('inventory_item_id', $item->id)->first();
    expect($log)->not->toBeNull();
    expect($log->action)->toBe('donation_received');
});

test('admin can adjust stock levels', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->admin()->create();

    $item = InventoryItem::create([
        'name' => 'Blankets',
        'quantity' => 10,
        'unit' => 'pcs',
        'category' => 'Supplies',
    ]);

    // adjust down
    $response = $this->actingAs($admin)->post(route('account.admin.donation-monitoring.inventory.adjust', $item->id), [
        'quantity_changed' => -3,
        'reason' => 'Distributed to cold puppies',
    ]);

    $item->refresh();
    expect($item->quantity)->toBe(7);

    $log = InventoryLog::where('inventory_item_id', $item->id)->latest()->first();
    expect($log->action)->toBe('removed');
    expect($log->quantity_changed)->toBe(-3);
    expect($log->resulting_quantity)->toBe(7);
});
