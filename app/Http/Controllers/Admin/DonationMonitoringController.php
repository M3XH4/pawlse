<?php

namespace App\Http\Controllers\Admin;

use App\Enums\DonationStatus;
use App\Enums\DonationType;
use App\Enums\InKindStatus;
use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DonationMonitoringController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Donation::query()->with(['payments', 'inKindDonation.need.animal', 'feedingSponsorship']);

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

        // Inventory items
        $inventoryQuery = InventoryItem::query();
        if ($request->filled('inventory_search')) {
            $inventoryQuery->where('name', 'like', '%'.$request->input('inventory_search').'%');
        }
        $inventory = $inventoryQuery->orderBy('name')->get();

        // Audit/transaction logs
        $inventoryLogs = InventoryLog::with(['item', 'user'])
            ->latest('created_at')
            ->limit(50)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'item_name' => $log->item ? $log->item->name : 'Deleted Item',
                    'category' => $log->item ? $log->item->category : 'N/A',
                    'action' => $log->action,
                    'quantity_changed' => $log->quantity_changed,
                    'resulting_quantity' => $log->resulting_quantity,
                    'unit' => $log->item ? $log->item->unit : '',
                    'reason' => $log->reason,
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

        return Inertia::render('admin/donation-monitoring', [
            'donations' => $donations,
            'inventory' => $inventory,
            'inventoryLogs' => $inventoryLogs,
            'filters' => $request->all(),
            'stats' => [
                'totalCash' => (int) $totalCash,
                'pendingCashCount' => $pendingCash,
                'pendingInKindCount' => $pendingInKind,
            ],
        ]);
    }

    public function verifyInKind(Request $request, Donation $donation)
    {
        $validated = $request->validate([
            'itemName' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'unit' => 'required|string|max:50',
            'category' => 'required|string|in:Food,Medicine,Supplies,Other',
        ]);

        if ($donation->type !== DonationType::InKind->value) {
            return back()->withErrors(['error' => 'This donation is not an in-kind donation.']);
        }

        DB::transaction(function () use ($donation, $validated) {
            // Find or create the inventory item
            $item = InventoryItem::firstOrCreate(
                ['name' => $validated['itemName']],
                [
                    'unit' => $validated['unit'],
                    'category' => $validated['category'],
                    'quantity' => 0,
                ]
            );

            // Update item stock
            $oldQty = $item->quantity;
            $item->increment('quantity', $validated['quantity']);

            // Create inventory log entry
            InventoryLog::create([
                'inventory_item_id' => $item->id,
                'user_id' => auth()->id(),
                'action' => 'donation_received',
                'quantity_changed' => $validated['quantity'],
                'resulting_quantity' => $item->quantity,
                'reason' => 'Received from in-kind donation #'.$donation->public_reference,
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
        });

        return redirect()->back()->with('success', 'In-kind donation verified and items added to inventory.');
    }

    public function storeInventoryItem(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:inventory_items,name',
            'quantity' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'category' => 'required|string|in:Food,Medicine,Supplies,Other',
        ]);

        DB::transaction(function () use ($validated) {
            $item = InventoryItem::create([
                'name' => $validated['name'],
                'quantity' => $validated['quantity'],
                'unit' => $validated['unit'],
                'category' => $validated['category'],
            ]);

            InventoryLog::create([
                'inventory_item_id' => $item->id,
                'user_id' => auth()->id(),
                'action' => 'added',
                'quantity_changed' => $validated['quantity'],
                'resulting_quantity' => $validated['quantity'],
                'reason' => 'Manual inventory item creation',
            ]);
        });

        return redirect()->back()->with('success', 'Inventory item created successfully.');
    }

    public function adjustStock(Request $request, InventoryItem $item)
    {
        $validated = $request->validate([
            'quantity_changed' => 'required|integer',
            'reason' => 'required|string|max:255',
        ]);

        if ($item->quantity + $validated['quantity_changed'] < 0) {
            return back()->withErrors(['quantity' => 'Stock quantity cannot fall below 0.']);
        }

        DB::transaction(function () use ($item, $validated) {
            $item->increment('quantity', $validated['quantity_changed']);

            InventoryLog::create([
                'inventory_item_id' => $item->id,
                'user_id' => auth()->id(),
                'action' => $validated['quantity_changed'] > 0 ? 'added' : 'removed',
                'quantity_changed' => $validated['quantity_changed'],
                'resulting_quantity' => $item->quantity,
                'reason' => $validated['reason'],
            ]);
        });

        return redirect()->back()->with('success', 'Stock level adjusted successfully.');
    }
}
