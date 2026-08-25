<?php

namespace Database\Factories;

use App\Models\PetReport;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PetReport>
 */
class PetReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => $this->faker->randomElement(['rescue', 'missing', 'sos']),
            'status' => 'pending',
            'animal_type' => $this->faker->randomElement(['Dog', 'Cat', 'Other']),
            'breed' => $this->faker->word(),
            'age_category' => $this->faker->randomElement(['Puppy/Kitten', 'Young Adult', 'Adult', 'Senior']),
            'gender' => $this->faker->randomElement(['Male', 'Female', 'Unknown']),
            'name' => $this->faker->firstName(),
            'color' => $this->faker->safeColorName(),
            'last_seen_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'description' => $this->faker->sentence(),
            'location' => sprintf('%f, %f (Fake Location)', $this->faker->latitude(8.20, 8.24), $this->faker->longitude(124.22, 124.26)),
            'contact_name' => $this->faker->name(),
            'contact_phone' => $this->faker->phoneNumber(),
            'contact_email' => $this->faker->safeEmail(),
        ];
    }
}
