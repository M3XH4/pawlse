<?php

namespace Database\Factories;

use App\Enums\AnimalAgeCategory;
use App\Enums\AnimalGender;
use App\Enums\AnimalType;
use App\Enums\ShelterAnimalStatus;
use App\Models\ShelterAnimal;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShelterAnimal>
 */
class ShelterAnimalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->firstName(),
            'type' => fake()->randomElement(AnimalType::values()),
            'breed' => fake()->randomElement(['Aspin', 'Puspin', 'Labrador Mix', 'Shih Tzu Mix', 'Beagle Mix']),
            'age' => fake()->numberBetween(1, 10).' '.fake()->randomElement(['mos', 'yrs']),
            'age_category' => fake()->randomElement(AnimalAgeCategory::values()),
            'gender' => fake()->randomElement(AnimalGender::values()),
            'color' => fake()->randomElement(['Brown', 'Black', 'White', 'Golden', 'Orange', 'Gray', 'Tricolor']),
            'behavior' => fake()->sentence(),
            'story' => fake()->paragraph(),
            'photo_url' => fake()->imageUrl(640, 480, 'animals', true),
            'gallery_photos' => [],
            'vaccinated' => fake()->boolean(),
            'admitted_at' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'status' => fake()->randomElement([
                ShelterAnimalStatus::Available,
                ShelterAnimalStatus::Foster,
                ShelterAnimalStatus::Adopted,
            ]),
            'current_location' => fake()->randomElement(['Main Shelter - Kennel A1', 'Main Shelter - Cattery B', 'Quarantine Ward 2', 'Clinic Recovery Room']),
            'microchip_id' => '985'.fake()->numerify('############'),
            'weight' => fake()->randomFloat(1, 2, 30).' kg',
            'intake_type' => fake()->randomElement(['rescue', 'surrender', 'stray']),
            'rescue_date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'rescue_location' => fake()->city(),
            'rescue_story' => fake()->paragraph(),
        ];
    }

    public function deceased(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ShelterAnimalStatus::Deceased,
            'deceased_at' => fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
            'deceased_notes' => 'Passed away peacefully due to natural old age complications. Surrounded by loving care staff.',
        ]);
    }

    public function adopted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ShelterAnimalStatus::Adopted,
            'adoption_date' => fake()->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
            'adopter_name' => fake()->name(),
            'adopter_email' => fake()->safeEmail(),
            'adopter_phone' => fake()->phoneNumber(),
            'adoption_notes' => 'Adopted by a loving family with a spacious backyard.',
        ]);
    }

    public function foster(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ShelterAnimalStatus::Foster,
            'current_location' => 'Foster Home Care',
        ]);
    }

    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ShelterAnimalStatus::Available,
        ]);
    }

    public function withGallery(int $count = 3): static
    {
        return $this->state(fn (array $attributes) => [
            'gallery_photos' => collect(range(1, $count))
                ->map(fn (int $i) => "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&sig={$i}")
                ->all(),
        ]);
    }
}
