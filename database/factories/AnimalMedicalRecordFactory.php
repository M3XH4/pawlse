<?php

namespace Database\Factories;

use App\Models\AnimalMedicalRecord;
use App\Models\ShelterAnimal;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AnimalMedicalRecord>
 */
class AnimalMedicalRecordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'shelter_animal_id' => ShelterAnimal::factory(),
            'record_type' => fake()->randomElement(['vaccination', 'medical_checkup', 'surgery', 'treatment', 'medication']),
            'title' => fake()->randomElement(['Rabies Vaccine', 'DHPP Booster', 'Deworming', 'General Wellness Exam', 'Neutering Procedure', 'Antibiotic Treatment']),
            'performed_date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'next_due_date' => fake()->optional()->dateTimeBetween('now', '+1 year')?->format('Y-m-d'),
            'veterinarian' => fake()->randomElement(['Dr. Maria Santos, DVM', 'Dr. John Reyes, DVM', 'City Central Vet Clinic', 'Pawlse Veterinary Staff']),
            'batch_number' => 'VAC-'.fake()->numerify('#####'),
            'dosage' => fake()->randomElement(['1.0 ml SQ', '0.5 ml IM', '1 tablet daily', '5mg/kg']),
            'status' => 'completed',
            'notes' => fake()->sentence(),
            'created_by' => null,
        ];
    }

    public function vaccination(): static
    {
        return $this->state(fn (array $attributes) => [
            'record_type' => 'vaccination',
            'title' => fake()->randomElement(['Rabies Vaccine', 'DHPP Vaccine 5-in-1', 'Bordetella Intranasal', 'FVRCP Cat Vaccine', 'Feline Leukemia Vaccine']),
        ]);
    }

    public function medical(): static
    {
        return $this->state(fn (array $attributes) => [
            'record_type' => 'medical_checkup',
            'title' => fake()->randomElement(['Routine Health Assessment', 'Wound Dressing & Antibiotics', 'Dental Cleaning', 'Blood Chemistry Panel']),
        ]);
    }
}
