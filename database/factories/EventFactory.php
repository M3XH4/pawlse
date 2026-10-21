<?php

namespace Database\Factories;

use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'category' => 'Feeding',
            'date' => fake()->date(),
            'time' => '8:00 AM - 11:00 AM',
            'location' => fake()->address(),
            'spots' => 10,
            'desc' => fake()->paragraph(),
            'status' => 'open',
            'approval_status' => 'approved',
            'approved_at' => now(),
            'keywords' => ['feeding', 'stray'],
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'approval_status' => 'pending',
            'status' => 'closed',
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'approval_status' => 'rejected',
            'status' => 'closed',
            'rejection_reason' => 'Rejected for scheduling conflict',
        ]);
    }
}
