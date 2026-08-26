<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use App\Models\InventoryLog;
use App\Models\User;
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
                'logs' => [
                    ['action' => 'donation_received', 'change' => 100, 'reason' => 'In-kind donation from John Doe'],
                    ['action' => 'removed', 'change' => -20, 'reason' => 'Cattery daily feeding'],
                ],
            ],
            [
                'name' => 'Anti-Rabies Vaccines',
                'quantity' => 25,
                'unit' => 'vials',
                'category' => 'Medicine',
                'logs' => [
                    ['action' => 'added', 'change' => 30, 'reason' => 'Purchased from veterinary distributor'],
                    ['action' => 'removed', 'change' => -5, 'reason' => 'Vaccinated newly admitted rescue dogs'],
                ],
            ],
            [
                'name' => 'Deworming Tablets',
                'quantity' => 120,
                'unit' => 'tablets',
                'category' => 'Medicine',
                'logs' => [
                    ['action' => 'added', 'change' => 120, 'reason' => 'Initial inventory setup'],
                ],
            ],
            [
                'name' => 'Nylon Dog Collars (Medium)',
                'quantity' => 18,
                'unit' => 'pieces',
                'category' => 'Supplies',
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
                'logs' => [
                    ['action' => 'added', 'change' => 30, 'reason' => 'Donation received at pet drive'],
                ],
            ],
        ];

        foreach ($items as $itemData) {
            $logs = $itemData['logs'];
            unset($itemData['logs']);

            $item = InventoryItem::create($itemData);

            $currentQty = 0;
            foreach ($logs as $logData) {
                $currentQty += $logData['change'];
                InventoryLog::create([
                    'inventory_item_id' => $item->id,
                    'user_id' => $adminId,
                    'action' => $logData['action'],
                    'quantity_changed' => $logData['change'],
                    'resulting_quantity' => $currentQty,
                    'reason' => $logData['reason'],
                ]);
            }

            // Ensure the item quantity matches the last log's resulting quantity
            $item->update(['quantity' => $currentQty]);
        }
    }
}
