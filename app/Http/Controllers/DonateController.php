<?php

namespace App\Http\Controllers;

use App\Enums\DonationStatus;
use App\Enums\DonationType;
use App\Enums\InKindStatus;
use App\Enums\PaymentStatus;
use App\Models\AuditLog;
use App\Models\Donation;
use App\Models\Event;
use App\Models\FeedingSponsorship;
use App\Models\InKindDonation;
use App\Models\Payment;
use App\Models\ShelterAnimal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DonateController extends Controller
{
    public function index(Request $request): Response
    {
        // 1. Fetch Shelter Animals with open donation needs
        $wishlist = ShelterAnimal::with(['needs' => function ($query) {
            $query->where('status', 'open');
        }])->whereHas('needs', function ($query) {
            $query->where('status', 'open');
        })->get()->map(function ($animal) {
            return [
                'id' => $animal->id,
                'name' => $animal->name,
                'type' => $animal->type ? $animal->type->value : null,
                'age' => $animal->age,
                'photo' => $animal->photo_url,
                'needs' => $animal->needs->map(function ($need) {
                    return [
                        'id' => $need->id,
                        'item' => $need->item,
                        'quantity' => $need->quantity,
                        'priority' => $need->priority,
                        'status' => $need->status,
                    ];
                }),
            ];
        });

        // 2. Fetch Verified & Completed Donations for Public Transparency Audit Log
        $publicDonations = Donation::query()
            ->with(['inKindDonation', 'feedingSponsorship'])
            ->whereIn('status', [DonationStatus::Verified->value, DonationStatus::Completed->value])
            ->latest('id')
            ->get();

        $auditRecords = $publicDonations->map(function ($donation) {
            $typeLabel = match ($donation->type) {
                DonationType::Cash->value => 'Cash',
                DonationType::InKind->value => 'In-Kind',
                DonationType::FeedingSponsorship->value => 'Sponsor Feeding',
                default => ucfirst((string) $donation->type),
            };

            $purpose = $donation->purpose;
            $displayAmount = $donation->amount ? '₱'.number_format($donation->amount) : null;
            $inKindQuantity = null;

            if ($donation->type === DonationType::InKind->value && $donation->inKindDonation) {
                $inKindQuantity = $donation->inKindDonation->quantity;
                if (! $purpose) {
                    $purpose = 'In-Kind drop-off: '.$donation->inKindDonation->description;
                }
            } elseif ($donation->type === DonationType::FeedingSponsorship->value && $donation->feedingSponsorship) {
                $sponsor = $donation->feedingSponsorship;
                $details = [];
                if ($sponsor->occasion) {
                    $details[] = 'Occasion: '.$sponsor->occasion;
                }
                if ($sponsor->message) {
                    $details[] = '"'.$sponsor->message.'"';
                }
                if (! $purpose) {
                    $purpose = 'Full route stray feeding day on '.$sponsor->preferred_date.($details ? ' • '.implode(' • ', $details) : '');
                }
            }

            if (! $purpose) {
                $purpose = 'Veterinary care, rescue operations, and stray feeding support';
            }

            return [
                'id' => $donation->id,
                'name' => $donation->anonymous ? 'Anonymous' : ($donation->donor_name ?: 'Anonymous'),
                'donor_name' => $donation->anonymous ? 'Anonymous Donor' : ($donation->donor_name ?: 'Anonymous Donor'),
                'type' => $donation->type,
                'type_label' => $typeLabel,
                'amount' => $donation->amount ? (int) $donation->amount : null,
                'formatted_amount' => $displayAmount,
                'in_kind_quantity' => $inKindQuantity,
                'purpose' => $purpose,
                'receipt' => $donation->public_reference,
                'status' => $donation->status,
                'date' => $donation->created_at->format('Y-m-d'),
                'created_at' => $donation->created_at->toISOString(),
                'time' => $donation->created_at->diffForHumans(),
                'year' => (int) $donation->created_at->format('Y'),
                'month' => (int) $donation->created_at->format('n'),
            ];
        });

        $recentDonations = $auditRecords->take(10)->values()->map(function ($record) {
            return [
                'name' => $record['name'],
                'amount' => $record['formatted_amount'] ?? ($record['in_kind_quantity'] ?: 'In-Kind'),
                'time' => $record['time'],
                'type' => $record['type_label'],
                'receipt' => $record['receipt'],
            ];
        });

        // 3. Current month cash/sponsor total
        $currentMonthTotal = Donation::query()
            ->whereIn('status', [DonationStatus::Verified->value, DonationStatus::Completed->value])
            ->whereIn('type', [DonationType::Cash->value, DonationType::FeedingSponsorship->value])
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');

        return Inertia::render('donate', [
            'wishlist' => $wishlist,
            'recentDonations' => $recentDonations,
            'auditRecords' => $auditRecords,
            'progressStats' => [
                'total' => (int) $currentMonthTotal,
                'goal' => 50000,
                'percentage' => (int) min(100, round(($currentMonthTotal / 50000) * 100)),
            ],
            'donationSuccess' => session('donation_success'),
            'successRef' => session('success_ref'),
        ]);
    }

    public function storeCash(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|integer|min:1',
            'donor_name' => 'nullable|string|max:255',
            'donor_email' => 'required|email|max:255',
            'donor_mobile' => 'nullable|string|max:50',
            'anonymous' => 'boolean',
            'payment_method' => 'required|string|in:gcash,maya,paypal,bank_transfer',
        ]);

        $ref = 'DON-'.time().'-'.Str::upper(Str::random(4));

        $donation = Donation::create([
            'public_reference' => $ref,
            'user_id' => auth()->id(),
            'donor_name' => $validated['donor_name'] ?? 'Guest Donor',
            'donor_email' => $validated['donor_email'],
            'donor_mobile' => $validated['donor_mobile'],
            'anonymous' => $validated['anonymous'] ?? false,
            'type' => DonationType::Cash->value,
            'amount' => $validated['amount'],
            'status' => DonationStatus::PendingPayment->value,
            'purpose' => 'Cash donation supporting stray feeding and care',
        ]);

        Payment::create([
            'donation_id' => $donation->id,
            'method' => $validated['payment_method'],
            'provider' => $validated['payment_method'],
            'amount' => $validated['amount'],
            'payment_reference' => 'PAY-'.Str::upper(Str::random(12)),
            'status' => PaymentStatus::Pending->value,
        ]);

        AuditLog::log('donation_cash_create', 'Initiated cash donation of ₱'.number_format($validated['amount'])." with ref {$ref}");

        return redirect()->route('donate.checkout', $ref);
    }

    public function storeInKind(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string',
            'drop_off_date' => 'required|date|after_or_equal:today',
            'contact_person' => 'required|string|max:255',
            'quantity' => 'nullable|string|max:255',
            'animal_donation_need_id' => 'nullable|exists:animal_donation_needs,id',
            'donor_name' => 'nullable|string|max:255',
            'donor_email' => 'required|email|max:255',
            'donor_mobile' => 'nullable|string|max:50',
            'anonymous' => 'boolean',
        ]);

        $ref = 'DON-'.time().'-'.Str::upper(Str::random(4));

        DB::transaction(function () use ($validated, $ref) {
            $donation = Donation::create([
                'public_reference' => $ref,
                'user_id' => auth()->id(),
                'donor_name' => $validated['donor_name'] ?? 'Guest Donor',
                'donor_email' => $validated['donor_email'],
                'donor_mobile' => $validated['donor_mobile'],
                'anonymous' => $validated['anonymous'] ?? false,
                'type' => DonationType::InKind->value,
                'status' => DonationStatus::PendingVerification->value,
                'purpose' => 'In-Kind drop-off: '.Str::limit($validated['description'], 50),
            ]);

            InKindDonation::create([
                'donation_id' => $donation->id,
                'animal_donation_need_id' => $validated['animal_donation_need_id'],
                'description' => $validated['description'],
                'drop_off_date' => $validated['drop_off_date'],
                'contact_person' => $validated['contact_person'],
                'quantity' => $validated['quantity'] ?? '1 unit',
                'status' => InKindStatus::Scheduled->value,
            ]);

            // Add initial audit logs for transparency
            DB::table('donation_audit_logs')->insert([
                'donation_id' => $donation->id,
                'action' => 'created',
                'old_status' => null,
                'new_status' => DonationStatus::PendingVerification->value,
                'performed_by' => auth()->id(),
                'notes' => 'In-kind donation scheduled for drop-off on '.$validated['drop_off_date'],
                'created_at' => now(),
            ]);

            DB::table('donation_status_histories')->insert([
                'donation_id' => $donation->id,
                'status' => DonationStatus::PendingVerification->value,
                'changed_by' => auth()->id(),
                'reason' => 'Scheduled in-kind donation created',
                'created_at' => now(),
            ]);
        });

        AuditLog::log('donation_inkind_create', "Scheduled in-kind donation with ref {$ref}");

        return redirect()->back()->with('success', 'Thank you! Your drop-off has been scheduled. Reference: '.$ref);
    }

    public function storeSponsor(Request $request)
    {
        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'mobile' => 'required|string|max:50',
            'date' => 'required|date|after_or_equal:today',
            'occasion' => 'nullable|string|max:255',
            'message' => 'nullable|string',
            'anonymous' => 'boolean',
            'payment_method' => 'required|string|in:gcash,maya,paypal',
        ]);

        $ref = 'DON-'.time().'-'.Str::upper(Str::random(4));
        $amount = 3500; // Sponsor feeding standard amount

        DB::transaction(function () use ($validated, $ref, $amount) {
            $donation = Donation::create([
                'public_reference' => $ref,
                'user_id' => auth()->id(),
                'donor_name' => $validated['fullName'],
                'donor_email' => $validated['email'],
                'donor_mobile' => $validated['mobile'],
                'anonymous' => $validated['anonymous'] ?? false,
                'type' => DonationType::FeedingSponsorship->value,
                'amount' => $amount,
                'status' => DonationStatus::PendingPayment->value,
                'purpose' => 'Sponsoring full route stray feeding day on '.$validated['date'],
            ]);

            Payment::create([
                'donation_id' => $donation->id,
                'method' => $validated['payment_method'],
                'provider' => $validated['payment_method'],
                'amount' => $amount,
                'payment_reference' => 'PAY-'.Str::upper(Str::random(12)),
                'status' => PaymentStatus::Pending->value,
            ]);

            FeedingSponsorship::create([
                'public_reference' => 'FS-'.time().'-'.Str::upper(Str::random(4)),
                'donation_id' => $donation->id,
                'donor_name' => $validated['fullName'],
                'donor_email' => $validated['email'],
                'donor_mobile' => $validated['mobile'],
                'preferred_date' => $validated['date'],
                'occasion' => $validated['occasion'],
                'message' => $validated['message'],
                'anonymous' => $validated['anonymous'] ?? false,
                'amount' => $amount,
                'status' => 'pending',
            ]);
        });

        AuditLog::log('donation_sponsor_create', "Initiated feeding sponsorship of ₱3,500 with ref {$ref}");

        return redirect()->route('donate.checkout', $ref);
    }

    public function checkout($ref): Response
    {
        $donation = Donation::with(['payments', 'feedingSponsorship'])->where('public_reference', $ref)->firstOrFail();

        return Inertia::render('checkout', [
            'donation' => [
                'public_reference' => $donation->public_reference,
                'donor_name' => $donation->donor_name,
                'donor_email' => $donation->donor_email,
                'amount' => $donation->amount,
                'type' => $donation->type,
                'status' => $donation->status,
                'payment' => $donation->payments->first() ? [
                    'method' => $donation->payments->first()->method,
                    'provider' => $donation->payments->first()->provider,
                    'payment_reference' => $donation->payments->first()->payment_reference,
                    'status' => $donation->payments->first()->status,
                ] : null,
                'sponsorship' => $donation->feedingSponsorship ? [
                    'preferred_date' => $donation->feedingSponsorship->preferred_date,
                    'occasion' => $donation->feedingSponsorship->occasion,
                ] : null,
            ],
        ]);
    }

    public function pay(Request $request, $ref)
    {
        $donation = Donation::with(['payments', 'feedingSponsorship'])->where('public_reference', $ref)->firstOrFail();
        $payment = $donation->payments->first();

        $action = $request->input('action'); // 'success' or 'fail'

        if ($action === 'success') {
            DB::transaction(function () use ($donation, $payment) {
                // Update payment to verified
                if ($payment) {
                    $payment->update([
                        'status' => PaymentStatus::Verified->value,
                        'paid_at' => now(),
                        'provider_transaction_id' => 'TXN-'.Str::upper(Str::random(16)),
                    ]);
                }

                // Transition donation
                $oldStatus = $donation->status;
                $donation->update([
                    'status' => DonationStatus::Completed->value,
                    'verified_at' => now(),
                ]);

                // Create audit logs
                DB::table('donation_audit_logs')->insert([
                    'donation_id' => $donation->id,
                    'action' => 'payment_received',
                    'old_status' => $oldStatus,
                    'new_status' => DonationStatus::Completed->value,
                    'performed_by' => auth()->id(),
                    'notes' => 'Simulated checkout payment successful.',
                    'created_at' => now(),
                ]);

                DB::table('donation_status_histories')->insert([
                    'donation_id' => $donation->id,
                    'status' => DonationStatus::Completed->value,
                    'changed_by' => auth()->id(),
                    'reason' => 'Simulated checkout payment successful.',
                    'created_at' => now(),
                ]);

                // If feeding sponsorship, approve and schedule event!
                if ($donation->type === DonationType::FeedingSponsorship->value && $donation->feedingSponsorship) {
                    $donation->feedingSponsorship->update([
                        'status' => 'completed',
                    ]);

                    $donorDisplay = $donation->anonymous ? 'Anonymous' : $donation->donor_name;

                    // Automatically schedule event!
                    Event::create([
                        'title' => 'Sponsored Feeding Day by '.$donorDisplay,
                        'category' => 'Feeding',
                        'date' => $donation->feedingSponsorship->preferred_date,
                        'time' => '09:00 AM',
                        'location' => 'Iligan City Stray Shelter / Feeding Route',
                        'spots' => 10,
                        'desc' => "This feeding day is fully sponsored by a generous donor!\n".
                                  "Sponsor: {$donorDisplay}\n".
                                  ($donation->feedingSponsorship->occasion ? "Occasion: {$donation->feedingSponsorship->occasion}\n" : '').
                                  ($donation->feedingSponsorship->message ? "Message: \"{$donation->feedingSponsorship->message}\"\n" : '').
                                  'Volunteers are invited to join us in preparing and distributing food for our stray friends in Iligan.',
                        'keywords' => json_encode(['feeding', 'sponsored', 'strays']),
                        'status' => 'open',
                    ]);
                }
            });

            AuditLog::log('donation_payment_success', "Payment successful for donation ref {$ref}");

            return redirect()->route('donate')->with([
                'donation_success' => true,
                'success_ref' => $ref,
            ]);
        } else {
            DB::transaction(function () use ($donation, $payment) {
                if ($payment) {
                    $payment->update([
                        'status' => PaymentStatus::Failed->value,
                    ]);
                }

                $oldStatus = $donation->status;
                $donation->update([
                    'status' => DonationStatus::Rejected->value,
                ]);

                DB::table('donation_audit_logs')->insert([
                    'donation_id' => $donation->id,
                    'action' => 'payment_failed',
                    'old_status' => $oldStatus,
                    'new_status' => DonationStatus::Rejected->value,
                    'performed_by' => auth()->id(),
                    'notes' => 'Simulated checkout payment failed.',
                    'created_at' => now(),
                ]);

                DB::table('donation_status_histories')->insert([
                    'donation_id' => $donation->id,
                    'status' => DonationStatus::Rejected->value,
                    'changed_by' => auth()->id(),
                    'reason' => 'Simulated checkout payment failed.',
                    'created_at' => now(),
                ]);

                if ($donation->type === DonationType::FeedingSponsorship->value && $donation->feedingSponsorship) {
                    $donation->feedingSponsorship->update([
                        'status' => 'failed',
                    ]);
                }
            });

            AuditLog::log('donation_payment_failed', "Payment failed for donation ref {$ref}");

            return redirect()->route('donate')->with('error', 'Your payment was cancelled or failed.');
        }
    }
}
