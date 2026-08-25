<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shelter_animals', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type');
            $table->string('age')->nullable();
            $table->string('photo_url')->nullable();
            $table->timestamps();
        });

        Schema::create('animal_donation_needs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shelter_animal_id')->constrained()->cascadeOnDelete();
            $table->string('item');
            $table->string('quantity');
            $table->string('priority');
            $table->string('status')->default('open');
            $table->timestamps();

            $table->index(['status', 'priority']);
        });

        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->string('public_reference', 32)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('donor_name');
            $table->string('donor_email');
            $table->string('donor_mobile')->nullable();
            $table->boolean('anonymous')->default(false);
            $table->string('type');
            $table->unsignedInteger('amount')->nullable();
            $table->string('currency', 8)->default('PHP');
            $table->string('status');
            $table->string('purpose')->nullable();
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('idempotency_key')->nullable()->unique();
            $table->string('proof_token_hash')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('type');
            $table->index('donor_email');
            $table->index('created_at');
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_id')->constrained()->cascadeOnDelete();
            $table->string('method');
            $table->string('provider');
            $table->string('provider_transaction_id')->nullable()->unique();
            $table->string('payment_reference')->nullable();
            $table->unsignedInteger('amount');
            $table->string('currency', 8)->default('PHP');
            $table->timestamp('paid_at')->nullable();
            $table->string('status');
            $table->timestamps();

            $table->index('method');
            $table->index('status');
            $table->unique('payment_reference');
        });

        Schema::create('payment_proofs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->string('disk');
            $table->string('path');
            $table->string('original_filename');
            $table->string('mime_type');
            $table->unsignedInteger('file_size');
            $table->timestamp('uploaded_at');
            $table->timestamps();
        });

        Schema::create('feeding_sponsorships', function (Blueprint $table) {
            $table->id();
            $table->string('public_reference', 32)->unique();
            $table->foreignId('donation_id')->constrained()->cascadeOnDelete();
            $table->string('donor_name');
            $table->string('donor_email');
            $table->string('donor_mobile');
            $table->date('preferred_date');
            $table->string('occasion')->nullable();
            $table->text('message')->nullable();
            $table->boolean('anonymous')->default(false);
            $table->unsignedInteger('amount');
            $table->string('status');
            $table->timestamps();
        });

        Schema::create('in_kind_donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('animal_donation_need_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description');
            $table->date('drop_off_date')->nullable();
            $table->string('contact_person');
            $table->string('quantity')->nullable();
            $table->string('status');
            $table->timestamps();
        });

        Schema::create('donation_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_id')->constrained()->cascadeOnDelete();
            $table->string('action');
            $table->string('old_status')->nullable();
            $table->string('new_status')->nullable();
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at');

            $table->index(['donation_id', 'created_at']);
        });

        Schema::create('donation_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_id')->constrained()->cascadeOnDelete();
            $table->string('status');
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('reason')->nullable();
            $table->timestamp('created_at');

            $table->index(['donation_id', 'created_at']);
        });

        Schema::create('idempotency_records', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('scope');
            $table->unsignedInteger('status_code');
            $table->json('payload');
            $table->timestamps();
        });

        Schema::create('payment_webhook_events', function (Blueprint $table) {
            $table->id();
            $table->string('provider');
            $table->string('event_id');
            $table->json('payload')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->unique(['provider', 'event_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_webhook_events');
        Schema::dropIfExists('idempotency_records');
        Schema::dropIfExists('donation_status_histories');
        Schema::dropIfExists('donation_audit_logs');
        Schema::dropIfExists('in_kind_donations');
        Schema::dropIfExists('feeding_sponsorships');
        Schema::dropIfExists('payment_proofs');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('donations');
        Schema::dropIfExists('animal_donation_needs');
        Schema::dropIfExists('shelter_animals');
    }
};
