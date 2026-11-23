<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\VolunteerInjuryReport;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VolunteerInjuryReport>
 */
class VolunteerInjuryReportFactory extends Factory
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
            'assigned_task_id' => null,
            'incident_type' => fake()->randomElement(array_keys(VolunteerInjuryReport::INCIDENT_TYPES)),
            'severity' => fake()->randomElement(array_keys(VolunteerInjuryReport::SEVERITIES)),
            'body_part' => fake()->randomElement(['Left Hand', 'Right Forearm', 'Left Ankle', 'Knee']),
            'location' => fake()->streetAddress(),
            'incident_occurred_at' => now()->subHours(fake()->numberBetween(1, 12)),
            'description' => fake()->sentence(12),
            'first_aid_applied' => fake()->boolean(),
            'first_aid_notes' => 'Washed with clean water and applied antiseptic.',
            'status' => VolunteerInjuryReport::StatusReported,
        ];
    }
}
