<?php

namespace App\Http\Controllers;

use App\Enums\ShelterAnimalStatus;
use App\Models\AdoptionApplication;
use App\Models\AssignedTask;
use App\Models\CareSustainability;
use App\Models\Donation;
use App\Models\Event;
use App\Models\FeedingSchedule;
use App\Models\PetReport;
use App\Models\ShelterAnimal;
use App\Models\SystemSetting;
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
                $defaultImg = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800';
                $allPhotos = $pet->all_photos;
                $primaryImg = $pet->photo_url ?: ($allPhotos[0] ?? $defaultImg);
                $photosList = ! empty($allPhotos) ? $allPhotos : [$primaryImg];

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
                    'rescueStory' => $pet->rescue_story ?: ($pet->story ?: 'Rescued and waiting for a loving home.'),
                    'rescueLocation' => $pet->rescue_location ?: 'Iligan City Shelter',
                    'rescueDate' => $pet->rescue_date?->format('M d, Y'),
                    'intake_type' => $pet->intake_type ?? 'rescue',
                    'is_rescued' => $pet->is_rescued,
                    'rescued_tag' => $pet->rescued_tag,
                    'img' => $primaryImg,
                    'mainImg' => $primaryImg,
                    'photos' => $photosList,
                    'gallery_photos' => $pet->gallery_photos ?? [],
                    'beforeImg' => $pet->before_photo_url,
                    'afterImg' => $pet->after_photo_url,
                    'before_photo_url' => $pet->before_photo_url,
                    'after_photo_url' => $pet->after_photo_url,
                    'vaccinated' => (bool) $pet->vaccinated,
                    'shelterDays' => $pet->admitted_at ? (int) abs($pet->admitted_at->diffInDays(now())) : 14,
                ];
            });

        // 2. Missing Pets Reports
        $missingPets = PetReport::query()
            ->with('photos')
            ->where('type', 'missing')
            ->whereNotIn('status', ['duplicate', 'cancelled'])
            ->latest('id')
            ->take(8)
            ->get()
            ->map(function (PetReport $report) use ($getString) {
                $photoPath = $report->photos->first()?->path;

                return [
                    'id' => $report->id,
                    'pet_name' => $report->name ?? 'Missing Pet',
                    'species' => $getString($report->animal_type ?? $report->species, 'Dog'),
                    'breed' => $report->breed ?? 'Mixed Breed',
                    'age' => $report->age_category ? ucfirst((string) $report->age_category) : 'Young Adult',
                    'gender' => $report->gender ? ucfirst((string) $report->gender) : 'Unknown',
                    'color' => $report->color ?? 'Mixed',
                    'size' => $report->size ? ucfirst((string) $report->size) : 'Medium',
                    'reward' => $report->reward,
                    'medical_conditions' => $report->medical_conditions ?? 'None',
                    'last_seen_location' => $report->location ?? 'Iligan City',
                    'last_seen_date' => $report->last_seen_date ? $report->last_seen_date->diffForHumans() : ($report->created_at ? $report->created_at->diffForHumans() : 'Recently'),
                    'exact_date' => $report->last_seen_date ? $report->last_seen_date->format('M d, Y') : ($report->created_at ? $report->created_at->format('M d, Y') : 'Recently'),
                    'description' => $report->description ?? 'No details provided.',
                    'contact_name' => $report->contact_name ?? 'Pet Owner',
                    'contact_number' => $report->contact_phone ?? '0912 345 6789',
                    'contact_email' => $report->contact_email ?? 'help@iliganstrayfeeders.org',
                    'photo_url' => $photoPath ?: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=800',
                    'status' => $report->status === 'resolved' ? 'resolved' : 'active',
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
                    'spots' => $event->spots ?? 20,
                    'desc' => $event->desc ?? $event->description ?? '',
                ];
            });

        // Joined events status for logged in user
        $user = $request->user();
        $joinedEventIds = [];
        $joinedEventRoles = [];

        if ($user !== null) {
            $userTasks = AssignedTask::query()
                ->where('user_id', $user->id)
                ->whereIn('status', ['pending', 'completed'])
                ->get();

            $joinedEventIds = $userTasks->whereNotNull('event_id')->pluck('event_id')->values()->toArray();

            foreach ($userTasks->whereNotNull('event_id') as $task) {
                $joinedEventRoles[$task->event_id] = $task->role;
            }
        }

        // 4. Donation Metrics
        $totalCashRaised = (float) Donation::query()
            ->whereIn('status', ['completed', 'verified', 'pending_verification'])
            ->sum('amount');
        if ($totalCashRaised <= 0) {
            $totalCashRaised = (float) Donation::query()->sum('amount');
        }
        $cashGoal = (int) SystemSetting::getValue('monthly_donation_goal', 100000);
        $budgetNeeds = SystemSetting::getValue('shelter_budget_needs', [
            ['label' => 'Animal Food & Supplements', 'cost' => '₱45,000', 'progress' => 65, 'category' => 'Food & Nutrition'],
            ['label' => 'Veterinary Bills & Medicine', 'cost' => '₱35,000', 'progress' => 40, 'category' => 'Medical Care'],
            ['label' => 'Shelter Rent & Utilities', 'cost' => '₱12,000', 'progress' => 90, 'category' => 'Infrastructure'],
            ['label' => 'Rescue Ops & Gas', 'cost' => '₱8,000', 'progress' => 30, 'category' => 'Operations'],
        ]);
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

        // 6. Rescue Stories from Animal Master Records
        $stories = ShelterAnimal::query()
            ->whereNotNull('story')
            ->where(function ($q) {
                $q->whereIn('status', [ShelterAnimalStatus::Adopted, ShelterAnimalStatus::Available, ShelterAnimalStatus::Foster]);
            })
            ->latest('id')
            ->take(12)
            ->get()
            ->map(function (ShelterAnimal $animal) use ($getString) {
                $statusStr = $getString($animal->status, 'Available');
                $displayStatus = match (strtolower($statusStr)) {
                    'adopted' => 'ADOPTED',
                    default => 'RESCUED',
                };

                return [
                    'id' => $animal->id,
                    'name' => $animal->name,
                    'type' => $getString($animal->type, 'Dog'),
                    'story' => $animal->rescue_story ?: $animal->story,
                    'location' => $animal->rescue_location ?: 'Iligan City, 2024',
                    'status' => $displayStatus,
                    'image' => $animal->photo_url ?: ($getString($animal->type, 'Dog') === 'Cat'
                        ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80'
                        : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800'),
                    'before_image' => $animal->before_photo_url,
                    'after_image' => $animal->after_photo_url,
                ];
            });

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'pets' => $pets,
            'stories' => $stories,
            'missingPets' => $missingPets,
            'events' => $events,
            'joinedEventIds' => $joinedEventIds,
            'joinedEventRoles' => $joinedEventRoles,
            'donationStats' => [
                'totalRaised' => $totalCashRaised > 0 ? (int) $totalCashRaised : 10000,
                'goal' => $cashGoal,
                'donorCount' => $recentDonorsCount,
                'monthName' => now()->format('F'),
                'daysRemaining' => max(1, now()->daysInMonth - now()->day),
                'chartData' => $chartData,
                'recentDonations' => $recentDonations,
                'wishlist' => $wishlist,
                'budgetNeeds' => $budgetNeeds,
            ],
            'impactStats' => [
                'rescued' => max($rescuesCount, 150),
                'adopted' => max($adoptionsCount, 85),
                'volunteers' => max($volunteersCount, 42),
                'feedings' => max($feedingCount, 320),
            ],
            'careSustainability' => CareSustainability::current()->toPublicArray(),
        ]);
    }
}
