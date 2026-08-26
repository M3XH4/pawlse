<?php

namespace Database\Factories;

use App\Enums\InKindStatus;
use App\Models\AnimalDonationNeed;
use App\Models\Donation;
use App\Models\InKindDonation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InKindDonation>
 */
class InKindDonationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'donation_id' => Donation::factory(),
            'animal_donation_need_id' => fake()->boolean(60) ? AnimalDonationNeed::factory() : null,
            'description' => fake()->randomElement([
                '5 bags of adult dry food',
                '10 cans of wet cat food',
                'Box of anti-rabies vaccine vials',
                'Assorted feeding bowls and leashes',
                '2 cat scratch posts',
            ]),
            'drop_off_date' => fake()->dateTimeBetween('-5 days', '+10 days')->format('Y-m-d'),
            'contact_person' => fake()->name(),
            'quantity' => fake()->randomElement(['1 box', '5 packs', '10 units']),
            'status' => fake()->randomElement(InKindStatus::values()),
        ];
    }
}
