<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\RehomingRequest;
use App\Models\User;
use App\Notifications\SubmissionEReceiptNotification;
use App\Support\EReceiptDispatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RehomingRequestController extends Controller
{
    /**
     * Display the authenticated user's rehoming assistance requests.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $rehomingRequests = RehomingRequest::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(email) = ?', [strtolower((string) $user->email)]);
            })
            ->latest()
            ->get();

        return Inertia::render('user/rehoming-requests', [
            'rehomingRequests' => $rehomingRequests,
        ]);
    }

    /**
     * Withdraw a pending rehoming assistance request by the guardian.
     */
    public function cancel(Request $request, RehomingRequest $rehomingRequest): RedirectResponse
    {
        $user = $request->user();

        $isOwner = $rehomingRequest->user_id === $user->id
            || strtolower((string) $rehomingRequest->email) === strtolower((string) $user->email);

        if (! $isOwner) {
            abort(403, 'Unauthorized to withdraw this rehoming request.');
        }

        if ($rehomingRequest->status !== 'pending') {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Only pending rehoming requests can be withdrawn.',
            ]);

            return back();
        }

        $ref = 'REH-'.str_pad((string) $rehomingRequest->id, 5, '0', STR_PAD_LEFT);
        $animalName = $rehomingRequest->animal_name;

        $rehomingRequest->delete();

        AuditLog::log('rehoming_request_withdrawn', "Guardian {$user->name} withdrew rehoming request {$ref} for {$animalName}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Rehoming request ({$ref}) for {$animalName} has been withdrawn.",
        ]);

        return back();
    }

    /**
     * Store a new rehoming assistance request.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'animal_name' => ['required', 'string', 'max:255'],
            'species' => ['required', 'string', 'in:Dog,Cat,Other'],
            'breed' => ['nullable', 'string', 'max:255'],
            'gender' => ['required', 'string', 'in:Male,Female,Unknown'],
            'age' => ['nullable', 'string', 'max:100'],
            'current_location' => ['required', 'string', 'max:255'],
            'reason' => ['required', 'string', 'max:255'],
            'health_notes' => ['nullable', 'string', 'max:2000'],
            'description' => ['nullable', 'string', 'max:3000'],
            'photo' => ['required', 'image', 'max:5120'],
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('rehoming', 'public');
        }

        unset($validated['photo']);

        $userId = $request->user()?->id;
        if (! $userId) {
            $existingUser = User::whereRaw('LOWER(email) = ?', [strtolower($validated['email'])])->first();
            $userId = $existingUser?->id;
        }

        $rehoming = RehomingRequest::create([
            ...$validated,
            'photo_path' => $photoPath,
            'user_id' => $userId,
            'status' => 'pending',
        ]);

        $ref = 'REH-'.str_pad((string) $rehoming->id, 5, '0', STR_PAD_LEFT);

        EReceiptDispatcher::sendToUserAndEmail(
            $rehoming->user ?? $request->user(),
            $rehoming->email,
            SubmissionEReceiptNotification::forRehomingRequest($rehoming)
        );

        AuditLog::log('rehoming_request', "Rehoming assistance requested for {$rehoming->animal_name} by {$rehoming->full_name}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Rehoming assistance request submitted (Ref: {$ref})! ISF will review your submission and coordinate.",
        ]);

        if (! $request->user()) {
            return redirect()->route('track', ['reference' => $ref, 'email' => $rehoming->email]);
        }

        if (! $request->user()->isAdmin() && ! $request->user()->isSuperAdmin()) {
            return redirect()->route('account.user.rehoming-requests');
        }

        return back();
    }
}
