<?php

namespace Database\Factories;

use App\Models\HelpDeskTicket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HelpDeskTicket>
 */
class HelpDeskTicketFactory extends Factory
{
    protected $model = HelpDeskTicket::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ticket_number' => HelpDeskTicket::generateTicketNumber(),
            'user_id' => User::factory(),
            'category' => fake()->randomElement(['adoption', 'rescue', 'donation', 'foster', 'volunteer', 'technical', 'inquiry']),
            'priority' => fake()->randomElement(['low', 'medium', 'high', 'urgent']),
            'status' => 'open',
            'subject' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'target_role' => 'admin',
            'is_escalated' => false,
            'escalated_to_super_admin_at' => null,
            'escalation_reason' => null,
            'assigned_to_user_id' => null,
            'resolved_at' => null,
            'resolved_by_user_id' => null,
        ];
    }

    public function escalated(): static
    {
        return $this->state(fn () => [
            'is_escalated' => true,
            'escalated_to_super_admin_at' => now(),
            'escalation_reason' => fake()->sentence(),
            'target_role' => 'super-admin',
        ]);
    }

    public function resolved(): static
    {
        return $this->state(fn () => [
            'status' => 'resolved',
            'resolved_at' => now(),
            'resolved_by_user_id' => User::factory()->admin(),
        ]);
    }

    public function targetedToSuperAdmin(): static
    {
        return $this->state(fn () => [
            'target_role' => 'super-admin',
        ]);
    }
}
