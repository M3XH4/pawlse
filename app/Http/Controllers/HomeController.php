<?php

namespace App\Http\Controllers;

use App\Enums\ShelterAnimalStatus;
use App\Models\AdoptionApplication;
use App\Models\Donation;
use App\Models\Event;
use App\Models\FeedingSchedule;
use App\Models\PetReport;
use App\Models\ShelterAnimal;
use App\Models\VolunteerApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $getString = function ($val, string $default = ''): string {
            if ($val === null) {
                return $default;
            }
            if ($val instanceof \BackedEnum) {
                return (string) $val->value;
            }
            if (is_object($val) && property_exists($val, 'value')) {
                return (string) $val->value;
            }

            return (string) $val;
        };

        // 1. Available Pets for Adoption
        $pets = ShelterAnimal::query()
            ->where('status', ShelterAnimalStatus::Available)
            ->latest()
            ->get()
            ->map(function (ShelterAnimal $pet) use ($getString) {
                return [
                    'id' => $pet->id,
                    'name' => $pet->name,
                    'type' => $getString($pet->type, 'Dog'),
                    'breed' => $pet->breed ?? 'Mixed Breed',
                    'age' => $pet->age ?? '1 year',
                    'ageCategory' => ucfirst($getString($pet->age_category, 'Young')),
                    'gender' => ucfirst($getString($pet->gender, 'Unknown')),
                    'color' => $pet->color ?? 'Mixed',
                    'behavior' => $pet->behavior ?? 'Friendly & Loving',
                    'story' => $pet->story ?? 'Rescued and waiting for a loving home.',
                    'img' => $pet->photo_url ?: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800',
                    'mainImg' => $pet->photo_url ?: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800',
                    'beforeImg' => $pet->photo_url ?: ($getString($pet->type, 'Dog') === 'Cat'
                        ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80'
                        : 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80'),
                    'afterImg' => $pet->photo_url ?: ($getString($pet->type, 'Dog') === 'Cat'
                        ? 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80'
                        : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80'),
                    'vaccinated' => (bool) $pet->vaccinated,
                    'shelterDays' => $pet->admitted_at ? (int) abs($pet->admitted_at->diffInDays(now())) : 14,
                ];
            });

        // 2. Missing Pets Reports
        $missingPets = PetReport::query()
            ->where('type', 'missing')
            ->latest()
            ->take(6)
            ->get()
            ->map(function (PetReport $report) use ($getString) {
                return [
                    'id' => $report->id,
                    'pet_name' => $report->name ?? $report->pet_name ?? 'Missing Pet',
                    'species' => $getString($report->animal_type ?? $report->species, 'Dog'),
                    'breed' => $report->breed ?? 'Unknown',
                    'last_seen_location' => $report->location ?? $report->location_address ?? 'Iligan City',
                    'last_seen_date' => $report->last_seen_date ? $report->last_seen_date->format('M d, Y') : ($report->created_at ? $report->created_at->format('M d, Y') : now()->format('M d, Y')),
                    'description' => $report->description ?? 'No details provided.',
                    'contact_number' => $report->contact_phone ?? $report->contact_number ?? '0912 345 6789',
                    'photo_url' => $report->photo_url ?: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=800',
                    'status' => $getString($report->status, 'active'),
                ];
            });

        // 3. Events
        $events = Event::query()
            ->latest()
            ->take(4)
            ->get()
            ->map(function (Event $event) use ($getString) {
                $eventDate = $event->date ?? $event->event_date ?? null;

                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'category' => $getString($event->category, 'Community'),
                    'time' => $event->time ?? '9:00 AM - 4:00 PM',
                    'img' => $event->img ?: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600',
                    'description' => $event->desc ?? $event->description ?? '',
                    'date' => $eventDate ? (is_string($eventDate) ? $eventDate : $eventDate->format('F d, Y')) : 'Upcoming',
                    'location' => $event->location ?? 'Iligan City Shelter',
                    'status' => $getString($event->status, 'open'),
                    'participants_count' => $event->volunteers_count ?? $event->spots ?? 0,
                ];
            });

        // 4. Donation Metrics
        $totalCashRaised = (float) Donation::query()
            ->whereIn('status', ['completed', 'verified', 'pending_verification'])
            ->sum('amount');
        if ($totalCashRaised <= 0) {
            $totalCashRaised = (float) Donation::query()->sum('amount');
        }
        $cashGoal = 100000;
        $recentDonorsCount = Donation::query()->count();

        // Generate past 7 months chart data dynamically
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthSum = (float) Donation::query()
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('amount');

            $chartData[] = [
                'id' => 'month-'.strtolower($date->format('M')),
                'name' => $date->format('M'),
                'amount' => (int) $monthSum,
            ];
        }

        // Recent donations
        $recentDonations = Donation::query()
            ->latest('id')
            ->take(6)
            ->get()
            ->map(function (Donation $donation) {
                return [
                    'id' => $donation->id,
                    'user' => $donation->anonymous ? 'Anonymous Donor' : ($donation->donor_name ?: 'Kind Supporter'),
                    'amount' => '₱'.number_format($donation->amount ?? 0),
                    'type' => ucfirst(str_replace('_', ' ', $donation->type ?? 'Cash')),
                    'date' => $donation->created_at ? $donation->created_at->diffForHumans() : 'Recently',
                    'msg' => $donation->notes ?: ($donation->purpose ?: 'For the care and rescue of stray animals.'),
                ];
            });

        // Animal Wishlist
        $wishlist = ShelterAnimal::with(['needs' => function ($query) {
            $query->where('status', 'open');
        }])->whereHas('needs', function ($query) {
            $query->where('status', 'open');
        })->get()->map(function ($animal) use ($getString) {
            return [
                'id' => 'animal-'.$animal->id,
                'name' => $animal->name,
                'type' => $animal->breed ? "{$animal->breed} ({$getString($animal->type, 'Pet')})" : $getString($animal->type, 'Pet'),
                'age' => $animal->age ?? '1 year',
                'photo' => $animal->photo_url ?: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=80',
                'needs' => $animal->needs->map(function ($need) {
                    return [
                        'id' => 'need-'.$need->id,
                        'item' => $need->item,
                        'quantity' => $need->quantity,
                        'priority' => ucfirst($need->priority ?? 'Medium'),
                    ];
                }),
            ];
        });

        // 5. Impact Metrics
        $rescuesCount = PetReport::query()->where('type', 'rescue')->count();
        $adoptionsCount = AdoptionApplication::query()->where('status', 'approved')->count();
        $volunteersCount = VolunteerApplication::query()->where('status', 'approved')->count();
        $feedingCount = FeedingSchedule::query()->count();

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'pets' => $pets,
            'missingPets' => $missingPets,
            'events' => $events,
            'donationStats' => [
                'totalRaised' => $totalCashRaised > 0 ? (int) $totalCashRaised : 10000,
                'goal' => $cashGoal,
                'donorCount' => $recentDonorsCount,
                'monthName' => now()->format('F'),
                'daysRemaining' => max(1, now()->daysInMonth - now()->day),
                'chartData' => $chartData,
                'recentDonations' => $recentDonations,
                'wishlist' => $wishlist,
            ],
            'impactStats' => [
                'rescued' => max($rescuesCount, 150),
                'adopted' => max($adoptionsCount, 85),
                'volunteers' => max($volunteersCount, 42),
                'feedings' => max($feedingCount, 320),
            ],
        ]);
    }
}
