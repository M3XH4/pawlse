<?php

namespace Database\Factories;

use App\Models\FosterParent;
use App\Models\FosterPlacement;
use App\Models\ShelterAnimal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FosterPlacement>
 */
class FosterPlacementFactory extends Factory
{
    protected $model = FosterPlacement::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'shelter_animal_id' => ShelterAnimal::factory(),
            'foster_parent_id' => function (array $attributes) {
                return FosterParent::factory()->create([
                    'user_id' => $attributes['foster_parent_user_id'] ?? User::factory(),
                ])->id;
            },
            'foster_parent_user_id' => fn () => User::factory()->create()->id,
            'status' => 'active',
            'start_date' => now()->toDateString(),
            'expected_review_date' => now()->addWeeks(2)->toDateString(),
            'end_date' => null,
            'care_instructions' => fake()->sentence(),
            'medical_notes' => fake()->sentence(),
            'dietary_requirements' => 'Twice a day with wet food',
            'special_needs' => null,
            'placement_notes' => fake()->sentence(),
            'transfer_reason' => null,
            'end_reason' => null,
            'assigned_by' => null,
            'transferred_by' => null,
            'previous_placement_id' => null,
        ];
    }

    public function transferred(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'transferred',
            'end_date' => now()->toDateString(),
            'transfer_reason' => 'Transferred for medical attention closer to vet',
        ]);
    }

    public function ended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'ended',
            'end_date' => now()->toDateString(),
            'end_reason' => 'Pet successfully adopted or returned to shelter',
        ]);
    }
}
