<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\AdoptionApplication;
use App\Models\BlogPost;
use App\Models\BlogPostReaction;
use App\Models\ShelterAnimal;
use App\Models\User;
use App\Notifications\UserStorySubmittedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserStoryController extends Controller
{
    /**
     * Display the user's stories and testimonials management page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $statusFilter = trim((string) $request->query('status', 'all'));
        $categoryFilter = trim((string) $request->query('category', 'all'));
        $search = trim((string) $request->query('search', ''));

        $query = BlogPost::query()
            ->where('author_id', $user->id)
            ->with(['shelterAnimal:id,name,type,breed,photo_url', 'reviewer:id,name'])
            ->withCount('reactions');

        if ($statusFilter !== '' && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        if ($categoryFilter !== '' && $categoryFilter !== 'all') {
            $query->where('category', $categoryFilter);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('summary', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $stories = $query->latest('created_at')->paginate(10)->withQueryString();

        // Get user's approved adopted animals for easy selection
        $adoptedAnimalIds = AdoptionApplication::query()
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->pluck('shelter_animal_id')
            ->filter()
            ->unique();

        $adoptedPets = ShelterAnimal::query()
            ->whereIn('id', $adoptedAnimalIds)
            ->select(['id', 'name', 'type', 'breed', 'photo_url'])
            ->get();

        // If user has no formal application but wants to link any adopted shelter animal,
        // also provide adopted shelter animals as options
        $allAdoptedAnimals = ShelterAnimal::query()
            ->where('status', 'adopted')
            ->select(['id', 'name', 'type', 'breed', 'photo_url'])
            ->limit(20)
            ->get();

        // Story counts & metrics for the user
        $authorPosts = BlogPost::where('author_id', $user->id);
        $metrics = [
            'total' => (clone $authorPosts)->count(),
            'published' => (clone $authorPosts)->where('status', BlogPost::STATUS_PUBLISHED)->count(),
            'pending' => (clone $authorPosts)->where('status', BlogPost::STATUS_PENDING)->count(),
            'rejected' => (clone $authorPosts)->where('status', BlogPost::STATUS_REJECTED)->count(),
            'total_views' => (int) (clone $authorPosts)->sum('views_count'),
            'total_reactions' => (int) BlogPostReaction::whereIn('blog_post_id', (clone $authorPosts)->pluck('id'))->count(),
        ];

        return Inertia::render('user/stories', [
            'stories' => $stories,
            'adoptedPets' => $adoptedPets,
            'allAdoptedAnimals' => $allAdoptedAnimals,
            'metrics' => $metrics,
            'categories' => BlogPost::CATEGORIES,
            'filters' => [
                'status' => $statusFilter,
                'category' => $categoryFilter,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a user-submitted adoption story or testimonial for admin review.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', Rule::in(array_keys(BlogPost::CATEGORIES))],
            'summary' => ['nullable', 'string', 'max:1000'],
            'content' => ['required', 'string', 'min:20'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'shelter_animal_id' => ['nullable', 'integer', 'exists:shelter_animals,id'],
            'featured_image' => ['nullable'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ]);

        $featuredImageUrl = null;
        if ($request->hasFile('featured_image')) {
            $request->validate(['featured_image' => ['file', 'image', 'max:8192']]);
            $path = $request->file('featured_image')->store('blog', 'public');
            $featuredImageUrl = Storage::url($path);
        } elseif (is_string($request->input('featured_image')) && trim($request->input('featured_image')) !== '') {
            $featuredImageUrl = trim($request->input('featured_image'));
        } elseif (! empty($validated['shelter_animal_id'])) {
            $animal = ShelterAnimal::find($validated['shelter_animal_id']);
            $featuredImageUrl = $animal?->photo_url;
        }

        $baseSlug = Str::slug($validated['title']);
        $slug = $baseSlug;
        $counter = 1;
        while (BlogPost::where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        $wordCount = str_word_count(strip_tags($validated['content']));
        $readingTime = (int) max(1, ceil($wordCount / 200));

        // Find associated adoption application if exists
        $adoptionApplicationId = null;
        if (! empty($validated['shelter_animal_id'])) {
            $adoptionApp = AdoptionApplication::where('user_id', $request->user()->id)
                ->where('shelter_animal_id', $validated['shelter_animal_id'])
                ->first();
            $adoptionApplicationId = $adoptionApp?->id;
        }

        $post = BlogPost::create([
            'author_id' => $request->user()->id,
            'title' => $validated['title'],
            'slug' => $slug,
            'category' => $validated['category'],
            'summary' => $validated['summary'] ?? null,
            'content' => $validated['content'],
            'featured_image' => $featuredImageUrl,
            'tags' => ! empty($validated['tags']) ? $validated['tags'] : ['Adoption Story', 'Testimonial'],
            'reading_time_minutes' => $readingTime,
            'status' => BlogPost::STATUS_PENDING,
            'rating' => $validated['rating'] ?? 5,
            'shelter_animal_id' => $validated['shelter_animal_id'] ?? null,
            'adoption_application_id' => $adoptionApplicationId,
            'published_at' => null,
            'is_featured' => false,
        ]);

        // Notify admins and super-admins about the new pending story
        try {
            $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
            foreach ($admins as $admin) {
                $admin->notify(new UserStorySubmittedNotification($post));
            }
        } catch (\Throwable $e) {
            // Notification dispatch error shouldn't halt story submission
        }

        return redirect()->route('account.user.stories.index')
            ->with('success', 'Your story & testimonial was submitted! It is now pending approval from our shelter administrators.');
    }

    /**
     * Update a user's story and reset to pending approval.
     */
    public function update(Request $request, BlogPost $post): RedirectResponse
    {
        if ($post->author_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to this story.');
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', Rule::in(array_keys(BlogPost::CATEGORIES))],
            'summary' => ['nullable', 'string', 'max:1000'],
            'content' => ['required', 'string', 'min:20'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'shelter_animal_id' => ['nullable', 'integer', 'exists:shelter_animals,id'],
            'featured_image' => ['nullable'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ]);

        $featuredImageUrl = $post->featured_image;
        if ($request->hasFile('featured_image')) {
            $request->validate(['featured_image' => ['file', 'image', 'max:8192']]);
            $path = $request->file('featured_image')->store('blog', 'public');
            $featuredImageUrl = Storage::url($path);
        } elseif ($request->has('featured_image')) {
            $inputImage = $request->input('featured_image');
            $featuredImageUrl = is_string($inputImage) && trim($inputImage) !== '' ? trim($inputImage) : $post->featured_image;
        }

        $wordCount = str_word_count(strip_tags($validated['content']));
        $readingTime = (int) max(1, ceil($wordCount / 200));

        $shelterAnimalId = $request->has('shelter_animal_id') ? ($validated['shelter_animal_id'] ?? null) : $post->shelter_animal_id;
        $adoptionApplicationId = null;
        if (! empty($shelterAnimalId)) {
            $adoptionApp = AdoptionApplication::where('user_id', $request->user()->id)
                ->where('shelter_animal_id', $shelterAnimalId)
                ->first();
            $adoptionApplicationId = $adoptionApp?->id;
        }

        // When updated, reset status to pending so admin reviews updated contents
        $post->update([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'summary' => $validated['summary'] ?? null,
            'content' => $validated['content'],
            'featured_image' => $featuredImageUrl,
            'tags' => ! empty($validated['tags']) ? $validated['tags'] : $post->tags,
            'reading_time_minutes' => $readingTime,
            'status' => BlogPost::STATUS_PENDING,
            'rating' => $validated['rating'] ?? $post->rating ?? 5,
            'shelter_animal_id' => $shelterAnimalId,
            'adoption_application_id' => $adoptionApplicationId,
            'rejection_reason' => null,
            'published_at' => null,
        ]);

        // Notify admins about the re-submission
        try {
            $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
            foreach ($admins as $admin) {
                $admin->notify(new UserStorySubmittedNotification($post));
            }
        } catch (\Throwable $e) {
            // Ignore notification failure
        }

        return redirect()->route('account.user.stories.index')
            ->with('success', 'Your story has been updated and resubmitted for admin review.');
    }

    /**
     * Delete a story authored by the user.
     */
    public function destroy(Request $request, BlogPost $post): RedirectResponse
    {
        if ($post->author_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to this story.');
        }

        $post->delete();

        return redirect()->route('account.user.stories.index')
            ->with('success', 'Your story has been deleted successfully.');
    }
}
