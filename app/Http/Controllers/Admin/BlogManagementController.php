<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\BlogPostReaction;
use App\Notifications\UserStoryApprovedNotification;
use App\Notifications\UserStoryRejectedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BlogManagementController extends Controller
{
    /**
     * Display the Admin Blog & Articles management table.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $category = trim((string) $request->query('category', ''));
        $status = trim((string) $request->query('status', ''));

        $query = BlogPost::query()
            ->with(['author:id,name,role', 'shelterAnimal:id,name,type,breed,photo_url', 'reviewer:id,name'])
            ->withCount('reactions');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('summary', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($category !== '' && $category !== 'all') {
            $query->where('category', $category);
        }

        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        $posts = $query->latest('created_at')->paginate(15)->withQueryString();

        $metrics = [
            'total_posts' => BlogPost::count(),
            'published_posts' => BlogPost::where('status', BlogPost::STATUS_PUBLISHED)->count(),
            'pending_posts' => BlogPost::where('status', BlogPost::STATUS_PENDING)->count(),
            'draft_posts' => BlogPost::where('status', BlogPost::STATUS_DRAFT)->count(),
            'rejected_posts' => BlogPost::where('status', BlogPost::STATUS_REJECTED)->count(),
            'total_views' => (int) BlogPost::sum('views_count'),
            'total_reactions' => BlogPostReaction::count(),
            'total_shares' => (int) BlogPost::sum('shares_count'),
            'rescue_stories_count' => BlogPost::where('category', 'rescue_story')->count(),
            'awareness_campaigns_count' => BlogPost::whereIn('category', ['advocacy_campaign', 'community_awareness'])->count(),
        ];

        return Inertia::render('admin/blog-management', [
            'posts' => $posts,
            'metrics' => $metrics,
            'categories' => BlogPost::CATEGORIES,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Store a newly created blog post.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', Rule::in(array_keys(BlogPost::CATEGORIES))],
            'summary' => ['nullable', 'string', 'max:1000'],
            'content' => ['required', 'string'],
            'featured_image' => ['nullable'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'reading_time_minutes' => ['nullable', 'integer', 'min:1', 'max:60'],
            'status' => ['required', 'string', Rule::in(array_keys(BlogPost::STATUSES))],
            'is_featured' => ['boolean'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'shelter_animal_id' => ['nullable', 'integer', 'exists:shelter_animals,id'],
        ]);

        $featuredImageUrl = null;
        if ($request->hasFile('featured_image')) {
            $request->validate(['featured_image' => ['file', 'image', 'max:8192']]);
            $path = $request->file('featured_image')->store('blog', 'public');
            $featuredImageUrl = Storage::url($path);
        } elseif (is_string($request->input('featured_image')) && trim($request->input('featured_image')) !== '') {
            $featuredImageUrl = trim($request->input('featured_image'));
        }

        $baseSlug = Str::slug($validated['title']);
        $slug = $baseSlug;
        $counter = 1;
        while (BlogPost::where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        $wordCount = str_word_count(strip_tags($validated['content']));
        $readingTime = $validated['reading_time_minutes'] ?? (int) max(1, ceil($wordCount / 200));

        BlogPost::create([
            'author_id' => $request->user()->id,
            'title' => $validated['title'],
            'slug' => $slug,
            'category' => $validated['category'],
            'summary' => $validated['summary'] ?? null,
            'content' => $validated['content'],
            'featured_image' => $featuredImageUrl,
            'tags' => $validated['tags'] ?? [],
            'reading_time_minutes' => $readingTime,
            'status' => $validated['status'],
            'is_featured' => $validated['is_featured'] ?? false,
            'rating' => $validated['rating'] ?? null,
            'shelter_animal_id' => $validated['shelter_animal_id'] ?? null,
            'published_at' => $validated['status'] === 'published' ? now() : null,
        ]);

        return back()->with('success', 'Article created successfully!');
    }

    /**
     * Update an existing blog post.
     */
    public function update(Request $request, BlogPost $post): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', Rule::in(array_keys(BlogPost::CATEGORIES))],
            'summary' => ['nullable', 'string', 'max:1000'],
            'content' => ['required', 'string'],
            'featured_image' => ['nullable'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'reading_time_minutes' => ['nullable', 'integer', 'min:1', 'max:60'],
            'status' => ['required', 'string', Rule::in(array_keys(BlogPost::STATUSES))],
            'is_featured' => ['boolean'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'shelter_animal_id' => ['nullable', 'integer', 'exists:shelter_animals,id'],
        ]);

        $featuredImageUrl = $post->featured_image;
        if ($request->hasFile('featured_image')) {
            $request->validate(['featured_image' => ['file', 'image', 'max:8192']]);
            $path = $request->file('featured_image')->store('blog', 'public');
            $featuredImageUrl = Storage::url($path);
        } elseif ($request->has('featured_image')) {
            $inputImage = $request->input('featured_image');
            $featuredImageUrl = is_string($inputImage) && trim($inputImage) !== '' ? trim($inputImage) : null;
        }

        $wordCount = str_word_count(strip_tags($validated['content']));
        $readingTime = $validated['reading_time_minutes'] ?? (int) max(1, ceil($wordCount / 200));

        $publishedAt = $post->published_at;
        if ($validated['status'] === 'published' && ! $publishedAt) {
            $publishedAt = now();
        }

        $post->update([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'summary' => $validated['summary'] ?? null,
            'content' => $validated['content'],
            'featured_image' => $featuredImageUrl,
            'tags' => $validated['tags'] ?? [],
            'reading_time_minutes' => $readingTime,
            'status' => $validated['status'],
            'is_featured' => $validated['is_featured'] ?? false,
            'rating' => $validated['rating'] ?? $post->rating,
            'shelter_animal_id' => $request->has('shelter_animal_id') ? ($validated['shelter_animal_id'] ?? null) : $post->shelter_animal_id,
            'published_at' => $publishedAt,
        ]);

        return back()->with('success', 'Article updated successfully!');
    }

    /**
     * Approve a pending blog article or adoption story.
     */
    public function approve(Request $request, BlogPost $post): RedirectResponse
    {
        $publishedAt = $post->published_at ?? now();

        $post->update([
            'status' => BlogPost::STATUS_PUBLISHED,
            'published_at' => $publishedAt,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'rejection_reason' => null,
        ]);

        if ($post->author) {
            try {
                $post->author->notify(new UserStoryApprovedNotification($post));
            } catch (\Throwable $e) {
                // Ignore notification failure
            }
        }

        return back()->with('success', 'Article / story approved and published successfully!');
    }

    /**
     * Reject a submitted blog article or adoption story with optional feedback.
     */
    public function reject(Request $request, BlogPost $post): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $post->update([
            'status' => BlogPost::STATUS_REJECTED,
            'rejection_reason' => $validated['rejection_reason'] ?? 'Content does not meet publishing guidelines.',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        if ($post->author) {
            try {
                $post->author->notify(new UserStoryRejectedNotification($post));
            } catch (\Throwable $e) {
                // Ignore notification failure
            }
        }

        return back()->with('success', 'Story has been rejected and author notified.');
    }

    /**
     * Delete an existing blog post.
     */
    public function destroy(BlogPost $post): RedirectResponse
    {
        $post->delete();

        return back()->with('success', 'Article deleted successfully!');
    }

    /**
     * Toggle the publication status of a blog post.
     */
    public function toggleStatus(BlogPost $post): RedirectResponse
    {
        $nextStatus = $post->status === 'published' ? 'draft' : 'published';
        $publishedAt = $post->published_at;

        if ($nextStatus === 'published' && ! $publishedAt) {
            $publishedAt = now();
        }

        $post->update([
            'status' => $nextStatus,
            'published_at' => $publishedAt,
        ]);

        return back()->with('success', 'Article status updated to '.$nextStatus);
    }
}
