<?php

namespace Database\Factories;

use App\Models\FeedingDistributionLog;
use App\Models\FeedingSchedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FeedingDistributionLog>
 */
class FeedingDistributionLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'feeding_schedule_id' => FeedingSchedule::factory(),
            'recorded_by_user_id' => User::factory(),
            'assigned_task_id' => null,
            'street_or_stop' => fake()->streetName(),
            'food_type' => fake()->randomElement(FeedingDistributionLog::FOOD_TYPES),
            'food_packs_distributed' => fake()->numberBetween(3, 20),
            'strays_fed' => fake()->numberBetween(2, 15),
            'notes' => fake()->optional()->sentence(),
            'recorded_at' => now(),
        ];
    }
}
