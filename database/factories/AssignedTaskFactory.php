<?php

namespace Database\Factories;

use App\Models\AssignedTask;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AssignedTask>
 */
class AssignedTaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'event_id' => Event::factory(),
            'feeding_schedule_id' => null,
            'role' => 'Food Carrier',
            'status' => 'pending',
            'hours_logged' => 0.00,
        ];
    }
}
