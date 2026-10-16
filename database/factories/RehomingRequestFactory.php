<?php

namespace Database\Factories;

use App\Models\RehomingRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RehomingRequest>
 */
class RehomingRequestFactory extends Factory
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
            'animal_name' => fake()->firstName(),
            'species' => fake()->randomElement(['Dog', 'Cat', 'Other']),
            'breed' => fake()->word(),
            'gender' => fake()->randomElement(['Male', 'Female', 'Unknown']),
            'age' => fake()->randomElement(['6 months', '1 year', '2 years', '5 years']),
            'current_location' => fake()->city(),
            'reason' => 'Moving to non-pet friendly apartment',
            'health_notes' => 'Vaccinated, dewormed',
            'description' => fake()->paragraph(),
            'photo_path' => null,
            'status' => 'pending',
        ];
    }
}
