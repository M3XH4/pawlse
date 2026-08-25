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
            'vaccinated' => fake()->boolean(),
            'admitted_at' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'status' => fake()->randomElement(ShelterAnimalStatus::values()),
        ];
    }
}
