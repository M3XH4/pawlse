<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AdoptionApplication;
use App\Models\AuditLog;
use App\Models\Event;
use App\Models\PetReport;
use App\Models\ShelterAnimal;
use App\Models\User;
use App\Models\VolunteerApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ArchiveController extends Controller
{
    /**
     * Display list of archived (soft-deleted) items.
     */
    public function index(Request $request): Response
    {
        $type = $request->input('type', 'all');
        $search = $request->input('search');

        // Stats
        $stats = [
            'total' => $this->getTrashedCount('all'),
            'users' => $this->getTrashedCount('user'),
            'pets' => $this->getTrashedCount('pet'),
            'events' => $this->getTrashedCount('event'),
            'rescues' => $this->getTrashedCount('rescue'),
            'adoptions' => $this->getTrashedCount('adoption'),
            'volunteers' => $this->getTrashedCount('volunteer'),
        ];

        // Fetch paginated results based on type
        $items = $this->queryArchivedItems($type, $search);

        return Inertia::render('super-admin/archives', [
            'items' => $items,
            'filters' => $request->only(['type', 'search']),
            'stats' => $stats,
        ]);
    }

    /**
     * Restore a soft-deleted item.
     */
    public function restore(Request $request, string $type, int $id): RedirectResponse
    {
        $model = $this->getModelInstance($type, $id, true);

        if (! $model) {
            return redirect()->back()->with('error', 'Item not found.');
        }

        $model->restore();

        // Specific logging description
        $name = $this->getItemName($model, $type);
        AuditLog::log('archive_restore', "Restored archived {$type} record: {$name}");

        return redirect()->back()->with('success', ucfirst($type).' restored successfully.');
    }

    /**
     * Permanently delete a soft-deleted item.
     */
    public function forceDelete(Request $request, string $type, int $id): RedirectResponse
    {
        $model = $this->getModelInstance($type, $id, true);

        if (! $model) {
            return redirect()->back()->with('error', 'Item not found.');
        }

        $name = $this->getItemName($model, $type);
        $model->forceDelete();

        AuditLog::log('archive_force_delete', "Permanently deleted {$type} record: {$name}");

        return redirect()->back()->with('success', ucfirst($type).' permanently deleted.');
    }

    private function getTrashedCount(string $type): int
    {
        return match ($type) {
            'user' => User::onlyTrashed()->count(),
            'pet' => ShelterAnimal::onlyTrashed()->count(),
            'event' => Event::onlyTrashed()->count(),
            'rescue' => PetReport::onlyTrashed()->count(),
            'adoption' => AdoptionApplication::onlyTrashed()->count(),
            'volunteer' => VolunteerApplication::onlyTrashed()->count(),
            'all' => User::onlyTrashed()->count() +
                     ShelterAnimal::onlyTrashed()->count() +
                     Event::onlyTrashed()->count() +
                     PetReport::onlyTrashed()->count() +
                     AdoptionApplication::onlyTrashed()->count() +
                     VolunteerApplication::onlyTrashed()->count(),
        };
    }

    private function queryArchivedItems(string $type, ?string $search)
    {
        // Define individual queries
        $queries = [];

        if ($type === 'all' || $type === 'user') {
            $q = DB::table('users')->whereNotNull('deleted_at')
                ->select('id', DB::raw("'user' as type"), 'name as title', 'email as subtitle', 'deleted_at');
            if ($search) {
                $q->where(fn ($sub) => $sub->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            }
            $queries[] = $q;
        }

        if ($type === 'all' || $type === 'pet') {
            $q = DB::table('shelter_animals')->whereNotNull('deleted_at')
                ->select('id', DB::raw("'pet' as type"), 'name as title', 'breed as subtitle', 'deleted_at');
            if ($search) {
                $q->where(fn ($sub) => $sub->where('name', 'like', "%{$search}%")->orWhere('breed', 'like', "%{$search}%"));
            }
            $queries[] = $q;
        }

        if ($type === 'all' || $type === 'event') {
            $q = DB::table('events')->whereNotNull('deleted_at')
                ->select('id', DB::raw("'event' as type"), 'title as title', 'location as subtitle', 'deleted_at');
            if ($search) {
                $q->where(fn ($sub) => $sub->where('title', 'like', "%{$search}%")->orWhere('location', 'like', "%{$search}%"));
            }
            $queries[] = $q;
        }

        if ($type === 'all' || $type === 'rescue') {
            $q = DB::table('pet_reports')->whereNotNull('deleted_at')
                ->select('id', DB::raw("'rescue' as type"), 'location as title', 'contact_name as subtitle', 'deleted_at');
            if ($search) {
                $q->where(fn ($sub) => $sub->where('location', 'like', "%{$search}%")->orWhere('contact_name', 'like', "%{$search}%"));
            }
            $queries[] = $q;
        }

        if ($type === 'all' || $type === 'adoption') {
            $q = DB::table('adoption_applications')->whereNotNull('deleted_at')
                ->select('id', DB::raw("'adoption' as type"), 'full_name as title', 'email as subtitle', 'deleted_at');
            if ($search) {
                $q->where(fn ($sub) => $sub->where('full_name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            }
            $queries[] = $q;
        }

        if ($type === 'all' || $type === 'volunteer') {
            $q = DB::table('volunteer_applications')->whereNotNull('deleted_at')
                ->select('id', DB::raw("'volunteer' as type"), 'full_name as title', 'email as subtitle', 'deleted_at');
            if ($search) {
                $q->where(fn ($sub) => $sub->where('full_name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            }
            $queries[] = $q;
        }

        // Union query assembly
        if (empty($queries)) {
            return collect();
        }

        $unionQuery = array_shift($queries);
        foreach ($queries as $q) {
            $unionQuery->union($q);
        }

        return DB::table(DB::raw("({$unionQuery->toSql()}) as archives"))
            ->mergeBindings($unionQuery)
            ->orderBy('deleted_at', 'desc')
            ->paginate(10)
            ->withQueryString();
    }

    private function getModelInstance(string $type, int $id, bool $onlyTrashed = true)
    {
        $class = match ($type) {
            'user' => User::class,
            'pet' => ShelterAnimal::class,
            'event' => Event::class,
            'rescue' => PetReport::class,
            'adoption' => AdoptionApplication::class,
            'volunteer' => VolunteerApplication::class,
            default => null,
        };

        if (! $class) {
            return null;
        }

        return $onlyTrashed ? $class::onlyTrashed()->find($id) : $class::find($id);
    }

    private function getItemName($model, string $type): string
    {
        return match ($type) {
            'user', 'pet' => $model->name,
            'event' => $model->title,
            'rescue' => 'Rescue at '.$model->location,
            'adoption', 'volunteer' => $model->full_name,
            default => "ID {$model->id}",
        };
    }
}
