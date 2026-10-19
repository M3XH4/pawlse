<?php

use App\Models\BlogPost;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('public guests can view the blog index page with published posts and categories', function () {
    $admin = User::factory()->admin()->create();

    BlogPost::factory()->count(3)->create([
        'author_id' => $admin->id,
        'status' => 'published',
        'published_at' => now()->subDay(),
    ]);

    $response = $this->get(route('blog.index'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('blog/index')
            ->has('posts.data', 3)
            ->has('categories')
            ->has('categoryCounts')
            ->has('filters')
        );
});

test('public guests can filter blog posts by category', function () {
    $admin = User::factory()->admin()->create();

    $rescueStory = BlogPost::factory()->rescueStory()->create([
        'author_id' => $admin->id,
        'title' => 'Rescued Puppy Milo Story',
        'status' => 'published',
        'published_at' => now()->subDay(),
    ]);

    $awarenessPost = BlogPost::factory()->communityAwareness()->create([
        'author_id' => $admin->id,
        'title' => 'Responsible Pet Ownership Guide',
        'status' => 'published',
        'published_at' => now()->subDay(),
    ]);

    $response = $this->get(route('blog.index', ['category' => 'rescue_story']));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('blog/index')
            ->has('posts.data', 1)
            ->where('posts.data.0.title', 'Rescued Puppy Milo Story')
            ->where('filters.category', 'rescue_story')
        );
});

test('public guests can search blog posts by keyword', function () {
    $admin = User::factory()->admin()->create();

    BlogPost::factory()->create([
        'author_id' => $admin->id,
        'title' => 'Animal Welfare Act Republic Act 8485',
        'content' => 'Comprehensive discussion on animal cruelty prevention.',
        'status' => 'published',
        'published_at' => now()->subDay(),
    ]);

    BlogPost::factory()->create([
        'author_id' => $admin->id,
        'title' => 'Kapon Outreach in Barangay Tubod',
        'content' => 'Spay and neuter mission details.',
        'status' => 'published',
        'published_at' => now()->subDay(),
    ]);

    $response = $this->get(route('blog.index', ['search' => 'Republic Act 8485']));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('blog/index')
            ->has('posts.data', 1)
            ->where('posts.data.0.title', 'Animal Welfare Act Republic Act 8485')
        );
});

test('draft posts are excluded from public blog feed', function () {
    $admin = User::factory()->admin()->create();

    BlogPost::factory()->create([
        'author_id' => $admin->id,
        'title' => 'Published Article',
        'status' => 'published',
        'published_at' => now()->subDay(),
    ]);

    BlogPost::factory()->draft()->create([
        'author_id' => $admin->id,
        'title' => 'Unpublished Secret Article',
    ]);

    $response = $this->get(route('blog.index'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('blog/index')
            ->has('posts.data', 1)
            ->where('posts.data.0.title', 'Published Article')
        );
});

test('public guests can view a single published blog post by its slug', function () {
    $admin = User::factory()->admin()->create();

    $post = BlogPost::factory()->create([
        'author_id' => $admin->id,
        'title' => 'The Miracle Rescue of Bella',
        'slug' => 'the-miracle-rescue-of-bella',
        'status' => 'published',
        'published_at' => now()->subDay(),
        'views_count' => 10,
    ]);

    $response = $this->get(route('blog.show', $post->slug));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('blog/show')
            ->where('post.title', 'The Miracle Rescue of Bella')
            ->has('relatedPosts')
        );

    // View count increment check
    expect($post->fresh()->views_count)->toBe(11);
});

test('draft post returns 404 for public guests but is viewable by admin', function () {
    $admin = User::factory()->admin()->create();
    $regularUser = User::factory()->user()->create();

    $draftPost = BlogPost::factory()->draft()->create([
        'author_id' => $admin->id,
        'title' => 'Draft Story Coming Soon',
        'slug' => 'draft-story-coming-soon',
    ]);

    // Guest gets 404
    $guestResponse = $this->get(route('blog.show', $draftPost->slug));
    $guestResponse->assertNotFound();

    // Regular user gets 404
    $userResponse = $this->actingAs($regularUser)->get(route('blog.show', $draftPost->slug));
    $userResponse->assertNotFound();

    // Admin can preview
    $adminResponse = $this->actingAs($admin)->get(route('blog.show', $draftPost->slug));
    $adminResponse->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('blog/show')
            ->where('post.title', 'Draft Story Coming Soon')
        );
});

test('users can react and toggle reaction on a blog post', function () {
    $user = User::factory()->user()->create();
    $admin = User::factory()->admin()->create();

    $post = BlogPost::factory()->create([
        'author_id' => $admin->id,
        'status' => 'published',
        'published_at' => now()->subDay(),
    ]);

    // 1. Add reaction
    $reactResponse = $this->actingAs($user)->post(route('blog.react', $post), [
        'reaction_type' => 'heart',
    ]);

    $reactResponse->assertRedirect();
    $this->assertDatabaseHas('blog_post_reactions', [
        'blog_post_id' => $post->id,
        'user_id' => $user->id,
        'reaction_type' => 'heart',
    ]);

    // 2. Toggle reaction off (un-react)
    $unreactResponse = $this->actingAs($user)->post(route('blog.react', $post), [
        'reaction_type' => 'heart',
    ]);

    $unreactResponse->assertRedirect();
    $this->assertDatabaseMissing('blog_post_reactions', [
        'blog_post_id' => $post->id,
        'user_id' => $user->id,
        'reaction_type' => 'heart',
    ]);
});

test('users can share a blog post incrementing share count', function () {
    $admin = User::factory()->admin()->create();

    $post = BlogPost::factory()->create([
        'author_id' => $admin->id,
        'shares_count' => 5,
        'status' => 'published',
        'published_at' => now()->subDay(),
    ]);

    $response = $this->post(route('blog.share', $post));

    $response->assertRedirect();
    expect($post->fresh()->shares_count)->toBe(6);
});

test('no comments route exists for blog posts', function () {
    $admin = User::factory()->admin()->create();
    $post = BlogPost::factory()->create(['author_id' => $admin->id]);

    // Attempting to post comments to /blog/{post}/comments returns 404
    $response = $this->post("/blog/{$post->id}/comments", [
        'comment' => 'This is a test comment',
    ]);

    $response->assertNotFound();
});

test('non-admin users cannot access admin blog management dashboard', function () {
    $regularUser = User::factory()->user()->create();

    // Guest redirected to login
    $guestResponse = $this->get(route('account.admin.blog-management'));
    $guestResponse->assertRedirect(route('login'));

    // Regular user forbidden
    $userResponse = $this->actingAs($regularUser)->get(route('account.admin.blog-management'));
    $userResponse->assertForbidden();
});

test('admin can access blog management dashboard with metrics', function () {
    $admin = User::factory()->admin()->create();

    BlogPost::factory()->count(2)->create(['author_id' => $admin->id]);

    $response = $this->actingAs($admin)->get(route('account.admin.blog-management'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/blog-management')
            ->has('posts.data', 2)
            ->has('metrics')
            ->has('categories')
            ->has('filters')
        );
});

test('admin can create a new blog post with category, tags, and status', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('account.admin.blog-management.store'), [
        'title' => 'New Rescue Operation in Iligan Bay',
        'category' => 'rescue_story',
        'summary' => 'Volunteers rescued 4 puppies near the shoreline.',
        'content' => 'Full story about the swift response and warm recovery.',
        'featured_image' => 'https://images.unsplash.com/photo-1594004844613-19d4db632e0f',
        'tags' => ['Bay Rescue', 'Puppies', 'Iligan'],
        'reading_time_minutes' => 4,
        'status' => 'published',
        'is_featured' => true,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('blog_posts', [
        'title' => 'New Rescue Operation in Iligan Bay',
        'category' => 'rescue_story',
        'author_id' => $admin->id,
        'status' => 'published',
        'is_featured' => true,
    ]);
});

test('admin can update an existing blog post', function () {
    $admin = User::factory()->admin()->create();
    $post = BlogPost::factory()->create([
        'author_id' => $admin->id,
        'title' => 'Original Story Title',
        'category' => 'announcement',
    ]);

    $response = $this->actingAs($admin)->put(route('account.admin.blog-management.update', $post), [
        'title' => 'Updated Story Title With Impact',
        'category' => 'advocacy_campaign',
        'summary' => 'Updated summary text.',
        'content' => 'Updated content text here.',
        'tags' => ['Advocacy', 'Updated'],
        'reading_time_minutes' => 5,
        'status' => 'published',
        'is_featured' => false,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('blog_posts', [
        'id' => $post->id,
        'title' => 'Updated Story Title With Impact',
        'category' => 'advocacy_campaign',
    ]);
});

test('admin can toggle publication status of a blog post', function () {
    $admin = User::factory()->admin()->create();
    $post = BlogPost::factory()->create([
        'author_id' => $admin->id,
        'status' => 'published',
    ]);

    // Toggle to draft
    $response = $this->actingAs($admin)->patch(route('account.admin.blog-management.toggle-status', $post));
    $response->assertRedirect();
    expect($post->fresh()->status)->toBe('draft');

    // Toggle back to published
    $response2 = $this->actingAs($admin)->patch(route('account.admin.blog-management.toggle-status', $post));
    $response2->assertRedirect();
    expect($post->fresh()->status)->toBe('published');
});

test('admin can delete a blog post', function () {
    $admin = User::factory()->admin()->create();
    $post = BlogPost::factory()->create(['author_id' => $admin->id]);

    $response = $this->actingAs($admin)->delete(route('account.admin.blog-management.destroy', $post));

    $response->assertRedirect();
    $this->assertSoftDeleted('blog_posts', ['id' => $post->id]);
});

test('non-admin users cannot create blog posts', function () {
    $regularUser = User::factory()->user()->create();

    $response = $this->actingAs($regularUser)->post(route('account.admin.blog-management.store'), [
        'title' => 'Unauthorized Post',
        'category' => 'news_update',
        'content' => 'Unauthorized content.',
        'status' => 'published',
    ]);

    $response->assertForbidden();
});
