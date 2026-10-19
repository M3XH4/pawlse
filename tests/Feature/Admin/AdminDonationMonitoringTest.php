<?php

use App\Models\Donation;
use App\Models\InKindDonation;
use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Pagination\AbstractPaginator;

test('admin can view donation monitoring and inventory logs', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('account.admin.donation-monitoring'));
    $response->assertOk();
});

test('admin can create a new inventory item with initial batch and expiry date', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('account.admin.donation-monitoring.inventory.store'), [
        'name' => 'Canine Distemper Vaccine',
        'unit' => 'vials',
        'category' => 'Medicine',
        'min_threshold' => 10,
        'storage_location' => 'Medicine Fridge A',
        'initial_quantity' => 20,
        'batch_number' => 'LOT-VAC-2026',
        'expires_at' => now()->addMonths(6)->toDateString(),
    ]);

    $response->assertSessionHasNoErrors();
    $item = InventoryItem::where('name', 'Canine Distemper Vaccine')->first();
    expect($item)->not->toBeNull();
    expect($item->quantity)->toBe(20);
    expect($item->min_threshold)->toBe(10);
    expect($item->storage_location)->toBe('Medicine Fridge A');
    expect($item->has_expiry)->toBeTrue();

    $batch = InventoryBatch::where('inventory_item_id', $item->id)->first();
    expect($batch)->not->toBeNull();
    expect($batch->batch_number)->toBe('LOT-VAC-2026');
    expect($batch->quantity)->toBe(20);
    expect($batch->initial_quantity)->toBe(20);
    expect($batch->expires_at->toDateString())->toBe(now()->addMonths(6)->toDateString());
});

test('admin can update inventory item metadata', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->admin()->create();

    $item = InventoryItem::create([
        'name' => 'Generic Kibble',
        'unit' => 'kg',
        'category' => 'Food',
        'quantity' => 10,
        'min_threshold' => 5,
        'storage_location' => 'Shelf 1',
    ]);

    $response = $this->actingAs($admin)->put(route('account.admin.donation-monitoring.inventory.update', $item), [
        'name' => 'Premium Puppy Kibble',
        'unit' => 'kg',
        'category' => 'Food',
        'min_threshold' => 15,
        'storage_location' => 'Pantry Shelf 2',
        'has_expiry' => true,
    ]);

    $response->assertSessionHasNoErrors();
    $item->refresh();
    expect($item->name)->toBe('Premium Puppy Kibble');
    expect($item->min_threshold)->toBe(15);
    expect($item->storage_location)->toBe('Pantry Shelf 2');
    expect($item->has_expiry)->toBeTrue();
});

test('admin can delete an inventory item and cascade its batches', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->admin()->create();

    $item = InventoryItem::create([
        'name' => 'Old Leashes',
        'unit' => 'pcs',
        'category' => 'Supplies',
        'quantity' => 5,
    ]);

    $batch = InventoryBatch::create([
        'inventory_item_id' => $item->id,
        'batch_number' => 'LOT-LEASH',
        'quantity' => 5,
        'initial_quantity' => 5,
        'status' => 'active',
    ]);

    $response = $this->actingAs($admin)->delete(route('account.admin.donation-monitoring.inventory.destroy', $item));
    $response->assertSessionHasNoErrors();

    $this->assertDatabaseMissing('inventory_items', ['id' => $item->id]);
    $this->assertDatabaseMissing('inventory_batches', ['id' => $batch->id]);
});

test('admin can add multiple batches with different expiry dates to the same item', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->admin()->create();

    $item = InventoryItem::create([
        'name' => 'Antibiotic Ointment',
        'unit' => 'tubes',
        'category' => 'Medicine',
        'quantity' => 0,
        'has_expiry' => true,
    ]);

    // Batch 1: Expiring in 20 days (Expiring soon)
    $this->actingAs($admin)->post(route('account.admin.donation-monitoring.inventory.batches.store', $item), [
        'quantity' => 5,
        'batch_number' => 'BATCH-A',
        'expires_at' => now()->addDays(20)->toDateString(),
        'received_at' => now()->toDateString(),
        'source' => 'Vet Supplier',
    ]);

    // Batch 2: Expiring in 180 days (Fresh)
    $this->actingAs($admin)->post(route('account.admin.donation-monitoring.inventory.batches.store', $item), [
        'quantity' => 10,
        'batch_number' => 'BATCH-B',
        'expires_at' => now()->addDays(180)->toDateString(),
        'received_at' => now()->toDateString(),
        'source' => 'Direct Purchase',
    ]);

    $item->refresh();
    expect($item->quantity)->toBe(15);
    expect($item->batches)->toHaveCount(2);

    $response = $this->actingAs($admin)->get(route('account.admin.donation-monitoring'));
    $response->assertOk();
    $pageProps = $response->viewData('page')['props'];
    $inventoryItems = $pageProps['inventory'] instanceof AbstractPaginator
        ? $pageProps['inventory']->items()
        : ($pageProps['inventory']['data'] ?? $pageProps['inventory']);
    $fetchedItem = collect($inventoryItems)->firstWhere('id', $item->id);
    expect($fetchedItem['stock_status'])->toBe('expiring_soon');
    expect($fetchedItem['nearest_expiry'])->toBe(now()->addDays(20)->toDateString());
});

test('admin can dispense stock or write-off expired stock from a specific batch', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->admin()->create();

    $item = InventoryItem::create([
        'name' => 'Cat Vitamins',
        'unit' => 'bottles',
        'category' => 'Medicine',
        'quantity' => 10,
        'has_expiry' => true,
    ]);

    $batch = InventoryBatch::create([
        'inventory_item_id' => $item->id,
        'batch_number' => 'EXP-BATCH-01',
        'quantity' => 10,
        'initial_quantity' => 10,
        'expires_at' => now()->subDays(5)->toDateString(), // Expired
        'status' => 'expired',
    ]);

    // Write-off 4 expired units
    $response = $this->actingAs($admin)->post(route('account.admin.donation-monitoring.inventory.batches.adjust', $batch), [
        'action_type' => 'expired_writeoff',
        'quantity' => 4,
        'reason' => 'Disposed expired batch',
    ]);

    $response->assertSessionHasNoErrors();
    $batch->refresh();
    $item->refresh();

    expect($batch->quantity)->toBe(6);
    expect($item->quantity)->toBe(6);

    $log = InventoryLog::where('inventory_item_id', $item->id)->latest()->first();
    expect($log->action)->toBe('expired_writeoff');
    expect($log->quantity_changed)->toBe(-4);
    expect($log->resulting_quantity)->toBe(6);
});

test('admin can adjust stock using FEFO automated deduction across batches', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->admin()->create();

    $item = InventoryItem::create([
        'name' => 'Wet Food Cans',
        'unit' => 'cans',
        'category' => 'Food',
        'quantity' => 15,
        'has_expiry' => true,
    ]);

    // Batch 1: Expiring earliest (5 cans)
    $batch1 = InventoryBatch::create([
        'inventory_item_id' => $item->id,
        'batch_number' => 'EARLIEST',
        'quantity' => 5,
        'initial_quantity' => 5,
        'expires_at' => now()->addDays(10),
        'status' => 'active',
    ]);

    // Batch 2: Expiring later (10 cans)
    $batch2 = InventoryBatch::create([
        'inventory_item_id' => $item->id,
        'batch_number' => 'LATER',
        'quantity' => 10,
        'initial_quantity' => 10,
        'expires_at' => now()->addDays(60),
        'status' => 'active',
    ]);

    // Deduct 7 cans via FEFO: should deplete all 5 of batch1 and 2 of batch2
    $response = $this->actingAs($admin)->post(route('account.admin.donation-monitoring.inventory.adjust', $item->id), [
        'quantity_changed' => -7,
        'reason' => 'Fed all shelter dogs today',
    ]);

    $response->assertSessionHasNoErrors();
    $item->refresh();
    $batch1->refresh();
    $batch2->refresh();

    expect($item->quantity)->toBe(8);
    expect($batch1->quantity)->toBe(0);
    expect($batch1->status)->toBe('depleted');
    expect($batch2->quantity)->toBe(8);
});

test('admin can verify in-kind donation with batch lot number and expiry date into inventory', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->admin()->create();

    $donation = Donation::create([
        'public_reference' => 'DON-INKIND-EXP',
        'donor_name' => 'Bob Donor',
        'donor_email' => 'bob@example.com',
        'type' => 'in_kind',
        'status' => 'pending_verification',
    ]);

    $inKind = InKindDonation::create([
        'donation_id' => $donation->id,
        'description' => '12 Cans Salmon Cat Food',
        'drop_off_date' => '2026-09-15',
        'contact_person' => 'Bob',
        'status' => 'scheduled',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.donation-monitoring.in-kind.verify', $donation->id), [
        'itemName' => 'Salmon Cat Food',
        'quantity' => 12,
        'unit' => 'cans',
        'category' => 'Food',
        'batch_number' => 'LOT-SALMON-99',
        'expires_at' => now()->addMonths(12)->toDateString(),
        'storage_location' => 'Pantry Shelf C',
    ]);

    $response->assertSessionHasNoErrors();
    $donation->refresh();
    $inKind->refresh();

    expect($donation->status)->toBe('completed');
    expect($inKind->status)->toBe('verified');
    expect($inKind->quantity)->toBe('12 cans');

    $item = InventoryItem::where('name', 'Salmon Cat Food')->first();
    expect($item)->not->toBeNull();
    expect($item->quantity)->toBe(12);
    expect($item->storage_location)->toBe('Pantry Shelf C');
    expect($item->has_expiry)->toBeTrue();

    $batch = InventoryBatch::where('inventory_item_id', $item->id)->first();
    expect($batch)->not->toBeNull();
    expect($batch->batch_number)->toBe('LOT-SALMON-99');
    expect($batch->quantity)->toBe(12);
    expect($batch->expires_at->toDateString())->toBe(now()->addMonths(12)->toDateString());

    $log = InventoryLog::where('inventory_item_id', $item->id)->first();
    expect($log)->not->toBeNull();
    expect($log->action)->toBe('donation_received');
    expect($log->batch_info)->toContain('LOT-SALMON-99');
});

test('admin can verify cash donation and mark as completed', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->admin()->create();

    $donation = Donation::create([
        'public_reference' => 'DON-CASH-VERIFY',
        'donor_name' => 'Charlie Cash',
        'donor_email' => 'charlie@example.com',
        'type' => 'cash',
        'amount' => 1500,
        'status' => 'pending_verification',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.donation-monitoring.verify-cash', $donation));

    $response->assertSessionHasNoErrors();
    $donation->refresh();

    expect($donation->status)->toBe('completed');
    expect($donation->verified_at)->not->toBeNull();
    expect($donation->verified_by)->toBe($admin->id);
});

test('admin can reject donation with reason', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->admin()->create();

    $donation = Donation::create([
        'public_reference' => 'DON-REJECT-01',
        'donor_name' => 'Fake Donor',
        'donor_email' => 'fake@example.com',
        'type' => 'cash',
        'amount' => 500,
        'status' => 'pending_verification',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.donation-monitoring.reject', $donation), [
        'reason' => 'Invalid transaction slip uploaded',
    ]);

    $response->assertSessionHasNoErrors();
    $donation->refresh();

    expect($donation->status)->toBe('rejected');
    expect($donation->rejection_reason)->toBe('Invalid transaction slip uploaded');
});

test('admin donation monitoring correctly paginates donations, inventory, and audit logs', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->admin()->create();

    // Create 15 donation records (page size 10)
    for ($i = 1; $i <= 15; $i++) {
        Donation::create([
            'public_reference' => "DON-PAGINATE-{$i}",
            'donor_name' => "Donor {$i}",
            'donor_email' => "donor{$i}@example.com",
            'type' => 'cash',
            'amount' => 100 * $i,
            'status' => 'completed',
        ]);
    }

    // Create 12 inventory items (page size 10)
    for ($i = 1; $i <= 12; $i++) {
        $item = InventoryItem::create([
            'name' => "Item Paginate {$i}",
            'unit' => 'units',
            'category' => 'Supplies',
            'quantity' => 10,
            'has_expiry' => false,
        ]);

        // Create 2 audit logs per item = 24 logs (page size 15)
        InventoryLog::create([
            'inventory_item_id' => $item->id,
            'user_id' => $admin->id,
            'action' => 'stock_added',
            'quantity_changed' => 10,
            'resulting_quantity' => 10,
            'reason' => "Initial stock for item {$i}",
        ]);
    }

    // Test first page
    $response = $this->actingAs($admin)->get(route('account.admin.donation-monitoring'));
    $response->assertOk();

    $pageProps = $response->viewData('page')['props'];

    $donations = $pageProps['donations'];
    $inventory = $pageProps['inventory'];
    $logs = $pageProps['inventoryLogs'];

    $donationsTotal = is_array($donations) ? $donations['total'] : $donations->total();
    $donationsCount = is_array($donations) ? count($donations['data']) : $donations->count();

    $inventoryTotal = is_array($inventory) ? $inventory['total'] : $inventory->total();
    $inventoryCount = is_array($inventory) ? count($inventory['data']) : $inventory->count();

    $logsTotal = is_array($logs) ? $logs['total'] : $logs->total();
    $logsCount = is_array($logs) ? count($logs['data']) : $logs->count();

    expect($donationsTotal)->toBe(15);
    expect($donationsCount)->toBe(10);

    expect($inventoryTotal)->toBe(12);
    expect($inventoryCount)->toBe(10);

    expect($logsTotal)->toBe(12);
    expect($logsCount)->toBe(12);
});
