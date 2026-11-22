<?php

namespace Database\Factories;

use App\Models\Partner;
use App\Models\PartnerFoodPickup;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PartnerFoodPickup>
 */
class PartnerFoodPickupFactory extends Factory
{
    protected $model = PartnerFoodPickup::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'partner_id' => Partner::factory()->dailyFood(),
            'pickup_date' => now()->toDateString(),
            'assigned_volunteer_id' => null,
            'assigned_by' => null,
            'status' => PartnerFoodPickup::StatusPending,
            'food_summary' => 'Daily shelter food batch (1-day shelf life)',
        ];
    }
}
