<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $accounts = [
            [
                'name' => 'Pawlse User',
                'email' => 'user@pawlse.test',
                'role' => Role::User,
            ],
            [
                'name' => 'Pawlse Volunteer',
                'email' => 'volunteer@pawlse.test',
                'role' => Role::Volunteer,
            ],
            [
                'name' => 'Pawlse Admin',
                'email' => 'admin@pawlse.test',
                'role' => Role::Admin,
            ],
            [
                'name' => 'Pawlse Super Admin',
                'email' => 'superadmin@pawlse.test',
                'role' => Role::SuperAdmin,
            ],
        ];

        foreach ($accounts as $account) {
            /** @var User $user */
            $user = User::query()->updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => 'password',
                ],
            );

            $user->forceFill([
                'role' => $account['role']->value,
                'email_verified_at' => $user->email_verified_at ?? now(),
                'email_verification_otp_hash' => null,
                'email_verification_otp_expires_at' => null,
                'email_verification_otp_sent_at' => null,
                'email_verification_otp_attempts' => 0,
            ])->save();

            $user->syncRoles([$account['role']]);
        }
    }
}
