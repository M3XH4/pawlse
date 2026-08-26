<?php

namespace Database\Factories;

use App\Enums\NeedPriority;
use App\Enums\NeedStatus;
use App\Models\AnimalDonationNeed;
use App\Models\ShelterAnimal;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AnimalDonationNeed>
 */
class AnimalDonationNeedFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'shelter_animal_id' => ShelterAnimal::factory(),
            'item' => fake()->randomElement([
                'Puppy Kibble',
                'Adult Dog Food (Wet)',
                'Kitten Formula',
                'Cat Litter (Bentonite)',
                'Anti-Rabies Vaccine',
                'Deworming Tablet',
                'Dog Collar & Leash',
                'Flea & Tick Treatment',
                'Wound Spray',
                'Vitamins',
            ]),
            'quantity' => fake()->randomElement(['2 bags', '5 cans', '10 tablets', '3 boxes', '1 bottle']),
            'priority' => fake()->randomElement(NeedPriority::values()),
            'status' => fake()->randomElement(NeedStatus::values()),
        ];
    }
}
