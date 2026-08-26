<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Enums\Role as UserRole;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    /**
     * Display the users list with filtering and search.
     */
    public function index(Request $request): Response
    {
        $query = User::query();

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by Role
        if ($role = $request->input('role')) {
            $query->where('role', $role);
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
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->roles->first()?->name ?? 'user',
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at->toDateTimeString(),
                ];
            });

        // Compute metrics
        $totalUsers = User::count();
        $adminsCount = User::where('role', UserRole::Admin->value)->count();
        $volunteersCount = User::where('role', UserRole::Volunteer->value)->count();
        $unverifiedCount = User::whereNull('email_verified_at')->count();

        return Inertia::render('super-admin/user-management', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status']),
            'roles' => UserRole::values(),
            'stats' => [
                'total' => $totalUsers,
                'admins' => $adminsCount,
                'volunteers' => $volunteersCount,
                'unverified' => $unverifiedCount,
            ],
        ]);
    }

    /**
     * Create a new user.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', Password::defaults()],
            'role' => ['required', 'string', Rule::in(UserRole::values())],
            'verified' => ['boolean'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Sync role
        $role = $request->role;
        $user->forceFill([
            'role' => $role,
        ]);

        if ($request->verified) {
            $user->email_verified_at = now();
        }
        $user->save();

        $user->syncRoles([$role]);

        AuditLog::log('user_create', "Created user {$user->name} ({$user->email}) as {$role}");

        return redirect()->back()->with('success', 'User created successfully.');
    }

    /**
     * Update an existing user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', Password::defaults()],
            'role' => ['required', 'string', Rule::in(UserRole::values())],
            'verified' => ['boolean'],
        ]);

        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->password) {
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
        $user->syncRoles([$role]);

        AuditLog::log('user_update', "Updated user {$user->name} ({$user->email}) settings");

        return redirect()->back()->with('success', 'User updated successfully.');
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
