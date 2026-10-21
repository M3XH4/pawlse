<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Spatie\Permission\Models\Role as PermissionRole;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        if (empty($input['first_name']) && ! empty($input['name'])) {
            $parts = explode(' ', trim($input['name']), 2);
            $input['first_name'] = $parts[0] ?? '';
            $input['last_name'] = $parts[1] ?? ($parts[0] ?? '');
        }

        $middle = ! empty($input['middle_initial']) ? trim(rtrim($input['middle_initial'], '.')).'. ' : '';
        $input['name'] = trim(($input['first_name'] ?? '').' '.$middle.($input['last_name'] ?? ''));

        Validator::make($input, [
            ...$this->profileRules(),
            'first_name' => ['required', 'string', 'max:100'],
            'middle_initial' => ['nullable', 'string', 'max:10'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => $this->passwordRules(),
            'terms' => ['accepted'],
        ], [
            'terms.accepted' => 'You must agree to the Terms of Service and Privacy Policy before creating an account.',
            'first_name.required' => 'The first name field is required.',
            'last_name.required' => 'The last name field is required.',
            'email.required' => 'The email address field is required.',
            'password.required' => 'The password field is required.',
        ])->validate();

        return DB::transaction(function () use ($input): User {
            $middle = ! empty($input['middle_initial']) ? trim(rtrim($input['middle_initial'], '.')).'. ' : '';
            $fullName = trim(($input['first_name'] ?? '').' '.$middle.($input['last_name'] ?? ''));

            $user = User::create([
                'name' => $fullName,
                'first_name' => $input['first_name'],
                'middle_initial' => ! empty($input['middle_initial']) ? trim(rtrim($input['middle_initial'], '.')) : null,
                'last_name' => $input['last_name'],
                'email' => $input['email'],
                'password' => $input['password'],
            ]);

            $user->forceFill([
                'role' => Role::User->value,
            ])->save();

            PermissionRole::findOrCreate(Role::User->value, 'web');
            $user->syncRoles([Role::User]);

            return $user;
        });
    }
}
