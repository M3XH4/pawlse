<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ShelterVisit;
use App\Notifications\SubmissionEReceiptNotification;
use App\Support\EReceiptDispatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ShelterVisitController extends Controller
{
    /**
     * Store a new shelter visit request.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'preferred_date' => ['required', 'date', 'after_or_equal:today'],
            'preferred_time_slot' => ['nullable', 'string', 'max:100'],
            'number_of_visitors' => ['required', 'integer', 'min:1', 'max:10'],
            'purpose' => ['required', 'string', 'max:100'],
            'shelter_animal_id' => ['nullable', 'exists:shelter_animals,id'],
            'additional_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $visit = DB::transaction(function () use ($validated, $request) {
            if (! empty($validated['preferred_time_slot'])) {
                $existingVisitorsCount = (int) ShelterVisit::whereDate('preferred_date', $validated['preferred_date'])
                    ->where('preferred_time_slot', $validated['preferred_time_slot'])
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->lockForUpdate()
                    ->sum('number_of_visitors');

                if ($existingVisitorsCount + (int) $validated['number_of_visitors'] > 10) {
                    throw ValidationException::withMessages([
                        'preferred_time_slot' => 'The selected date and time slot has reached maximum visitor capacity (10 visitors limit). Please select another time slot or date.',
                    ]);
                }
            }

            return ShelterVisit::create([
                ...$validated,
                'user_id' => $request->user()?->id,
                'status' => 'pending',
            ]);
        });

        EReceiptDispatcher::sendToEmail(
            $visit->email,
            SubmissionEReceiptNotification::forShelterVisit($visit)
        );

        AuditLog::log('shelter_visit_request', "Shelter visit requested by {$visit->full_name} for {$visit->preferred_date->format('Y-m-d')}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Your shelter visit request has been submitted! ISF will contact you to coordinate and confirm your schedule.',
        ]);

        return back();
    }
}
