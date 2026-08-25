<?php

namespace Database\Factories;

use App\Models\Certificate;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Certificate>
 */
class CertificateFactory extends Factory
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
            'event_id' => Event::factory(),
            'title' => 'Certificate of Appreciation',
            'description' => fake()->sentence(),
            'issue_date' => now()->toDateString(),
            'certificate_number' => 'CERT-'.date('Y').'-'.fake()->unique()->lexify('??????'),
        ];
    }
}
