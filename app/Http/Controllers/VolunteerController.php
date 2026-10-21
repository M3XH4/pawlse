<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Events\VolunteerApplicationSubmittedEvent;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\VolunteerApplication;
use App\Notifications\SubmissionEReceiptNotification;
use App\Notifications\VolunteerApplicationSubmittedNotification;
use App\Support\EReceiptDispatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
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
                'foster_capacity' => $application->foster_capacity,
                'foster_preference' => $application->foster_preference,
                'foster_needs' => $application->foster_needs,
                'medic_experience' => $application->medic_experience,
                'medic_certifications' => $application->medic_certifications,
                'transport_has_license' => $application->transport_has_license,
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

        $existingApproved = VolunteerApplication::query()
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->first();

        if ($existingApproved !== null) {
            return redirect()->back()->withErrors([
                'error' => 'You already have an approved volunteer application.',
            ]);
        }

        $existingPending = VolunteerApplication::query()
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existingPending !== null) {
            return redirect()->back()->withErrors([
                'error' => 'You already have a pending volunteer application currently under review.',
            ]);
        }

        $validated = $request->validate([
            'fullName' => ['required', 'string', 'max:255'],
            'mobile' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string', 'max:255'],
            'why' => ['required', 'string', 'max:5000'],
            'experience' => ['nullable', 'string', 'max:5000'],
            'foster_capacity' => ['nullable', 'required_if:role,Foster Volunteer', 'integer', 'min:1', 'max:20'],
            'foster_preference' => ['nullable', 'required_if:role,Foster Volunteer', 'in:cats,dogs,both'],
            'foster_needs' => ['nullable', 'string', 'max:5000'],
            'medic_experience' => ['nullable', 'string', 'max:5000'],
            'medic_certifications' => ['nullable', 'required_if:role,Medic Volunteer', 'string', 'min:3', 'max:5000'],
            'transport_has_license' => ['nullable', 'boolean', function ($attribute, $value, $fail) use ($request) {
                if ($request->input('role') === 'Transport' && ! $value) {
                    $fail('You must declare that you have a valid driver\'s license and vehicle registration.');
                }
            }],
        ]);

        $referenceNumber = 'VOL-'.time().'-'.random_int(100, 999);

        $application = VolunteerApplication::query()->create([
            'user_id' => $user->id,
            'full_name' => $validated['fullName'],
            'mobile' => $validated['mobile'],
            'email' => $validated['email'],
            'address' => $validated['address'],
            'role' => $validated['role'],
            'why' => $validated['why'],
            'experience' => $validated['experience'] ?? null,
            'foster_capacity' => $validated['foster_capacity'] ?? null,
            'foster_preference' => $validated['foster_preference'] ?? null,
            'foster_needs' => $validated['foster_needs'] ?? null,
            'medic_experience' => $validated['medic_experience'] ?? null,
            'medic_certifications' => $validated['medic_certifications'] ?? null,
            'transport_has_license' => (bool) ($validated['transport_has_license'] ?? false),
            'status' => 'pending',
            'reference_number' => $referenceNumber,
        ]);

        $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new VolunteerApplicationSubmittedNotification($application));
        }

        EReceiptDispatcher::sendToEmail(
            $application->email,
            SubmissionEReceiptNotification::forVolunteerApplication($application)
        );

        VolunteerApplicationSubmittedEvent::dispatch($application);

        AuditLog::log('volunteer_apply', "Submitted volunteer application (ref: {$referenceNumber})");

        session()->flash('submitted_reference_number', $referenceNumber);

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

        if ($user->hasRole([Role::Admin->value, Role::SuperAdmin->value]) || in_array($user->role, [Role::Admin->value, Role::SuperAdmin->value], true)) {
            return redirect()->route('account.volunteer.index');
        }

        // Prevent state mutation on GET requests (e.g. browser prefetching or spidering)
        if ($request->isMethod('get')) {
            return redirect()->route($user->role === Role::Volunteer->value ? 'account.volunteer.index' : 'account.user.volunteer-status');
        }

        $application = VolunteerApplication::query()
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->first();

        if ($application === null) {
            return redirect()->back()->withErrors([
                'error' => 'You cannot switch to Volunteer Mode yet because you do not have an approved volunteer application. Please check your application status or submit a volunteer application first.',
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

        // Prevent state mutation on GET requests
        if ($request->isMethod('get')) {
            return redirect()->route('account.user.index');
        }

        if ($user->hasRole([Role::Admin->value, Role::SuperAdmin->value]) || in_array($user->role, [Role::Admin->value, Role::SuperAdmin->value], true)) {
            return redirect()->route('account.user.index');
        }

        if ($user->role === Role::Volunteer->value || $user->hasRole(Role::Volunteer->value)) {
            $user->forceFill([
                'role' => Role::User->value,
            ])->save();

            $user->syncRoles([Role::User]);

            AuditLog::log('role_switch_user', 'Switched active role back to user');
        }

        return redirect()->route('account.user.index');
    }
}
