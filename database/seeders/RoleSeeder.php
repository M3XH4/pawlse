<?php

namespace Database\Seeders;

use App\Enums\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role as PermissionRole;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (Role::cases() as $role) {
            PermissionRole::findOrCreate($role->value, 'web');
        }
    }
}
