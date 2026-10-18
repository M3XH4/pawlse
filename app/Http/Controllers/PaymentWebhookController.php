<?php

namespace App\Http\Controllers;

use App\Enums\DonationStatus;
use App\Enums\DonationType;
use App\Enums\PaymentStatus;
use App\Models\AuditLog;
use App\Models\CareSustainability;
use App\Models\Donation;
use App\Models\Event;
use App\Models\Payment;
use App\Notifications\DonationVerifiedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentWebhookController extends Controller
{
    /**
     * Handle incoming payment gateway webhooks (PayMongo, Xendit, Maya, or Generic).
     */
    public function handle(Request $request): JsonResponse
    {
        $webhookSecret = config('services.payment.webhook_secret') ?: env('PAYMENT_WEBHOOK_SECRET');

        // Verify webhook signature if configured
        if (! empty($webhookSecret)) {
            if (! $this->verifySignature($request, $webhookSecret)) {
                return response()->json([
                    'error' => 'Invalid webhook signature',
                ], 401);
            }
        }

        $payload = $request->all();

        // Resolve reference from various gateway payload structures
        $reference = $this->resolveDonationReference($payload);

        if (empty($reference)) {
            return response()->json([
                'error' => 'No donation or payment reference found in webhook payload',
            ], 422);
        }

        // Find the donation
        $donation = Donation::with(['payments', 'feedingSponsorship'])
            ->where('public_reference', $reference)
            ->first();

        if (! $donation) {
            $payment = Payment::with('donation.feedingSponsorship')
                ->where('payment_reference', $reference)
                ->orWhere('provider_transaction_id', $reference)
                ->first();
            $donation = $payment?->donation;
        }

        if (! $donation) {
            return response()->json([
                'error' => "Donation matching reference '{$reference}' not found",
            ], 404);
        }

        if ($donation->status === DonationStatus::Completed->value) {
            return response()->json([
                'status' => 'already_processed',
                'message' => "Donation #{$donation->public_reference} is already completed.",
            ], 200);
        }

        $payment = $donation->payments->first();
        $providerTxnId = $this->resolveProviderTransactionId($payload) ?: ('TXN-'.Str::upper(Str::random(16)));

        $status = strtolower($payload['event'] ?? $payload['data']['attributes']['status'] ?? $payload['status'] ?? 'paid');
        $isFailed = in_array($status, ['payment.failed', 'failed', 'payment_failed', 'expired', 'cancelled'], true);

        if ($isFailed) {
            DB::transaction(function () use ($donation, $payment, $providerTxnId, $status) {
                if ($payment) {
                    $payment->update([
                        'status' => PaymentStatus::Failed->value,
                        'provider_transaction_id' => $providerTxnId,
                    ]);
                }

                $oldStatus = $donation->status;
                $donation->update([
                    'status' => DonationStatus::Rejected->value,
                ]);

                DB::table('donation_audit_logs')->insert([
                    'donation_id' => $donation->id,
                    'action' => 'gateway_webhook_failed',
                    'old_status' => $oldStatus,
                    'new_status' => DonationStatus::Rejected->value,
                    'performed_by' => null,
                    'notes' => "Payment failed notification received from gateway webhook ({$status})",
                    'created_at' => now(),
                ]);
            });

            return response()->json([
                'success' => true,
                'status' => 'failed',
                'donation_reference' => $donation->public_reference,
                'message' => 'Payment failure recorded.',
            ], 200);
        }

        DB::transaction(function () use ($donation, $payment, $providerTxnId) {
            if ($payment) {
                $payment->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'provider_transaction_id' => $providerTxnId,
                ]);
            }

            $oldStatus = $donation->status;
            $donation->update([
                'status' => DonationStatus::Completed->value,
                'verified_at' => now(),
            ]);

            DB::table('donation_audit_logs')->insert([
                'donation_id' => $donation->id,
                'action' => 'gateway_webhook_paid',
                'old_status' => $oldStatus,
                'new_status' => DonationStatus::Completed->value,
                'performed_by' => null,
                'notes' => "Automated payment confirmation received from gateway webhook (Txn: {$providerTxnId})",
                'created_at' => now(),
            ]);

            DB::table('donation_status_histories')->insert([
                'donation_id' => $donation->id,
                'status' => DonationStatus::Completed->value,
                'changed_by' => null,
                'reason' => 'Automated gateway webhook confirmation.',
                'created_at' => now(),
            ]);

            // Auto-extend care sustainability timer
            if ($donation->amount && (float) $donation->amount > 0) {
                CareSustainability::current()->extendByAmount(
                    amount: (float) $donation->amount,
                    notes: "Care timer auto-extended by donation #{$donation->public_reference} via gateway webhook",
                    user: null,
                    donation: $donation
                );
            }

            // If feeding sponsorship, schedule event
            if ($donation->type === DonationType::FeedingSponsorship->value && $donation->feedingSponsorship) {
                $donation->feedingSponsorship->update([
                    'status' => 'completed',
                ]);

                $donorDisplay = $donation->anonymous ? 'Anonymous' : $donation->donor_name;

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

            if ($donation->user) {
                $donation->user->notify(new DonationVerifiedNotification($donation));
            }
        });

        AuditLog::log('donation_webhook_success', "Payment completed via webhook for donation #{$donation->public_reference} (Txn: {$providerTxnId})");

        return response()->json([
            'success' => true,
            'status' => 'success',
            'donation_reference' => $donation->public_reference,
            'message' => 'Payment processed and verified successfully.',
        ], 200);
    }

    /**
     * Resolve donation reference across common gateway payload formats.
     */
    protected function resolveDonationReference(array $payload): ?string
    {
        return $payload['data']['attributes']['data']['attributes']['description']
            ?? $payload['data']['attributes']['data']['attributes']['remarks']
            ?? $payload['data']['attributes']['data']['attributes']['metadata']['donation_reference']
            ?? $payload['data']['attributes']['metadata']['donation_reference']
            ?? $payload['data']['attributes']['reference_number']
            ?? $payload['data']['attributes']['reference']
            ?? $payload['reference_number']
            ?? $payload['reference']
            ?? $payload['donation_reference']
            ?? $payload['external_id']
            ?? $payload['data']['reference']
            ?? $payload['data']['reference_number']
            ?? $payload['data']['external_id']
            ?? null;
    }

    /**
     * Resolve transaction ID from gateway payload.
     */
    protected function resolveProviderTransactionId(array $payload): ?string
    {
        return $payload['data']['id']
            ?? $payload['transaction_id']
            ?? $payload['id']
            ?? null;
    }

    /**
     * Verify incoming webhook HMAC signature.
     */
    protected function verifySignature(Request $request, string $secret): bool
    {
        // 1. PayMongo signature format
        $paymongoSignature = $request->header('Paymongo-Signature');
        if ($paymongoSignature) {
            $parts = explode(',', $paymongoSignature);
            $parsed = [];
            foreach ($parts as $part) {
                [$k, $v] = explode('=', trim($part), 2) + ['', ''];
                $parsed[$k] = $v;
            }
            if (isset($parsed['t'], $parsed['te'])) {
                $computed = hash_hmac('sha256', $parsed['t'].'.'.$request->getContent(), $secret);

                return hash_equals($computed, $parsed['te']);
            }
        }

        // 2. Generic HMAC / Xendit Callback Token
        $xenditToken = $request->header('x-callback-token');
        if ($xenditToken && hash_equals($secret, $xenditToken)) {
            return true;
        }

        $headerSignature = $request->header('X-Signature') ?? $request->header('Signature');
        if ($headerSignature) {
            $computed = hash_hmac('sha256', $request->getContent(), $secret);

            return hash_equals($computed, $headerSignature);
        }

        return false;
    }
}
