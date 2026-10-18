<?php

namespace Database\Factories;

use App\Models\ContactMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContactMessage>
 */
class ContactMessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'category' => fake()->randomElement(['general', 'adoption', 'volunteer', 'donation', 'shelter_visit', 'partnership', 'other']),
            'subject' => fake()->sentence(4),
            'message' => fake()->paragraphs(2, true),
            'ip_address' => fake()->ipv4(),
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'status' => 'unread',
        ];
    }
}
