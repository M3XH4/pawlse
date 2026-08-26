<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Models\Donation;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(PaymentStatus::values());
        $isPaid = in_array($status, [PaymentStatus::Verified->value, PaymentStatus::ProofSubmitted->value]);

        return [
            'donation_id' => Donation::factory(),
            'method' => fake()->randomElement(PaymentMethod::values()),
            'provider' => fake()->randomElement(PaymentProvider::values()),
            'provider_transaction_id' => 'TXN-'.strtoupper(fake()->unique()->bothify('#####??##')),
            'payment_reference' => 'PAY-'.strtoupper(fake()->unique()->bothify('??###?##')),
            'amount' => fake()->randomElement([500, 1000, 2000, 3500]),
            'currency' => 'PHP',
            'paid_at' => $isPaid ? now()->subDays(fake()->numberBetween(1, 5)) : null,
            'status' => $status,
        ];
    }
}
