<?php

namespace App\Http\Controllers\Admin;

use App\Enums\DonationStatus;
use App\Enums\DonationType;
use App\Enums\InKindStatus;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Donation;
use App\Models\InventoryBatch;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use App\Notifications\DonationVerifiedNotification;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DonationMonitoringController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Donation::query()->with([
            'payments.proof',
            'proofs',
            'inKindDonation.need.animal',
            'feedingSponsorship',
            'user',
            'verifiedBy',
        ]);

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('public_reference', 'like', "%{$search}%")
                    ->orWhere('donor_name', 'like', "%{$search}%")
                    ->orWhere('donor_email', 'like', "%{$search}%")
                    ->orWhere('purpose', 'like', "%{$search}%");
            });
        }

        // Filter Type
        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter Status
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $donations = $query->latest('id')
            ->paginate(10)
            ->withQueryString();

        // Inventory items with batches
        $inventoryQuery = InventoryItem::with(['batches' => function ($q) {
            $q->orderByRaw('CASE WHEN expires_at IS NULL THEN 1 ELSE 0 END, expires_at ASC, created_at ASC');
        }]);

        if ($request->filled('inventory_search')) {
            $search = $request->input('inventory_search');
            $inventoryQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('storage_location', 'like', "%{$search}%")
                    ->orWhereHas('batches', function ($bq) use ($search) {
                        $bq->where('batch_number', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('inventory_category')) {
            $inventoryQuery->where('category', $request->input('inventory_category'));
        }

        $today = Carbon::today();
        $soonThreshold = Carbon::today()->addDays(30);

        $inventoryPaginator = $inventoryQuery->orderBy('name')
            ->paginate(10, ['*'], 'inventory_page')
            ->withQueryString();

        $inventoryPaginator->through(function ($item) use ($today, $soonThreshold) {
            $activeBatches = $item->batches->filter(fn ($b) => $b->quantity > 0);
            $totalBatchQty = $item->batches->sum('quantity');

            // If item has batches, ensure total quantity matches active batches sum
            $displayQuantity = $item->batches->isNotEmpty() ? $totalBatchQty : $item->quantity;

            // Compute expiry details
            $expiringBatches = $activeBatches->filter(function ($b) use ($today, $soonThreshold) {
                return $b->expires_at && $b->expires_at->greaterThanOrEqualTo($today) && $b->expires_at->lessThanOrEqualTo($soonThreshold);
            });

            $expiredBatches = $activeBatches->filter(function ($b) use ($today) {
                return $b->expires_at && $b->expires_at->lessThan($today);
            });

            $nearestExpiryBatch = $activeBatches->filter(fn ($b) => $b->expires_at !== null)->first();
            $nearestExpiry = $nearestExpiryBatch ? $nearestExpiryBatch->expires_at->format('Y-m-d') : null;

            // Status determination
            $stockStatus = 'in_stock';
            if ($displayQuantity <= 0) {
                $stockStatus = 'out_of_stock';
            } elseif ($expiredBatches->isNotEmpty()) {
                $stockStatus = 'expired';
            } elseif ($expiringBatches->isNotEmpty()) {
                $stockStatus = 'expiring_soon';
            } elseif ($displayQuantity <= $item->min_threshold) {
                $stockStatus = 'low_stock';
            }

            return [
                'id' => $item->id,
                'name' => $item->name,
                'quantity' => $displayQuantity,
                'unit' => $item->unit,
                'category' => $item->category,
                'min_threshold' => $item->min_threshold,
                'storage_location' => $item->storage_location,
                'has_expiry' => (bool) $item->has_expiry,
                'stock_status' => $stockStatus,
                'nearest_expiry' => $nearestExpiry,
                'active_batches_count' => $activeBatches->count(),
                'expired_batches_count' => $expiredBatches->count(),
                'expiring_soon_count' => $expiringBatches->count(),
                'batches' => $item->batches->map(function ($batch) use ($today, $soonThreshold) {
                    $batchStatus = 'good';
                    if ($batch->quantity <= 0) {
                        $batchStatus = 'depleted';
                    } elseif ($batch->expires_at && $batch->expires_at->lessThan($today)) {
                        $batchStatus = 'expired';
                    } elseif ($batch->expires_at && $batch->expires_at->lessThanOrEqualTo($soonThreshold)) {
                        $batchStatus = 'expiring_soon';
                    }

                    $daysUntilExpiry = null;
                    if ($batch->expires_at) {
                        $daysUntilExpiry = (int) $today->diffInDays($batch->expires_at, false);
                    }

                    return [
                        'id' => $batch->id,
                        'batch_number' => $batch->batch_number ?: 'BATCH-'.$batch->id,
                        'quantity' => $batch->quantity,
                        'initial_quantity' => $batch->initial_quantity,
                        'expires_at' => $batch->expires_at ? $batch->expires_at->format('Y-m-d') : null,
                        'received_at' => $batch->received_at ? $batch->received_at->format('Y-m-d') : null,
                        'source' => $batch->source,
                        'notes' => $batch->notes,
                        'status' => $batchStatus,
                        'days_remaining' => $daysUntilExpiry,
                    ];
                }),
            ];
        });

        // Audit/transaction logs paginator
        $inventoryLogsPaginator = InventoryLog::with(['item', 'batch', 'user'])
            ->latest('created_at')
            ->paginate(15, ['*'], 'logs_page')
            ->withQueryString();

        $inventoryLogsPaginator->through(function ($log) {
            return [
                'id' => $log->id,
                'item_name' => $log->item ? $log->item->name : 'Deleted Item',
                'category' => $log->item ? $log->item->category : 'N/A',
                'action' => $log->action,
                'quantity_changed' => $log->quantity_changed,
                'resulting_quantity' => $log->resulting_quantity,
                'unit' => $log->item ? $log->item->unit : '',
                'reason' => $log->reason,
                'batch_info' => $log->batch_info,
                'performed_by' => $log->user ? $log->user->name : 'System',
                'date' => $log->created_at->toDateTimeString(),
            ];
        });

        // Summary Stats
        $totalCash = Donation::query()
            ->whereIn('status', [DonationStatus::Verified->value, DonationStatus::Completed->value])
            ->whereIn('type', [DonationType::Cash->value, DonationType::FeedingSponsorship->value])
            ->sum('amount');

        $pendingCash = Donation::query()
            ->where('status', DonationStatus::PendingPayment->value)
            ->whereIn('type', [DonationType::Cash->value, DonationType::FeedingSponsorship->value])
            ->count();

        $pendingInKind = Donation::query()
            ->where('type', DonationType::InKind->value)
            ->where('status', DonationStatus::PendingVerification->value)
            ->count();

        // Inventory KPI Stats across all items
        $totalItems = InventoryItem::count();
        $outOfStockCount = InventoryItem::where('quantity', '<=', 0)->count();
        $lowStockCount = InventoryItem::where('quantity', '>', 0)->whereColumn('quantity', '<=', 'min_threshold')->count();
        $expiringSoonCount = InventoryBatch::where('quantity', '>', 0)
            ->whereNotNull('expires_at')
            ->whereDate('expires_at', '>=', $today)
            ->whereDate('expires_at', '<=', $soonThreshold)
            ->count();
        $expiredCount = InventoryBatch::where('quantity', '>', 0)
            ->whereNotNull('expires_at')
            ->whereDate('expires_at', '<', $today)
            ->count();

        return Inertia::render('admin/donation-monitoring', [
            'donations' => $donations,
            'inventory' => $inventoryPaginator,
            'inventoryLogs' => $inventoryLogsPaginator,
            'inventoryStats' => [
                'totalItems' => $totalItems,
                'lowStockCount' => $lowStockCount,
                'outOfStockCount' => $outOfStockCount,
                'expiringSoonCount' => $expiringSoonCount,
                'expiredCount' => $expiredCount,
            ],
            'filters' => $request->all(),
            'stats' => [
                'totalCash' => (int) $totalCash,
                'pendingCashCount' => $pendingCash,
                'pendingInKindCount' => $pendingInKind,
            ],
        ]);
    }

    public function verifyInKind(Request $request, Donation $donation): RedirectResponse
    {
        $validated = $request->validate([
            'itemName' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'unit' => 'required|string|max:50',
            'category' => 'required|string|in:Food,Medicine,Supplies,Other',
            'batch_number' => 'nullable|string|max:255',
            'expires_at' => 'nullable|date',
            'storage_location' => 'nullable|string|max:255',
        ]);

        $donationType = $donation->type instanceof DonationType ? $donation->type->value : $donation->type;
        if ($donationType !== DonationType::InKind->value) {
            return back()->withErrors(['error' => 'This donation is not an in-kind donation.']);
        }

        DB::transaction(function () use ($donation, $validated) {
            $storageLocation = $validated['storage_location'] ?? null;
            $expiresAt = $validated['expires_at'] ?? null;
            $batchNumber = ! empty($validated['batch_number']) ? $validated['batch_number'] : 'DON-'.strtoupper(substr(md5(uniqid()), 0, 6));

            // Find or create the inventory item
            $item = InventoryItem::firstOrCreate(
                ['name' => $validated['itemName']],
                [
                    'unit' => $validated['unit'],
                    'category' => $validated['category'],
                    'quantity' => 0,
                    'storage_location' => $storageLocation,
                    'has_expiry' => ! empty($expiresAt),
                ]
            );

            // Create inventory batch
            $batch = InventoryBatch::create([
                'inventory_item_id' => $item->id,
                'batch_number' => $batchNumber,
                'quantity' => $validated['quantity'],
                'initial_quantity' => $validated['quantity'],
                'expires_at' => $expiresAt,
                'received_at' => now(),
                'source' => 'In-kind donation #'.$donation->public_reference,
                'status' => 'active',
            ]);

            // Update item total quantity
            $item->increment('quantity', $validated['quantity']);

            // Create inventory log entry
            InventoryLog::create([
                'inventory_item_id' => $item->id,
                'inventory_batch_id' => $batch->id,
                'user_id' => auth()->id(),
                'action' => 'donation_received',
                'quantity_changed' => $validated['quantity'],
                'resulting_quantity' => $item->quantity,
                'reason' => 'Received from in-kind donation #'.$donation->public_reference,
                'batch_info' => 'Batch: '.$batch->batch_number.($batch->expires_at ? ' (Exp: '.$batch->expires_at->format('Y-m-d').')' : ''),
            ]);

            // Update in-kind donation record
            if ($donation->inKindDonation) {
                $donation->inKindDonation->update([
                    'status' => InKindStatus::Verified->value,
                    'quantity' => $validated['quantity'].' '.$validated['unit'],
                ]);
            }

            // Verify and complete donation
            $oldStatus = $donation->status;
            $donation->update([
                'status' => DonationStatus::Completed->value,
                'verified_at' => now(),
                'verified_by' => auth()->id(),
            ]);

            AuditLog::log('donation_inkind_verify', "Verified in-kind donation ref {$donation->public_reference}");

            // Audit Logs
            DB::table('donation_audit_logs')->insert([
                'donation_id' => $donation->id,
                'action' => 'verified',
                'old_status' => $oldStatus,
                'new_status' => DonationStatus::Completed->value,
                'performed_by' => auth()->id(),
                'notes' => 'In-kind donation verified and received into inventory: '.$validated['quantity'].' '.$validated['unit'].' of '.$validated['itemName'],
                'created_at' => now(),
            ]);

            DB::table('donation_status_histories')->insert([
                'donation_id' => $donation->id,
                'status' => DonationStatus::Completed->value,
                'changed_by' => auth()->id(),
                'reason' => 'In-kind donation verified and received.',
                'created_at' => now(),
            ]);

            $userToNotify = $donation->user ?? ($donation->user_id ? User::find($donation->user_id) : null);
            if ($userToNotify) {
                $userToNotify->notify(new DonationVerifiedNotification($donation));
            }
        });

        return redirect()->back()->with('success', 'In-kind donation verified and items added to inventory.');
    }

    public function storeInventoryItem(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:inventory_items,name',
            'unit' => 'required|string|max:50',
            'category' => 'required|string|in:Food,Medicine,Supplies,Other',
            'min_threshold' => 'nullable|integer|min:0',
            'storage_location' => 'nullable|string|max:255',
            'has_expiry' => 'nullable|boolean',
            'initial_quantity' => 'nullable|integer|min:0',
            'batch_number' => 'nullable|string|max:255',
            'expires_at' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $initialQty = (int) ($validated['initial_quantity'] ?? 0);
        $hasExpiry = ! empty($validated['has_expiry']) || ! empty($validated['expires_at']);

        DB::transaction(function () use ($validated, $initialQty, $hasExpiry) {
            $item = InventoryItem::create([
                'name' => $validated['name'],
                'quantity' => $initialQty,
                'unit' => $validated['unit'],
                'category' => $validated['category'],
                'min_threshold' => $validated['min_threshold'] ?? 5,
                'storage_location' => $validated['storage_location'] ?? null,
                'has_expiry' => $hasExpiry,
            ]);

            if ($initialQty > 0) {
                $batchNumber = ! empty($validated['batch_number']) ? $validated['batch_number'] : 'INIT-'.strtoupper(substr(md5(uniqid()), 0, 6));
                $batch = InventoryBatch::create([
                    'inventory_item_id' => $item->id,
                    'batch_number' => $batchNumber,
                    'quantity' => $initialQty,
                    'initial_quantity' => $initialQty,
                    'expires_at' => $validated['expires_at'] ?? null,
                    'received_at' => now(),
                    'source' => 'Initial stock setup',
                    'notes' => $validated['notes'] ?? null,
                    'status' => 'active',
                ]);

                InventoryLog::create([
                    'inventory_item_id' => $item->id,
                    'inventory_batch_id' => $batch->id,
                    'user_id' => auth()->id(),
                    'action' => 'added',
                    'quantity_changed' => $initialQty,
                    'resulting_quantity' => $initialQty,
                    'reason' => 'Initial inventory setup',
                    'batch_info' => 'Batch: '.$batch->batch_number.($batch->expires_at ? ' (Exp: '.$batch->expires_at->format('Y-m-d').')' : ''),
                ]);
            }

            AuditLog::log('inventory_item_create', "Created inventory item '{$validated['name']}' with qty {$initialQty}");
        });

        return redirect()->back()->with('success', 'Inventory item created successfully.');
    }

    public function updateInventoryItem(Request $request, InventoryItem $item): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:inventory_items,name,'.$item->id,
            'unit' => 'required|string|max:50',
            'category' => 'required|string|in:Food,Medicine,Supplies,Other',
            'min_threshold' => 'nullable|integer|min:0',
            'storage_location' => 'nullable|string|max:255',
            'has_expiry' => 'nullable|boolean',
        ]);

        $item->update([
            'name' => $validated['name'],
            'unit' => $validated['unit'],
            'category' => $validated['category'],
            'min_threshold' => $validated['min_threshold'] ?? $item->min_threshold,
            'storage_location' => $validated['storage_location'] ?? null,
            'has_expiry' => (bool) ($validated['has_expiry'] ?? $item->has_expiry),
        ]);

        AuditLog::log('inventory_item_update', "Updated inventory item '{$item->name}'");

        return redirect()->back()->with('success', 'Inventory item details updated.');
    }

    public function destroyInventoryItem(InventoryItem $item): RedirectResponse
    {
        $name = $item->name;
        $item->delete();

        AuditLog::log('inventory_item_delete', "Deleted inventory item '{$name}'");

        return redirect()->back()->with('success', "Inventory item '{$name}' removed.");
    }

    public function storeBatch(Request $request, InventoryItem $item): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'batch_number' => 'nullable|string|max:255',
            'expires_at' => 'nullable|date',
            'received_at' => 'nullable|date',
            'source' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($item, $validated) {
            $batchNumber = ! empty($validated['batch_number']) ? $validated['batch_number'] : 'BATCH-'.strtoupper(substr(md5(uniqid()), 0, 6));
            $batch = InventoryBatch::create([
                'inventory_item_id' => $item->id,
                'batch_number' => $batchNumber,
                'quantity' => $validated['quantity'],
                'initial_quantity' => $validated['quantity'],
                'expires_at' => $validated['expires_at'] ?? null,
                'received_at' => $validated['received_at'] ?? now(),
                'source' => $validated['source'] ?? 'Restock / Purchase',
                'notes' => $validated['notes'] ?? null,
                'status' => 'active',
            ]);

            $item->increment('quantity', $validated['quantity']);

            if ($batch->expires_at && ! $item->has_expiry) {
                $item->update(['has_expiry' => true]);
            }

            InventoryLog::create([
                'inventory_item_id' => $item->id,
                'inventory_batch_id' => $batch->id,
                'user_id' => auth()->id(),
                'action' => 'added',
                'quantity_changed' => $validated['quantity'],
                'resulting_quantity' => $item->quantity,
                'reason' => $validated['source'] ?: 'Added new stock batch',
                'batch_info' => 'Batch: '.$batch->batch_number.($batch->expires_at ? ' (Exp: '.$batch->expires_at->format('Y-m-d').')' : ''),
            ]);

            AuditLog::log('inventory_batch_create', "Added {$validated['quantity']} units to batch '{$batch->batch_number}' for '{$item->name}'");
        });

        return redirect()->back()->with('success', 'New batch added to inventory.');
    }

    public function adjustBatchStock(Request $request, InventoryBatch $batch): RedirectResponse
    {
        $validated = $request->validate([
            'action_type' => 'required|string|in:dispensed,expired_writeoff,damaged_writeoff,adjustment',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:255',
        ]);

        if ($validated['quantity'] > $batch->quantity) {
            return back()->withErrors(['quantity' => "Cannot deduct {$validated['quantity']} units. Only {$batch->quantity} units remaining in this batch."]);
        }

        $item = $batch->item;

        DB::transaction(function () use ($batch, $item, $validated) {
            $deductQty = $validated['quantity'];
            $batch->decrement('quantity', $deductQty);

            if ($batch->quantity <= 0) {
                $batch->update([
                    'status' => match ($validated['action_type']) {
                        'expired_writeoff' => 'expired',
                        'damaged_writeoff' => 'disposed',
                        default => 'depleted',
                    },
                ]);
            }

            $item->decrement('quantity', $deductQty);

            $actionName = match ($validated['action_type']) {
                'dispensed' => 'distributed',
                'expired_writeoff' => 'expired_writeoff',
                'damaged_writeoff' => 'damaged_writeoff',
                default => 'adjusted',
            };

            InventoryLog::create([
                'inventory_item_id' => $item->id,
                'inventory_batch_id' => $batch->id,
                'user_id' => auth()->id(),
                'action' => $actionName,
                'quantity_changed' => -$deductQty,
                'resulting_quantity' => $item->quantity,
                'reason' => $validated['reason'],
                'batch_info' => 'Batch: '.$batch->batch_number.($batch->expires_at ? ' (Exp: '.$batch->expires_at->format('Y-m-d').')' : ''),
            ]);

            AuditLog::log('inventory_batch_adjust', "Deducted {$deductQty} from batch '{$batch->batch_number}' of '{$item->name}' ({$validated['action_type']})");
        });

        return redirect()->back()->with('success', 'Batch stock updated successfully.');
    }

    public function adjustStock(Request $request, InventoryItem $item): RedirectResponse
    {
        $validated = $request->validate([
            'quantity_changed' => 'required|integer',
            'reason' => 'required|string|max:255',
        ]);

        if ($item->quantity + $validated['quantity_changed'] < 0) {
            return back()->withErrors(['quantity' => 'Stock quantity cannot fall below 0.']);
        }

        DB::transaction(function () use ($item, $validated) {
            $change = $validated['quantity_changed'];
            $item->increment('quantity', $change);

            // If reducing stock, adjust from active batches using FEFO (earliest expiry first)
            if ($change < 0) {
                $neededToDeduct = abs($change);
                $activeBatches = $item->batches()
                    ->where('quantity', '>', 0)
                    ->orderByRaw('CASE WHEN expires_at IS NULL THEN 1 ELSE 0 END, expires_at ASC, created_at ASC')
                    ->get();

                foreach ($activeBatches as $batch) {
                    if ($neededToDeduct <= 0) {
                        break;
                    }
                    $deductFromThisBatch = min($batch->quantity, $neededToDeduct);
                    $batch->decrement('quantity', $deductFromThisBatch);
                    if ($batch->quantity <= 0) {
                        $batch->update(['status' => 'depleted']);
                    }
                    $neededToDeduct -= $deductFromThisBatch;
                }
            } elseif ($change > 0) {
                // If adding without specific batch, create an adjustment batch
                InventoryBatch::create([
                    'inventory_item_id' => $item->id,
                    'batch_number' => 'ADJ-'.strtoupper(substr(md5(uniqid()), 0, 6)),
                    'quantity' => $change,
                    'initial_quantity' => $change,
                    'received_at' => now(),
                    'source' => 'Manual stock increase: '.$validated['reason'],
                    'status' => 'active',
                ]);
            }

            AuditLog::log('inventory_stock_adjust', "Adjusted stock for '{$item->name}' by {$change}");

            InventoryLog::create([
                'inventory_item_id' => $item->id,
                'user_id' => auth()->id(),
                'action' => $change > 0 ? 'added' : 'removed',
                'quantity_changed' => $change,
                'resulting_quantity' => $item->quantity,
                'reason' => $validated['reason'],
            ]);
        });

        return redirect()->back()->with('success', 'Stock level adjusted successfully.');
    }

    public function verifyCash(Request $request, Donation $donation): RedirectResponse
    {
        DB::transaction(function () use ($donation) {
            $oldStatus = $donation->status;
            $donation->update([
                'status' => DonationStatus::Completed->value,
                'verified_at' => now(),
                'verified_by' => auth()->id(),
            ]);

            // Update pending payments if any
            $donation->payments()->where('status', '!=', 'paid')->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            AuditLog::log('donation_cash_verify', "Verified payment/donation ref {$donation->public_reference}");

            DB::table('donation_audit_logs')->insert([
                'donation_id' => $donation->id,
                'action' => 'verified',
                'old_status' => $oldStatus,
                'new_status' => DonationStatus::Completed->value,
                'performed_by' => auth()->id(),
                'notes' => 'Cash/monetary payment verified by administrator.',
                'created_at' => now(),
            ]);

            DB::table('donation_status_histories')->insert([
                'donation_id' => $donation->id,
                'status' => DonationStatus::Completed->value,
                'changed_by' => auth()->id(),
                'reason' => 'Payment verified by administrator.',
                'created_at' => now(),
            ]);

            $userToNotify = $donation->user ?? ($donation->user_id ? \App\Models\User::find($donation->user_id) : null);
            if ($userToNotify) {
                $userToNotify->notify(new DonationVerifiedNotification($donation));
            }
        });

        return redirect()->back()->with('success', "Donation {$donation->public_reference} marked as verified and completed.");
    }

    public function rejectDonation(Request $request, Donation $donation): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        DB::transaction(function () use ($donation, $validated) {
            $oldStatus = $donation->status;
            $donation->update([
                'status' => DonationStatus::Rejected->value,
                'rejection_reason' => $validated['reason'],
            ]);

            if ($donation->inKindDonation) {
                $donation->inKindDonation->update([
                    'status' => InKindStatus::Cancelled->value,
                ]);
            }

            AuditLog::log('donation_reject', "Rejected donation ref {$donation->public_reference}: {$validated['reason']}");

            DB::table('donation_audit_logs')->insert([
                'donation_id' => $donation->id,
                'action' => 'rejected',
                'old_status' => $oldStatus,
                'new_status' => DonationStatus::Rejected->value,
                'performed_by' => auth()->id(),
                'notes' => 'Donation rejected: '.$validated['reason'],
                'created_at' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Donation {$donation->public_reference} marked as rejected.");
    }
}
