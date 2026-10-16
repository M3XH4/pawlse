<?php

namespace Database\Factories;

use App\Models\ShelterVisit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShelterVisit>
 */
class ShelterVisitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'contact_number' => fake()->phoneNumber(),
            'email' => fake()->safeEmail(),
            'preferred_date' => fake()->dateTimeBetween('+1 day', '+2 weeks')->format('Y-m-d'),
            'preferred_time_slot' => 'Morning (9:00 AM - 12:00 PM)',
            'number_of_visitors' => fake()->numberBetween(1, 4),
            'purpose' => 'Meet Adoptable Animals',
            'additional_notes' => fake()->sentence(),
            'status' => 'pending',
        ];
    }
}
