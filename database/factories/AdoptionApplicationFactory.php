<?php

namespace Database\Factories;

use App\Enums\AdoptionApplicationStatus;
use App\Models\AdoptionApplication;
use App\Models\ShelterAnimal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AdoptionApplication>
 */
class AdoptionApplicationFactory extends Factory
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
            'shelter_animal_id' => ShelterAnimal::factory(),
            'status' => fake()->randomElement(AdoptionApplicationStatus::values()),

            // Personal Info
            'full_name' => fake()->name(),
            'address' => fake()->address(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->safeEmail(),
            'birth_date' => fake()->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
            'occupation' => fake()->jobTitle(),
            'company' => fake()->company(),
            'social_media' => 'facebook.com/'.fake()->userName(),
            'status_marital' => fake()->randomElement(['Single', 'Married', 'Others']),
            'pronouns' => fake()->randomElement(['She/Her', 'He/Him', 'They/Them']),
            'adoption_source' => ['Website', 'Social Media'],
            'adopted_before' => fake()->boolean(),

            // Emergency Contact
            'emergency_name' => fake()->name(),
            'emergency_relationship' => fake()->randomElement(['Mother', 'Father', 'Sibling', 'Friend']),
            'emergency_phone' => fake()->phoneNumber(),
            'emergency_email' => fake()->safeEmail(),

            // Questionnaire
            'adoption_preference' => fake()->randomElement(['Cat', 'Dog', 'Both']),
            'residence_type' => fake()->randomElement(['House', 'Apartment', 'Condo']),
            'is_renting' => fake()->boolean(),
            'moving_plan' => 'I will bring the pet with me.',
            'lives_with' => ['Partner', 'Children'],
            'has_allergies' => fake()->boolean(),
            'daily_care_handler' => 'Myself',
            'expenses_handler' => 'Myself',
            'emergency_handler' => 'Myself',
            'hours_alone' => fake()->randomElement(['1-2 hours', '3-4 hours', 'None']),
            'introduction_plan' => fake()->sentence(),
            'family_support' => true,
            'family_support_explanation' => null,
            'current_pets' => fake()->boolean(),
            'past_pets' => fake()->boolean(),

            // Schedule
            'preferred_date' => fake()->dateTimeBetween('+1 day', '+2 weeks')->format('Y-m-d'),
            'preferred_time' => '10:00',
            'can_visit_shelter' => true,

            'rejection_reason' => null,
            'notes' => null,
        ];
    }
}
