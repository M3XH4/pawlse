<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Enums\Role as UserRole;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission as PermissionModel;
use Spatie\Permission\Models\Role as PermissionRole;
use Spatie\Permission\PermissionRegistrar;

class UserManagementController extends Controller
{
    /**
     * Display the users list with filtering and search, along with roles and permissions.
     */
    public function index(Request $request): Response
    {
        $query = User::query()->with(['roles', 'permissions']);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by Role
        if ($role = $request->input('role')) {
            $query->where(function ($q) use ($role) {
                $q->where('role', $role)
                    ->orWhereHas('roles', function ($rq) use ($role) {
                        $rq->where('name', $role);
                    });
            });
        }

        // Filter by Verification Status
        if ($status = $request->input('status')) {
            if ($status === 'verified') {
                $query->whereNotNull('email_verified_at');
            } elseif ($status === 'unverified') {
                $query->whereNull('email_verified_at');
            }
        }

        // Pagination
        $users = $query->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->roles->first()?->name ?? $user->role ?? 'user',
                    'roles' => $user->roles->pluck('name')->toArray(),
                    'direct_permissions' => $user->permissions->pluck('name')->toArray(),
                    'all_permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at->toDateTimeString(),
                ];
            });

        // Compute metrics
        $totalUsers = User::count();
        $adminsCount = User::where('role', UserRole::Admin->value)->count();
        $volunteersCount = User::where('role', UserRole::Volunteer->value)->count();
        $unverifiedCount = User::whereNull('email_verified_at')->count();

        // Roles list with their permissions & user counts
        $rolesList = PermissionRole::with('permissions')
            ->withCount('users')
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'name' => $r->name,
                    'permissions' => $r->permissions->pluck('name')->toArray(),
                    'users_count' => $r->users_count,
                    'is_system' => in_array($r->name, UserRole::values(), true),
                ];
            });

        // If roles table is empty, seed on the fly or provide defaults
        if ($rolesList->isEmpty()) {
            foreach (UserRole::cases() as $r) {
                PermissionRole::findOrCreate($r->value, 'web');
            }
            $rolesList = PermissionRole::with('permissions')
                ->withCount('users')
                ->get()
                ->map(function ($r) {
                    return [
                        'id' => $r->id,
                        'name' => $r->name,
                        'permissions' => $r->permissions->pluck('name')->toArray(),
                        'users_count' => $r->users_count,
                        'is_system' => in_array($r->name, UserRole::values(), true),
                    ];
                });
        }

        // Categorized permissions catalog
        $permissionCatalog = [];
        foreach (RoleSeeder::PERMISSIONS_BY_MODULE as $category => $perms) {
            $items = [];
            foreach ($perms as $permName => $desc) {
                $items[] = [
                    'name' => $permName,
                    'description' => $desc,
                ];
            }
            $permissionCatalog[] = [
                'category' => $category,
                'permissions' => $items,
            ];
        }

        $allPermissionCount = PermissionModel::count();
        if ($allPermissionCount === 0) {
            $allPermissionCount = array_sum(array_map('count', RoleSeeder::PERMISSIONS_BY_MODULE));
        }

        return Inertia::render('super-admin/user-management', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status', 'tab']),
            'roles' => $rolesList->pluck('name')->toArray(),
            'roles_detail' => $rolesList,
            'permission_catalog' => $permissionCatalog,
            'stats' => [
                'total' => $totalUsers,
                'admins' => $adminsCount,
                'volunteers' => $volunteersCount,
                'unverified' => $unverifiedCount,
                'total_roles' => $rolesList->count(),
                'total_permissions' => $allPermissionCount,
            ],
        ]);
    }

    /**
     * Create a new user with role and permissions.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', Password::defaults()],
            'role' => ['required', 'string'],
            'verified' => ['boolean'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $role = $request->role;
        $user->forceFill([
            'role' => $role,
        ]);

        if ($request->verified) {
            $user->email_verified_at = now();
        }
        $user->save();

        // Ensure role exists and sync
        PermissionRole::findOrCreate($role, 'web');
        $user->syncRoles([$role]);

        if ($request->has('permissions')) {
            $user->syncPermissions($request->permissions ?? []);
        }

        AuditLog::log('user_create', "Created user {$user->name} ({$user->email}) as {$role}");

        return redirect()->back()->with('success', 'User created successfully.');
    }

    /**
     * Update an existing user with role and permissions.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', Password::defaults()],
            'role' => ['required', 'string'],
            'verified' => ['boolean'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string'],
        ]);

        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $role = $request->role;
        $user->role = $role;

        if ($request->verified && ! $user->email_verified_at) {
            $user->email_verified_at = now();
        } elseif (! $request->verified) {
            $user->email_verified_at = null;
        }

        $user->save();

        PermissionRole::findOrCreate($role, 'web');
        $user->syncRoles([$role]);

        if ($request->has('permissions')) {
            $user->syncPermissions($request->permissions ?? []);
        }

        AuditLog::log('user_update', "Updated user {$user->name} ({$user->email}) details and permissions");

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    /**
     * Update permissions for a specific role.
     */
    public function updateRolePermissions(Request $request, string $roleName): RedirectResponse
    {
        $role = PermissionRole::where('name', $roleName)->firstOrFail();

        $request->validate([
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string'],
        ]);

        $role->syncPermissions($request->permissions);
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        AuditLog::log('role_permissions_update', "Updated permissions for role {$role->name}");

        return redirect()->back()->with('success', "Permissions for {$role->name} updated successfully.");
    }

    /**
     * Store a new custom role.
     */
    public function storeRole(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:roles,name'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string'],
        ]);

        $name = strtolower(trim(preg_replace('/[^a-zA-Z0-9_-]/', '-', $request->name)));

        $role = PermissionRole::create([
            'name' => $name,
            'guard_name' => 'web',
        ]);

        if ($request->filled('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        AuditLog::log('role_create', "Created custom role {$role->name}");

        return redirect()->back()->with('success', "Role '{$role->name}' created successfully.");
    }

    /**
     * Delete a custom role.
     */
    public function destroyRole(string $roleName): RedirectResponse
    {
        if (in_array($roleName, UserRole::values(), true)) {
            return redirect()->back()->with('error', 'Cannot delete default system role.');
        }

        $role = PermissionRole::where('name', $roleName)->firstOrFail();

        if ($role->users()->count() > 0) {
            return redirect()->back()->with('error', "Cannot delete role '{$roleName}' because it is assigned to users.");
        }

        $role->delete();

        AuditLog::log('role_delete', "Deleted custom role {$roleName}");

        return redirect()->back()->with('success', "Role '{$roleName}' removed successfully.");
    }

    /**
     * Soft delete a user.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete yourself.');
        }

        $user->delete();

        AuditLog::log('user_delete', "Archived user {$user->name} ({$user->email})");

        return redirect()->back()->with('success', 'User archived successfully.');
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restore(int $id): RedirectResponse
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        AuditLog::log('user_restore', "Restored user {$user->name} ({$user->email})");

        return redirect()->back()->with('success', 'User restored successfully.');
    }
}
