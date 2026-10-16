<?php

namespace Database\Factories;

use App\Models\PostAdoptionFollowUp;
use App\Models\ShelterAnimal;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PostAdoptionFollowUp>
 */
class PostAdoptionFollowUpFactory extends Factory
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
            'follow_up_date' => now()->format('Y-m-d'),
            'method' => fake()->randomElement(['chat', 'call', 'photo_update', 'video', 'home_visit']),
            'status' => 'completed',
            'pet_condition' => fake()->randomElement(['Excellent', 'Good', 'Needs Attention']),
            'notes' => fake()->paragraph(),
            'photo_path' => null,
            'next_follow_up_date' => now()->addMonths(1)->format('Y-m-d'),
        ];
    }
}
