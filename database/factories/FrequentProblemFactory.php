<?php

namespace Database\Factories;

use App\Models\FrequentProblem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FrequentProblem>
 */
class FrequentProblemFactory extends Factory
{
    protected $model = FrequentProblem::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(5),
            'category' => fake()->randomElement(['Adoption', 'Rescue & SOS', 'Foster Care', 'Donations', 'Volunteer Tasks', 'Account & Technical']),
            'problem_description' => fake()->paragraph(),
            'solution' => fake()->paragraphs(2, true),
            'target_audience' => fake()->randomElement(['all', 'user', 'volunteer', 'admin']),
            'is_published' => true,
            'display_order' => fake()->numberBetween(0, 10),
            'helpful_count' => fake()->numberBetween(0, 50),
            'created_by_user_id' => User::factory(),
        ];
    }

    public function forUser(): static
    {
        return $this->state(fn () => ['target_audience' => 'user']);
    }

    public function forVolunteer(): static
    {
        return $this->state(fn () => ['target_audience' => 'volunteer']);
    }

    public function forAdmin(): static
    {
        return $this->state(fn () => ['target_audience' => 'admin']);
    }

    public function unpublished(): static
    {
        return $this->state(fn () => ['is_published' => false]);
    }
}
