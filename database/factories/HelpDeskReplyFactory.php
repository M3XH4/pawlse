<?php

namespace Database\Factories;

use App\Models\HelpDeskReply;
use App\Models\HelpDeskTicket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HelpDeskReply>
 */
class HelpDeskReplyFactory extends Factory
{
    protected $model = HelpDeskReply::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ticket_id' => HelpDeskTicket::factory(),
            'user_id' => User::factory(),
            'message' => fake()->paragraph(),
            'is_internal_note' => false,
        ];
    }

    public function internalNote(): static
    {
        return $this->state(fn () => [
            'is_internal_note' => true,
        ]);
    }
}
