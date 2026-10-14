<?php

namespace Database\Factories;

use App\Models\FosterParent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FosterParent>
 */
class FosterParentFactory extends Factory
{
    protected $model = FosterParent::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'status' => 'approved',
            'capacity' => fake()->numberBetween(1, 4),
            'location' => fake()->city().', '.fake()->state(),
            'pet_preference' => fake()->randomElement(['dogs', 'cats', 'both']),
            'housing_type' => fake()->randomElement(['Single Family Home with Yard', 'Apartment', 'Townhouse']),
            'notes' => fake()->sentence(),
            'approved_by' => null,
            'approved_at' => now(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'approved_at' => null,
            'approved_by' => null,
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'suspended',
        ]);
    }
}
