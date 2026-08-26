<?php

namespace Database\Factories;

use App\Enums\DonationStatus;
use App\Enums\DonationType;
use App\Models\Donation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Donation>
 */
class DonationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(DonationStatus::values());
        $isVerified = in_array($status, [DonationStatus::Verified->value, DonationStatus::Completed->value]);
        $type = fake()->randomElement(DonationType::values());

        return [
            'public_reference' => 'DON-'.strtoupper(fake()->unique()->bothify('??###?##')),
            'user_id' => fake()->boolean(70) ? User::factory() : null,
            'donor_name' => fake()->name(),
            'donor_email' => fake()->safeEmail(),
            'donor_mobile' => fake()->phoneNumber(),
            'anonymous' => fake()->boolean(20),
            'type' => $type,
            'amount' => $type === DonationType::FeedingSponsorship->value ? 3500 : fake()->randomElement([500, 1000, 2000, 5000]),
            'currency' => 'PHP',
            'status' => $status,
            'purpose' => fake()->randomElement(['General Funding', 'Medical Care', 'Food Supplies', 'Shelter Repair']),
            'notes' => fake()->sentence(),
            'rejection_reason' => $status === DonationStatus::Rejected->value ? fake()->sentence() : null,
            'verified_at' => $isVerified ? now()->subDays(fake()->numberBetween(1, 10)) : null,
            'verified_by' => null,
            'idempotency_key' => fake()->unique()->uuid(),
            'proof_token_hash' => null,
        ];
    }
}
