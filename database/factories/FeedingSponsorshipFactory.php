<?php

namespace Database\Factories;

use App\Models\Donation;
use App\Models\FeedingSponsorship;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FeedingSponsorship>
 */
class FeedingSponsorshipFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'public_reference' => 'FS-'.strtoupper(fake()->unique()->bothify('??###?##')),
            'donation_id' => Donation::factory(),
            'donor_name' => fake()->name(),
            'donor_email' => fake()->safeEmail(),
            'donor_mobile' => fake()->phoneNumber(),
            'preferred_date' => fake()->dateTimeBetween('+1 day', '+30 days')->format('Y-m-d'),
            'occasion' => fake()->randomElement(['My Birthday', 'Company Anniversary', 'In Memory of Fluffy', 'Family Gathering']),
            'message' => fake()->sentence(),
            'anonymous' => fake()->boolean(20),
            'amount' => 3500,
            'status' => fake()->randomElement(['pending', 'completed']),
        ];
    }
}
