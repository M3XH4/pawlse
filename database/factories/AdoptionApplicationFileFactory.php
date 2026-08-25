<?php

namespace Database\Factories;

use App\Enums\AdoptionDocumentKind;
use App\Models\AdoptionApplication;
use App\Models\AdoptionApplicationFile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AdoptionApplicationFile>
 */
class AdoptionApplicationFileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'adoption_application_id' => AdoptionApplication::factory(),
            'kind' => fake()->randomElement(AdoptionDocumentKind::values()),
            'path' => 'adoption_files/'.fake()->uuid().'.jpg',
            'original_filename' => fake()->word().'.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => fake()->numberBetween(10000, 2000000),
        ];
    }
}
