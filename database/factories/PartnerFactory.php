<?php

namespace Database\Factories;

use App\Models\Partner;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Partner>
 */
class PartnerFactory extends Factory
{
    protected $model = Partner::class;

    public function definition(): array
    {
        $name = fake()->company().' Veterinary';

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(5),
            'category' => fake()->randomElement(['veterinary', 'food_supply', 'collaborator', 'sponsor']),
            'badge_title' => 'Trusted Partner',
            'badges' => ['Emergency Option', 'Trusted Veterinary Resource'],
            'short_description' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'address' => fake()->streetAddress(),
            'city' => 'Iligan City',
            'phone' => '+63 9'.fake()->numerify('#########'),
            'email' => fake()->safeEmail(),
            'website_url' => fake()->url(),
            'social_url' => fake()->url(),
            'operating_hours' => 'Mon-Sat 8:00 AM - 6:00 PM',
            'services' => ['Emergency Care', 'Vaccinations', 'Grooming'],
            'image_url' => '/images/partners/petmate.jpg',
            'is_emergency' => fake()->boolean(40),
            'is_featured' => fake()->boolean(20),
            'is_active' => true,
            'display_order' => 0,
        ];
    }

    public function veterinary(): static
    {
        return $this->state(fn () => [
            'category' => 'veterinary',
            'is_emergency' => true,
        ]);
    }

    public function foodSupply(): static
    {
        return $this->state(fn () => [
            'category' => 'food_supply',
            'is_emergency' => false,
        ]);
    }
}
