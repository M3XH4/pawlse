<?php

namespace Database\Factories;

use App\Models\FeedingSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FeedingSchedule>
 */
class FeedingScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'zone' => 'Zone '.fake()->randomDigit().': '.fake()->city(),
            'day' => 'Every Monday',
            'time' => '7:00 AM',
            'volunteers' => 8,
            'strays' => 40,
            'status' => 'active',
        ];
    }
}
