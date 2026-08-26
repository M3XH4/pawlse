<?php

namespace Database\Seeders;

use App\Enums\DonationStatus;
use App\Enums\DonationType;
use App\Enums\InKindStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Models\AnimalDonationNeed;
use App\Models\Donation;
use App\Models\DonationAuditLog;
use App\Models\DonationStatusHistory;
use App\Models\FeedingSponsorship;
use App\Models\InKindDonation;
use App\Models\Payment;
use App\Models\PaymentProof;
use App\Models\User;
use Illuminate\Database\Seeder;

class DonationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'user@pawlse.test')->first() ?? User::first();
        $userId = $user ? $user->id : null;

        $admin = User::where('email', 'admin@pawlse.test')->first();
        $adminId = $admin ? $admin->id : null;

        // 1. Completed GCash Cash Donation
        $donation1 = Donation::create([
            'public_reference' => 'DON-GCASH123',
            'user_id' => $userId,
            'donor_name' => 'John Doe',
            'donor_email' => 'user@pawlse.test',
            'donor_mobile' => '09123456789',
            'anonymous' => false,
            'type' => DonationType::Cash->value,
            'amount' => 1000,
            'currency' => 'PHP',
            'status' => DonationStatus::Completed->value,
            'purpose' => 'Medical Care',
            'notes' => 'For the injured stray dogs.',
            'verified_at' => now()->subDays(1),
            'verified_by' => $adminId,
        ]);

        Payment::create([
            'donation_id' => $donation1->id,
            'method' => PaymentMethod::Gcash->value,
            'provider' => PaymentProvider::Gcash->value,
            'provider_transaction_id' => 'GCASH-TXN-112233',
            'payment_reference' => 'PAY-GCASH123',
            'amount' => 1000,
            'currency' => 'PHP',
            'paid_at' => now()->subDays(1)->subHours(2),
            'status' => PaymentStatus::Verified->value,
        ]);

        DonationStatusHistory::create([
            'donation_id' => $donation1->id,
            'status' => DonationStatus::Completed->value,
            'changed_by' => $adminId,
            'reason' => 'Payment verified successfully.',
            'created_at' => now()->subDays(1),
        ]);

        DonationAuditLog::create([
            'donation_id' => $donation1->id,
            'action' => 'completed',
            'old_status' => DonationStatus::PendingPayment->value,
            'new_status' => DonationStatus::Completed->value,
            'performed_by' => $adminId,
            'notes' => 'Admin marked payment as verified',
            'metadata' => json_encode(['payment_method' => 'gcash']),
            'created_at' => now()->subDays(1),
        ]);

        // 2. Pending Payment Maya Cash Donation
        $donation2 = Donation::create([
            'public_reference' => 'DON-MAYA456',
            'user_id' => null,
            'donor_name' => 'Alice Smith',
            'donor_email' => 'alice@example.com',
            'donor_mobile' => '09177654321',
            'anonymous' => true,
            'type' => DonationType::Cash->value,
            'amount' => 500,
            'currency' => 'PHP',
            'status' => DonationStatus::PendingPayment->value,
            'purpose' => 'Food Supplies',
        ]);

        Payment::create([
            'donation_id' => $donation2->id,
            'method' => PaymentMethod::Maya->value,
            'provider' => PaymentProvider::Maya->value,
            'payment_reference' => 'PAY-MAYA456',
            'amount' => 500,
            'status' => PaymentStatus::Pending->value,
        ]);

        // 3. Bank Transfer cash donation with payment proof pending verification
        $donation3 = Donation::create([
            'public_reference' => 'DON-BANK789',
            'user_id' => $userId,
            'donor_name' => 'Bob Jones',
            'donor_email' => 'user@pawlse.test',
            'donor_mobile' => '09123456789',
            'anonymous' => false,
            'type' => DonationType::Cash->value,
            'amount' => 5000,
            'currency' => 'PHP',
            'status' => DonationStatus::PendingVerification->value,
            'purpose' => 'Shelter Repair',
        ]);

        $payment3 = Payment::create([
            'donation_id' => $donation3->id,
            'method' => PaymentMethod::BankTransfer->value,
            'provider' => PaymentProvider::Manual->value,
            'payment_reference' => 'PAY-BANK789',
            'amount' => 5000,
            'status' => PaymentStatus::ProofSubmitted->value,
        ]);

        PaymentProof::create([
            'donation_id' => $donation3->id,
            'payment_id' => $payment3->id,
            'disk' => 'local',
            'path' => 'proofs/bank_transfer_proof.jpg',
            'original_filename' => 'proof_of_payment.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 450000,
            'uploaded_at' => now()->subHours(10),
        ]);

        // 4. In-kind donation
        $donationNeed = AnimalDonationNeed::first();
        $donation4 = Donation::create([
            'public_reference' => 'DON-INKIND999',
            'user_id' => $userId,
            'donor_name' => 'Charlie Green',
            'donor_email' => 'charlie@example.com',
            'anonymous' => false,
            'type' => DonationType::InKind->value,
            'status' => DonationStatus::Completed->value,
            'verified_at' => now()->subDays(2),
            'verified_by' => $adminId,
        ]);

        InKindDonation::create([
            'donation_id' => $donation4->id,
            'animal_donation_need_id' => $donationNeed ? $donationNeed->id : null,
            'description' => '2 bags of dry dog food and 1 collar',
            'drop_off_date' => now()->subDays(2)->format('Y-m-d'),
            'contact_person' => 'Charlie Green',
            'quantity' => '2 bags',
            'status' => InKindStatus::Received->value,
        ]);

        // 5. Feeding Sponsorship Completed
        $donation5 = Donation::create([
            'public_reference' => 'DON-SPONSOR555',
            'user_id' => $userId,
            'donor_name' => 'Dave Miller',
            'donor_email' => 'dave@example.com',
            'anonymous' => false,
            'type' => DonationType::FeedingSponsorship->value,
            'amount' => 3500,
            'currency' => 'PHP',
            'status' => DonationStatus::Completed->value,
            'verified_at' => now()->subDays(4),
            'verified_by' => $adminId,
        ]);

        Payment::create([
            'donation_id' => $donation5->id,
            'method' => PaymentMethod::Paypal->value,
            'provider' => PaymentProvider::Paypal->value,
            'provider_transaction_id' => 'PAYPAL-TXN-555666',
            'payment_reference' => 'PAY-SPONSOR555',
            'amount' => 3500,
            'currency' => 'PHP',
            'paid_at' => now()->subDays(4),
            'status' => PaymentStatus::Verified->value,
        ]);

        FeedingSponsorship::create([
            'public_reference' => 'FS-SPONSOR555',
            'donation_id' => $donation5->id,
            'donor_name' => 'Dave Miller',
            'donor_email' => 'dave@example.com',
            'donor_mobile' => '09189998888',
            'preferred_date' => now()->addDays(5)->format('Y-m-d'),
            'occasion' => 'My Birthday Celebration',
            'message' => 'Feeding stray cats and dogs in Zone C!',
            'anonymous' => false,
            'amount' => 3500,
            'status' => 'completed',
        ]);
    }
}
