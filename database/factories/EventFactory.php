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
            'keywords' => ['feeding', 'stray'],
        ];
    }
}
