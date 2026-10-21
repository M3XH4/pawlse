<?php

namespace Database\Seeders;

use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@pawlse.test')->first() ?? User::first();
        $adminId = $admin ? $admin->id : null;

        $items = [
            [
                'name' => 'Adult Dog Kibble',
                'quantity' => 150,
                'unit' => 'kg',
                'category' => 'Food',
                'min_threshold' => 30,
                'daily_usage_rate' => 5.0,
                'storage_location' => 'Dry Pantry - Shelf A',
                'has_expiry' => true,
                'batches' => [
                    [
                        'batch_number' => 'BATCH-2026-KIB01',
                        'initial_quantity' => 200,
                        'quantity' => 150,
                        'received_at' => Carbon::now()->subDays(15),
                        'expires_at' => Carbon::now()->addMonths(8),
                        'source' => 'Purchased from Pet Food Wholesale',
                        'notes' => 'General shelter feeding stock',
                    ],
                ],
                'logs' => [
                    ['action' => 'added', 'change' => 200, 'reason' => 'Initial stock purchase'],
                    ['action' => 'removed', 'change' => -50, 'reason' => 'Weekly feeding supplies distribution'],
                ],
            ],
            [
                'name' => 'Cat Wet Food Cans (Tuna)',
                'quantity' => 80,
                'unit' => 'cans',
                'category' => 'Food',
                'min_threshold' => 20,
                'daily_usage_rate' => 3.0,
                'storage_location' => 'Cattery Pantry Shelf 1',
                'has_expiry' => true,
                'batches' => [
                    [
                        'batch_number' => 'BATCH-2026-CAT-SOON',
                        'initial_quantity' => 30,
                        'quantity' => 25,
                        'received_at' => Carbon::now()->subDays(40),
                        'expires_at' => Carbon::now()->addDays(20), // Expiring soon (< 30 days)
                        'source' => 'In-kind donation #DON-179250001-KITT',
                        'notes' => 'Priority: expiring soon, use for cattery weaning kittens',
                    ],
                    [
                        'batch_number' => 'BATCH-2026-CAT-02',
                        'initial_quantity' => 55,
                        'quantity' => 55,
                        'received_at' => Carbon::now()->subDays(5),
                        'expires_at' => Carbon::now()->addMonths(6),
                        'source' => 'In-kind donation #DON-179250002-LUNA',
                        'notes' => 'Fresh sealed donation drop-off',
                    ],
                ],
                'logs' => [
                    ['action' => 'donation_received', 'change' => 30, 'reason' => 'In-kind donation from John Doe (Batch #1)'],
                    ['action' => 'removed', 'change' => -5, 'reason' => 'Cattery feeding'],
                    ['action' => 'donation_received', 'change' => 55, 'reason' => 'In-kind donation from Jane Smith (Batch #2)'],
                ],
            ],
            [
                'name' => 'Anti-Rabies Vaccines',
                'quantity' => 25,
                'unit' => 'vials',
                'category' => 'Medicine',
                'min_threshold' => 10,
                'daily_usage_rate' => 0.5,
                'storage_location' => 'Vaccine Refrigerator 1 (2-8°C)',
                'has_expiry' => true,
                'batches' => [
                    [
                        'batch_number' => 'LOT-VAC-2026-08A',
                        'initial_quantity' => 15,
                        'quantity' => 10,
                        'received_at' => Carbon::now()->subDays(60),
                        'expires_at' => Carbon::now()->addDays(18), // Expiring soon (< 30 days)
                        'source' => 'Veterinary supplier delivery',
                        'notes' => 'Priority for upcoming weekend stray vaccination drive',
                    ],
                    [
                        'batch_number' => 'LOT-VAC-2026-12B',
                        'initial_quantity' => 15,
                        'quantity' => 15,
                        'received_at' => Carbon::now()->subDays(10),
                        'expires_at' => Carbon::now()->addMonths(9),
                        'source' => 'In-kind donation from FurPet Clinic',
                        'notes' => 'Cold-chain verified upon drop-off',
                    ],
                ],
                'logs' => [
                    ['action' => 'added', 'change' => 15, 'reason' => 'Purchased from veterinary distributor'],
                    ['action' => 'removed', 'change' => -5, 'reason' => 'Vaccinated newly admitted rescue dogs'],
                    ['action' => 'donation_received', 'change' => 15, 'reason' => 'Received from FurPet Clinic in-kind drop-off'],
                ],
            ],
            [
                'name' => 'Deworming Tablets',
                'quantity' => 120,
                'unit' => 'tablets',
                'category' => 'Medicine',
                'min_threshold' => 25,
                'daily_usage_rate' => 2.0,
                'storage_location' => 'Medicine Cabinet - Shelf 2',
                'has_expiry' => true,
                'batches' => [
                    [
                        'batch_number' => 'BATCH-2026-DEW01',
                        'initial_quantity' => 120,
                        'quantity' => 120,
                        'received_at' => Carbon::now()->subDays(12),
                        'expires_at' => Carbon::now()->addMonths(14),
                        'source' => 'Shelter Veterinary Purchase',
                        'notes' => 'General deworming inventory for rescue intakes',
                    ],
                ],
                'logs' => [
                    ['action' => 'added', 'change' => 120, 'reason' => 'Initial inventory setup'],
                ],
            ],
            [
                'name' => 'Nylon Dog Collars (Medium)',
                'quantity' => 18,
                'unit' => 'pieces',
                'category' => 'Supplies',
                'min_threshold' => 5,
                'daily_usage_rate' => 0.2,
                'storage_location' => 'Grooming & Gear Box 3',
                'has_expiry' => false,
                'batches' => [
                    [
                        'batch_number' => 'BATCH-2026-COL01',
                        'initial_quantity' => 20,
                        'quantity' => 18,
                        'received_at' => Carbon::now()->subDays(20),
                        'expires_at' => null,
                        'source' => 'Ordered online',
                        'notes' => 'Non-perishable gear',
                    ],
                ],
                'logs' => [
                    ['action' => 'added', 'change' => 20, 'reason' => 'Ordered online'],
                    ['action' => 'removed', 'change' => -2, 'reason' => 'Used on Cooper and Bella'],
                ],
            ],
            [
                'name' => 'Stainless Steel Feeding Bowls',
                'quantity' => 30,
                'unit' => 'pieces',
                'category' => 'Supplies',
                'min_threshold' => 10,
                'daily_usage_rate' => 0.1,
                'storage_location' => 'Feeding Station Rack B',
                'has_expiry' => false,
                'batches' => [
                    [
                        'batch_number' => 'BATCH-2026-BWL01',
                        'initial_quantity' => 30,
                        'quantity' => 30,
                        'received_at' => Carbon::now()->subDays(14),
                        'expires_at' => null,
                        'source' => 'Community pet supply drive',
                        'notes' => 'Durable dishwasher-safe feeding bowls',
                    ],
                ],
                'logs' => [
                    ['action' => 'added', 'change' => 30, 'reason' => 'Donation received at pet drive'],
                ],
            ],
        ];

        foreach ($items as $itemData) {
            $logs = $itemData['logs'];
            $batches = $itemData['batches'];
            unset($itemData['logs'], $itemData['batches']);

            $item = InventoryItem::updateOrCreate(
                ['name' => $itemData['name']],
                $itemData
            );

            // Seed initial batches
            $createdBatches = [];
            foreach ($batches as $batchData) {
                $batch = InventoryBatch::updateOrCreate(
                    [
                        'inventory_item_id' => $item->id,
                        'batch_number' => $batchData['batch_number'],
                    ],
                    array_merge($batchData, [
                        'status' => 'active',
                    ])
                );
                $createdBatches[] = $batch;
            }

            // Calculate and set verified batch sum quantity
            $totalBatchQty = collect($createdBatches)->sum('quantity');
            $item->update(['quantity' => $totalBatchQty]);

            // Seed logs
            $currentQty = 0;
            $firstBatch = $createdBatches[0] ?? null;
            foreach ($logs as $logData) {
                $currentQty += $logData['change'];
                InventoryLog::create([
                    'inventory_item_id' => $item->id,
                    'inventory_batch_id' => $firstBatch?->id,
                    'user_id' => $adminId,
                    'action' => $logData['action'],
                    'quantity_changed' => $logData['change'],
                    'resulting_quantity' => $currentQty,
                    'reason' => $logData['reason'],
                    'batch_info' => $firstBatch ? 'Batch: '.$firstBatch->batch_number.($firstBatch->expires_at ? ' (Exp: '.$firstBatch->expires_at->format('Y-m-d').')' : '') : null,
                ]);
            }
        }
    }
}
