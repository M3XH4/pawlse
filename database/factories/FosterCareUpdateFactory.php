<?php

namespace Database\Factories;

use App\Models\FosterCareUpdate;
use App\Models\FosterPlacement;
use App\Models\ShelterAnimal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FosterCareUpdate>
 */
class FosterCareUpdateFactory extends Factory
{
    protected $model = FosterCareUpdate::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'foster_placement_id' => FosterPlacement::factory(),
            'shelter_animal_id' => fn (array $attributes) => FosterPlacement::find($attributes['foster_placement_id'])->shelter_animal_id ?? ShelterAnimal::factory(),
            'user_id' => fn (array $attributes) => FosterPlacement::find($attributes['foster_placement_id'])->foster_parent_user_id ?? User::factory(),
            'update_type' => 'routine',
            'urgency' => 'low',
            'title' => fake()->sentence(4),
            'notes' => fake()->paragraph(),
            'weight' => fake()->randomFloat(1, 1, 20).' kg',
            'feeding_notes' => 'Eating well with healthy appetite',
            'medication_notes' => null,
            'next_appointment_date' => now()->addDays(7)->toDateString(),
            'admin_notes' => null,
            'acknowledged_by' => null,
            'acknowledged_at' => null,
        ];
    }

    public function emergency(): static
    {
        return $this->state(fn (array $attributes) => [
            'update_type' => 'emergency',
            'urgency' => 'critical',
            'title' => 'Sudden lethargy and loss of appetite',
            'notes' => 'Pet refuses food and appears feverish. Requesting immediate vet examination.',
        ]);
    }
}
