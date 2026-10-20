<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\RehomingRequest;
use App\Notifications\SubmissionEReceiptNotification;
use App\Support\EReceiptDispatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RehomingRequestController extends Controller
{
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
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('rehoming', 'public');
        }

        unset($validated['photo']);

        $rehoming = RehomingRequest::create([
            ...$validated,
            'photo_path' => $photoPath,
            'user_id' => $request->user()?->id,
            'status' => 'pending',
        ]);

        EReceiptDispatcher::sendToEmail(
            $rehoming->email,
            SubmissionEReceiptNotification::forRehomingRequest($rehoming)
        );

        AuditLog::log('rehoming_request', "Rehoming assistance requested for {$rehoming->animal_name} by {$rehoming->full_name}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Rehoming assistance request submitted successfully! ISF will review your submission and coordinate.',
        ]);

        return back();
    }
}
