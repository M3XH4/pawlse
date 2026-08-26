<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\VolunteerApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VolunteerController extends Controller
{
    /**
     * Display the volunteer application/status page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $application = null;

        if ($user !== null) {
            $application = VolunteerApplication::query()
                ->where('user_id', $user->id)
                ->latest()
                ->first();
        }

        return Inertia::render('volunteer', [
            'selectedEvent' => $request->input('selectedEvent'),
            'application' => $application ? [
                'id' => $application->id,
                'status' => $application->status,
                'full_name' => $application->full_name,
                'mobile' => $application->mobile,
                'email' => $application->email,
                'address' => $application->address,
                'role' => $application->role,
                'why' => $application->why,
                'experience' => $application->experience,
                'reference_number' => $application->reference_number,
                'rejection_reason' => $application->rejection_reason,
            ] : null,
        ]);
    }

    /**
     * Store a newly created volunteer application in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'fullName' => ['required', 'string', 'max:255'],
            'mobile' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string', 'max:255'],
            'why' => ['required', 'string', 'max:5000'],
            'experience' => ['nullable', 'string', 'max:5000'],
        ]);

        $referenceNumber = 'VOL-'.time().'-'.random_int(100, 999);

        VolunteerApplication::query()->create([
            'user_id' => $user->id,
            'full_name' => $validated['fullName'],
            'mobile' => $validated['mobile'],
            'email' => $validated['email'],
            'address' => $validated['address'],
            'role' => $validated['role'],
            'why' => $validated['why'],
            'experience' => $validated['experience'] ?? null,
            'status' => 'pending',
            'reference_number' => $referenceNumber,
        ]);

        AuditLog::log('volunteer_apply', "Submitted volunteer application (ref: {$referenceNumber})");

        return redirect()->back();
    }

    /**
     * Switch the user's role to volunteer if their application is approved.
     */
    public function switchRole(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->route('login');
        }

        $application = VolunteerApplication::query()
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->first();

        if ($application === null) {
            return redirect()->back()->withErrors([
                'error' => 'You do not have an approved volunteer application.',
            ]);
        }

        $user->forceFill([
            'role' => Role::Volunteer->value,
        ])->save();

        $user->syncRoles([Role::Volunteer]);

        AuditLog::log('role_switch_volunteer', 'Switched active role to volunteer');

        return redirect()->route('account.volunteer.index');
    }

    /**
     * Switch the user's active role back to user.
     */
    public function switchUser(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->route('login');
        }

        $user->forceFill([
            'role' => Role::User->value,
        ])->save();

        $user->syncRoles([Role::User]);

        AuditLog::log('role_switch_user', 'Switched active role back to user');

        return redirect()->route('account.user.index');
    }
}
