<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ShelterVisit;
use App\Models\SystemSetting;
use App\Models\User;
use App\Notifications\SubmissionEReceiptNotification;
use App\Support\EReceiptDispatcher;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ShelterVisitController extends Controller
{
    /**
     * Display the authenticated user's shelter visit requests.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $visits = ShelterVisit::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(email) = ?', [strtolower((string) $user->email)]);
            })
            ->with('shelterAnimal')
            ->latest()
            ->get();

        $shelterVisitSettings = SystemSetting::getValue('shelter_visit_settings', [
            'max_visitors_per_slot' => 10,
            'max_visitors_per_booking' => 10,
            'closed_days' => ['Sunday'],
            'blackout_dates' => [],
            'is_accepting_visits' => true,
        ]);

        return Inertia::render('user/shelter-visits', [
            'visits' => $visits,
            'shelterVisitSettings' => $shelterVisitSettings,
        ]);
    }

    /**
     * Cancel a pending or confirmed shelter visit request by the visitor.
     */
    public function cancel(Request $request, ShelterVisit $visit): RedirectResponse
    {
        $user = $request->user();

        $isOwner = $visit->user_id === $user->id
            || strtolower((string) $visit->email) === strtolower((string) $user->email);

        if (! $isOwner) {
            abort(403, 'Unauthorized to cancel this shelter visit.');
        }

        if (! in_array($visit->status, ['pending', 'confirmed'], true)) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Only pending or confirmed shelter visits can be cancelled.',
            ]);

            return back();
        }

        $visit->update([
            'status' => 'cancelled',
        ]);

        $ref = 'VIS-'.str_pad((string) $visit->id, 5, '0', STR_PAD_LEFT);
        AuditLog::log('shelter_visit_cancelled', "Visitor {$user->name} cancelled shelter visit {$ref}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Shelter visit request ({$ref}) has been cancelled.",
        ]);

        return back();
    }

    /**
     * Store a new shelter visit request.
     */
    public function store(Request $request): RedirectResponse
    {
        $settings = SystemSetting::getValue('shelter_visit_settings', [
            'max_visitors_per_slot' => 10,
            'max_visitors_per_booking' => 10,
            'closed_days' => ['Sunday'],
            'blackout_dates' => [],
            'is_accepting_visits' => true,
        ]);

        if (empty($settings['is_accepting_visits'])) {
            throw ValidationException::withMessages([
                'preferred_date' => 'The shelter is temporarily not accepting visit requests. Please check back later or contact us.',
            ]);
        }

        $maxBooking = (int) ($settings['max_visitors_per_booking'] ?? 10);
        $maxPerSlot = (int) ($settings['max_visitors_per_slot'] ?? 10);

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'preferred_date' => ['required', 'date', 'after_or_equal:today'],
            'preferred_time_slot' => ['nullable', 'string', 'max:100'],
            'number_of_visitors' => ['required', 'integer', 'min:1', "max:{$maxBooking}"],
            'purpose' => ['required', 'string', 'max:100'],
            'shelter_animal_id' => ['nullable', 'exists:shelter_animals,id'],
            'additional_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $visitDate = Carbon::parse($validated['preferred_date']);
        $dayOfWeek = $visitDate->format('l');
        $closedDays = $settings['closed_days'] ?? ['Sunday'];

        if (in_array($dayOfWeek, $closedDays, true)) {
            throw ValidationException::withMessages([
                'preferred_date' => "The shelter is closed for visits on {$dayOfWeek}s. Please choose another day.",
            ]);
        }

        $blackoutDates = $settings['blackout_dates'] ?? [];
        if (in_array($visitDate->format('Y-m-d'), $blackoutDates, true)) {
            throw ValidationException::withMessages([
                'preferred_date' => 'The shelter is closed for scheduled events or holidays on this selected date. Please choose another date.',
            ]);
        }

        // Validate same-day slots if booking for today
        if ($visitDate->isToday() && ! empty($validated['preferred_time_slot'])) {
            $slot = $validated['preferred_time_slot'];
            $nowHour = now()->hour;

            if (str_contains($slot, 'Morning') && $nowHour >= 12) {
                throw ValidationException::withMessages([
                    'preferred_time_slot' => 'The Morning time slot has already passed for today. Please select an Afternoon slot or a future date.',
                ]);
            }

            if (str_contains($slot, 'Afternoon (1:00 PM') && $nowHour >= 16) {
                throw ValidationException::withMessages([
                    'preferred_time_slot' => 'The Afternoon time slot has already passed for today. Please select a Late Afternoon slot or a future date.',
                ]);
            }

            if (str_contains($slot, 'Late Afternoon') && $nowHour >= 18) {
                throw ValidationException::withMessages([
                    'preferred_time_slot' => 'Shelter visiting hours have concluded for today. Please select a future date.',
                ]);
            }
        }

        $visit = DB::transaction(function () use ($validated, $request, $maxPerSlot) {
            if (! empty($validated['preferred_time_slot'])) {
                $existingVisitorsCount = (int) ShelterVisit::query()
                    ->where(function ($query) use ($validated) {
                        $query->where(function ($q) use ($validated) {
                            $q->whereNotNull('confirmed_date')
                                ->whereDate('confirmed_date', $validated['preferred_date']);
                        })->orWhere(function ($q) use ($validated) {
                            $q->whereNull('confirmed_date')
                                ->whereDate('preferred_date', $validated['preferred_date']);
                        });
                    })
                    ->where(function ($query) use ($validated) {
                        $query->where(function ($q) use ($validated) {
                            $q->whereNotNull('confirmed_time_slot')
                                ->where('confirmed_time_slot', $validated['preferred_time_slot']);
                        })->orWhere(function ($q) use ($validated) {
                            $q->whereNull('confirmed_time_slot')
                                ->where('preferred_time_slot', $validated['preferred_time_slot']);
                        });
                    })
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->lockForUpdate()
                    ->sum('number_of_visitors');

                if ($existingVisitorsCount + (int) $validated['number_of_visitors'] > $maxPerSlot) {
                    throw ValidationException::withMessages([
                        'preferred_time_slot' => "The selected date and time slot has reached maximum visitor capacity ({$maxPerSlot} visitors limit). Please select another time slot or date.",
                    ]);
                }
            }

            $userId = $request->user()?->id;
            if (! $userId) {
                $existingUser = User::whereRaw('LOWER(email) = ?', [strtolower($validated['email'])])->first();
                $userId = $existingUser?->id;
            }

            return ShelterVisit::create([
                ...$validated,
                'user_id' => $userId,
                'status' => 'pending',
            ]);
        });

        $ref = 'VIS-'.str_pad((string) $visit->id, 5, '0', STR_PAD_LEFT);

        EReceiptDispatcher::sendToUserAndEmail(
            $visit->user ?? $request->user(),
            $visit->email,
            SubmissionEReceiptNotification::forShelterVisit($visit)
        );

        AuditLog::log('shelter_visit_request', "Shelter visit requested by {$visit->full_name} for {$visit->preferred_date->format('Y-m-d')}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Your shelter visit request has been submitted (Ref: {$ref})! ISF will contact you to coordinate and confirm your schedule.",
        ]);

        if (! $request->user() && $visit->email) {
            return redirect()->route('track', ['reference' => $ref, 'email' => $visit->email]);
        }

        if ($request->user() && ! $request->user()->isAdmin() && ! $request->user()->isSuperAdmin()) {
            return redirect()->route('account.user.shelter-visits');
        }

        return back();
    }
}
