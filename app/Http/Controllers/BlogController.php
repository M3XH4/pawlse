<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\BlogPostReaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    /**
     * Display the public Blog / News and Articles feed.
     */
    public function index(Request $request): Response
    {
        $selectedCategory = $request->query('category', 'all');
        $search = trim((string) $request->query('search', ''));
        $tag = trim((string) $request->query('tag', ''));

        $query = BlogPost::query()
            ->with(['author:id,name,role'])
            ->published();

        if ($selectedCategory && $selectedCategory !== 'all') {
            $query->where('category', $selectedCategory);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('summary', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($tag !== '') {
            $query->whereJsonContains('tags', $tag);
        }

        $posts = $query->latest('published_at')->paginate(12)->withQueryString();

        // Calculate category counts
        $categoryCounts = [];
        foreach (array_keys(BlogPost::CATEGORIES) as $catKey) {
            $categoryCounts[$catKey] = BlogPost::published()->where('category', $catKey)->count();
        }
        $categoryCounts['all'] = BlogPost::published()->count();

        // Featured awareness / campaign post
        $featuredPost = BlogPost::query()
            ->with(['author:id,name,role'])
            ->published()
            ->featured()
            ->latest('published_at')
            ->first();

        if (! $featuredPost && $posts->count() > 0) {
            $featuredPost = $posts->first();
        }

        // Recent awareness campaigns for sidebar / banner
        $recentCampaigns = BlogPost::query()
            ->published()
            ->whereIn('category', ['advocacy_campaign', 'community_awareness'])
            ->latest('published_at')
            ->take(3)
            ->get();

        // Map reaction counts and current user's reaction for each post
        $userId = $request->user()?->id;
        $sessionId = $request->session()->getId();

        $posts->getCollection()->transform(function (BlogPost $post) use ($userId, $sessionId) {
            $post->reaction_summary = $post->reaction_counts;

            $userReactions = BlogPostReaction::query()
                ->where('blog_post_id', $post->id)
                ->when($userId, fn ($q) => $q->where('user_id', $userId), fn ($q) => $q->where('session_id', $sessionId))
                ->pluck('reaction_type')
                ->toArray();

            $post->user_reactions = $userReactions;

            return $post;
        });

        if ($featuredPost) {
            $featuredPost->reaction_summary = $featuredPost->reaction_counts;
            $featuredPost->user_reactions = BlogPostReaction::query()
                ->where('blog_post_id', $featuredPost->id)
                ->when($userId, fn ($q) => $q->where('user_id', $userId), fn ($q) => $q->where('session_id', $sessionId))
                ->pluck('reaction_type')
                ->toArray();
        }

        return Inertia::render('blog/index', [
            'posts' => $posts,
            'featuredPost' => $featuredPost,
            'categories' => BlogPost::CATEGORIES,
            'categoryCounts' => $categoryCounts,
            'recentCampaigns' => $recentCampaigns,
            'filters' => [
                'category' => $selectedCategory,
                'search' => $search,
                'tag' => $tag,
            ],
        ]);
    }

    /**
     * Display a specific blog article.
     */
    public function show(Request $request, string $slug): Response
    {
        $post = BlogPost::query()
            ->with(['author:id,name,role'])
            ->where('slug', $slug)
            ->firstOrFail();

        // If post is not published, only admins can view
        $user = $request->user();
        $isAdmin = $user && in_array($user->role, ['admin', 'super-admin'], true);

        if ($post->status !== 'published' && ! $isAdmin) {
            abort(404);
        }

        // Increment view count if not viewed in this session
        $viewKey = 'viewed_blog_post_'.$post->id;
        if (! $request->session()->has($viewKey)) {
            $post->increment('views_count');
            $request->session()->put($viewKey, true);
        }

        $userId = $user?->id;
        $sessionId = $request->session()->getId();

        $userReactions = BlogPostReaction::query()
            ->where('blog_post_id', $post->id)
            ->when($userId, fn ($q) => $q->where('user_id', $userId), fn ($q) => $q->where('session_id', $sessionId))
            ->pluck('reaction_type')
            ->toArray();

        $post->reaction_summary = $post->reaction_counts;
        $post->user_reactions = $userReactions;

        // Related articles
        $relatedPosts = BlogPost::query()
            ->published()
            ->where('id', '!=', $post->id)
            ->where(function ($q) use ($post) {
                $q->where('category', $post->category)
                    ->orWhere('is_featured', true);
            })
            ->latest('published_at')
            ->take(3)
            ->get();

        return Inertia::render('blog/show', [
            'post' => $post,
            'relatedPosts' => $relatedPosts,
            'categories' => BlogPost::CATEGORIES,
        ]);
    }

    /**
     * Toggle reaction on a blog post.
     */
    public function react(Request $request, BlogPost $post): RedirectResponse
    {
        $validated = $request->validate([
            'reaction_type' => ['required', 'string', 'in:'.implode(',', BlogPostReaction::REACTION_TYPES)],
        ]);

        $reactionType = $validated['reaction_type'];
        $userId = $request->user()?->id;
        $sessionId = $request->session()->getId();

        $query = BlogPostReaction::query()
            ->where('blog_post_id', $post->id)
            ->where('reaction_type', $reactionType);

        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        $existing = $query->first();

        if ($existing) {
            $existing->delete();
        } else {
            BlogPostReaction::create([
                'blog_post_id' => $post->id,
                'user_id' => $userId,
                'session_id' => $sessionId,
                'reaction_type' => $reactionType,
            ]);
        }

        return back();
    }

    /**
     * Track a share action on a blog post.
     */
    public function share(Request $request, BlogPost $post): RedirectResponse
    {
        $post->increment('shares_count');

        return back();
    }
}
