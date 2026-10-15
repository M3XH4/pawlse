<?php

namespace Database\Factories;

use App\Models\CommunityHonor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommunityHonor>
 */
class CommunityHonorFactory extends Factory
{
    protected $model = CommunityHonor::class;

    public function definition(): array
    {
        $name = fake()->name();

        return [
            'name' => $name,
            'category' => fake()->randomElement(['donor', 'volunteer', 'sponsor', 'community_supporter']),
            'tier' => fake()->randomElement(['platinum', 'gold', 'silver', null]),
            'role_title' => 'Supporter',
            'description' => fake()->sentence(),
            'badges' => ['Recurring Donor', 'Community Supporter'],
            'initials' => 'TH',
            'is_featured' => fake()->boolean(25),
            'is_public' => true,
            'display_order' => 0,
        ];
    }
}
