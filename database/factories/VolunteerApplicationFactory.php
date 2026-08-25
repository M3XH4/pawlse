<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\VolunteerApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VolunteerApplication>
 */
class VolunteerApplicationFactory extends Factory
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
            'full_name' => fake()->name(),
            'mobile' => fake()->phoneNumber(),
            'email' => fake()->safeEmail(),
            'address' => fake()->address(),
            'role' => 'Food Carrier',
            'why' => fake()->sentence(),
            'experience' => fake()->sentence(),
            'status' => 'pending',
            'reference_number' => 'VOL-'.fake()->unique()->numerify('#########'),
        ];
    }
}
