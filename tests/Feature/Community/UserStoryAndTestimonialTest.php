<?php

use App\Models\AdoptionApplication;
use App\Models\BlogPost;
use App\Models\ShelterAnimal;
use App\Models\User;
use App\Notifications\UserStoryApprovedNotification;
use App\Notifications\UserStoryRejectedNotification;
use App\Notifications\UserStorySubmittedNotification;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    Storage::fake('public');
});

test('authenticated user can view their stories page in dashboard', function () {
    $user = User::factory()->create();

    $pet = ShelterAnimal::factory()->create(['name' => 'Charlie', 'status' => 'adopted']);
    AdoptionApplication::factory()->create([
        'user_id' => $user->id,
        'shelter_animal_id' => $pet->id,
        'status' => 'approved',
    ]);

    $story = BlogPost::factory()->create([
        'author_id' => $user->id,
        'shelter_animal_id' => $pet->id,
        'title' => 'Life With Charlie',
        'status' => BlogPost::STATUS_PENDING,
        'rating' => 5,
    ]);

    $response = $this->actingAs($user)->get(route('account.user.stories.index'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/stories')
            ->has('stories.data', 1)
            ->where('stories.data.0.title', 'Life With Charlie')
            ->where('stories.data.0.status', BlogPost::STATUS_PENDING)
            ->has('adoptedPets', 1)
            ->has('metrics')
            ->where('metrics.pending', 1)
            ->where('metrics.published', 0)
        );
});

test('user can submit an adoption story and testimonial which defaults to pending approval', function () {
    Notification::fake();

    $user = User::factory()->create(['name' => 'Jane Adopter']);
    $admin = User::factory()->admin()->create();
    $pet = ShelterAnimal::factory()->create(['name' => 'Luna']);

    $payload = [
        'title' => 'Luna Changed Our Family Forever',
        'category' => 'adoption_success',
        'summary' => 'From shy shelter puppy to beloved family companion.',
        'content' => 'We adopted Luna three months ago. She was timid at first but with love and patience she now plays happily every day.',
        'rating' => 5,
        'shelter_animal_id' => $pet->id,
        'tags' => ['Adoption', 'Dog', 'Happy Ending'],
    ];

    $response = $this->actingAs($user)->post(route('account.user.stories.store'), $payload);

    $response->assertRedirect(route('account.user.stories.index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('blog_posts', [
        'author_id' => $user->id,
        'title' => 'Luna Changed Our Family Forever',
        'category' => 'adoption_success',
        'status' => BlogPost::STATUS_PENDING,
        'rating' => 5,
        'shelter_animal_id' => $pet->id,
        'published_at' => null,
    ]);

    Notification::assertSentTo(
        [$admin],
        UserStorySubmittedNotification::class
    );
});

test('user can upload a photo when submitting an adoption story', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->image('luna_adoption.jpg', 600, 400);

    $payload = [
        'title' => 'Heartwarming Rescue Story with Milo',
        'category' => 'rescue_story',
        'content' => 'Milo was found in rough shape but our journey together has been inspiring and full of happiness.',
        'rating' => 5,
        'featured_image' => $file,
    ];

    $response = $this->actingAs($user)->post(route('account.user.stories.store'), $payload);

    $response->assertRedirect(route('account.user.stories.index'));

    $post = BlogPost::where('title', 'Heartwarming Rescue Story with Milo')->firstOrFail();
    expect($post->status)->toBe(BlogPost::STATUS_PENDING)
        ->and($post->featured_image)->not->toBeNull();
});

test('pending stories are not visible on public blog feed or show route', function () {
    $user = User::factory()->create();

    $pendingStory = BlogPost::factory()->create([
        'author_id' => $user->id,
        'title' => 'Private Pending Testimonial',
        'slug' => 'private-pending-testimonial',
        'status' => BlogPost::STATUS_PENDING,
        'published_at' => null,
    ]);

    // Public blog index
    $indexResponse = $this->get(route('blog.index'));
    $indexResponse->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('blog/index')
            ->has('posts.data', 0)
        );

    // Public guest accessing show route
    $showResponse = $this->get(route('blog.show', $pendingStory->slug));
    $showResponse->assertNotFound();

    // Regular user accessing show route
    $otherUser = User::factory()->create();
    $userResponse = $this->actingAs($otherUser)->get(route('blog.show', $pendingStory->slug));
    $userResponse->assertNotFound();
});

test('user can update their pending or rejected story and resubmit for review', function () {
    $user = User::factory()->create();

    $story = BlogPost::factory()->create([
        'author_id' => $user->id,
        'title' => 'Original Draft Title',
        'content' => 'Initial content that was too brief.',
        'status' => BlogPost::STATUS_REJECTED,
        'rejection_reason' => 'Please expand on your story.',
    ]);

    $updatePayload = [
        'title' => 'Updated Story Title with More Details',
        'category' => 'adoption_success',
        'summary' => 'A much better summary.',
        'content' => 'Here is a much more descriptive journey of how our rescue dog acclimated to the new environment.',
        'rating' => 5,
    ];

    $response = $this->actingAs($user)->put(route('account.user.stories.update', $story), $updatePayload);

    $response->assertRedirect(route('account.user.stories.index'));

    $story->refresh();
    expect($story->title)->toBe('Updated Story Title with More Details')
        ->and($story->status)->toBe(BlogPost::STATUS_PENDING)
        ->and($story->rejection_reason)->toBeNull();
});

test('user cannot update another users story', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();

    $story = BlogPost::factory()->create([
        'author_id' => $owner->id,
        'title' => 'Owners Story',
        'content' => 'Original content owned by the first user.',
        'status' => BlogPost::STATUS_PENDING,
    ]);

    $response = $this->actingAs($otherUser)->put(route('account.user.stories.update', $story), [
        'title' => 'Hacked Title',
        'category' => 'adoption_success',
        'content' => 'Unauthorized update content attempt.',
    ]);

    $response->assertForbidden();
});

test('user can delete their own story', function () {
    $user = User::factory()->create();

    $story = BlogPost::factory()->create([
        'author_id' => $user->id,
        'title' => 'Story to Delete',
        'status' => BlogPost::STATUS_PENDING,
    ]);

    $response = $this->actingAs($user)->delete(route('account.user.stories.destroy', $story));

    $response->assertRedirect(route('account.user.stories.index'));
    $this->assertSoftDeleted('blog_posts', ['id' => $story->id]);
});

test('admin can approve a pending story which publishes it and notifies the author', function () {
    Notification::fake();

    $author = User::factory()->create(['name' => 'Story Author']);
    $admin = User::factory()->admin()->create(['name' => 'Shelter Admin']);

    $story = BlogPost::factory()->create([
        'author_id' => $author->id,
        'title' => 'Approved Adoption Journey',
        'slug' => 'approved-adoption-journey',
        'status' => BlogPost::STATUS_PENDING,
        'published_at' => null,
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.blog-management.approve', $story));

    $response->assertStatus(302);
    $response->assertSessionHas('success');

    $story->refresh();
    expect($story->status)->toBe(BlogPost::STATUS_PUBLISHED)
        ->and($story->published_at)->not->toBeNull()
        ->and($story->reviewed_by)->toBe($admin->id)
        ->and($story->reviewed_at)->not->toBeNull();

    Notification::assertSentTo(
        [$author],
        UserStoryApprovedNotification::class
    );

    // Now it should be visible on the public blog
    $publicResponse = $this->get(route('blog.show', $story->slug));
    $publicResponse->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('blog/show')
            ->where('post.title', 'Approved Adoption Journey')
            ->where('post.author.name', 'Story Author')
        );
});

test('admin can reject a pending story with feedback and author is notified', function () {
    Notification::fake();

    $author = User::factory()->create(['name' => 'Story Author']);
    $admin = User::factory()->admin()->create();

    $story = BlogPost::factory()->create([
        'author_id' => $author->id,
        'title' => 'Story Needing Revision',
        'status' => BlogPost::STATUS_PENDING,
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.blog-management.reject', $story), [
        'rejection_reason' => 'Please provide more details about how the pet adjusted to other household animals.',
    ]);

    $response->assertStatus(302);

    $story->refresh();
    expect($story->status)->toBe(BlogPost::STATUS_REJECTED)
        ->and($story->rejection_reason)->toBe('Please provide more details about how the pet adjusted to other household animals.')
        ->and($story->reviewed_by)->toBe($admin->id);

    Notification::assertSentTo(
        [$author],
        UserStoryRejectedNotification::class
    );
});

test('regular user cannot approve or reject blog posts', function () {
    $regularUser = User::factory()->create();
    $story = BlogPost::factory()->create([
        'status' => BlogPost::STATUS_PENDING,
    ]);

    $approveResponse = $this->actingAs($regularUser)->post(route('account.admin.blog-management.approve', $story));
    $approveResponse->assertForbidden();

    $rejectResponse = $this->actingAs($regularUser)->post(route('account.admin.blog-management.reject', $story), [
        'rejection_reason' => 'Unauthorized rejection',
    ]);
    $rejectResponse->assertForbidden();
});

test('user can submit a shelter testimonial without an adopted pet', function () {
    $user = User::factory()->create();

    $payload = [
        'title' => 'PAWLSE Sets The Standard for Compassionate Animal Welfare',
        'category' => 'testimonial',
        'summary' => 'Their dedication to strays and clean shelter facilities is inspiring.',
        'content' => 'I have volunteered and visited multiple shelters, but the transparency, staff enthusiasm, and veterinary care at PAWLSE is unmatched.',
        'rating' => 5,
        'shelter_animal_id' => null,
        'tags' => ['Testimonial', 'Community Praise'],
    ];

    $response = $this->actingAs($user)->post(route('account.user.stories.store'), $payload);

    $response->assertRedirect(route('account.user.stories.index'));

    $this->assertDatabaseHas('blog_posts', [
        'author_id' => $user->id,
        'title' => 'PAWLSE Sets The Standard for Compassionate Animal Welfare',
        'category' => 'testimonial',
        'status' => BlogPost::STATUS_PENDING,
        'rating' => 5,
        'shelter_animal_id' => null,
    ]);
});

test('public visitors can view and filter testimonials on public blog', function () {
    $admin = User::factory()->admin()->create();

    $testimonial = BlogPost::factory()->create([
        'author_id' => $admin->id,
        'title' => 'Inspiring Community Shelter Review',
        'category' => 'testimonial',
        'rating' => 5,
        'status' => BlogPost::STATUS_PUBLISHED,
        'published_at' => now()->subDay(),
    ]);

    $response = $this->get(route('blog.index', ['category' => 'testimonial']));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('blog/index')
            ->has('posts.data', 1)
            ->where('posts.data.0.title', 'Inspiring Community Shelter Review')
            ->where('posts.data.0.category', 'testimonial')
            ->where('filters.category', 'testimonial')
        );
});

test('author can preview their own pending or rejected story on public blog route while strangers get 404', function () {
    $author = User::factory()->create();
    $stranger = User::factory()->create();

    $story = BlogPost::factory()->create([
        'author_id' => $author->id,
        'title' => 'Pending Review Journey',
        'slug' => 'pending-review-journey',
        'status' => BlogPost::STATUS_PENDING,
        'published_at' => null,
    ]);

    // Stranger gets 404
    $this->actingAs($stranger)->get(route('blog.show', $story->slug))->assertNotFound();
    // Guest gets 404
    $this->get(route('blog.show', $story->slug))->assertNotFound();

    // Author can preview
    $this->actingAs($author)->get(route('blog.show', $story->slug))->assertOk();
});

test('author can unlink pet when updating an adoption story to a general testimonial', function () {
    $user = User::factory()->create();
    $pet = ShelterAnimal::factory()->create();

    $story = BlogPost::factory()->create([
        'author_id' => $user->id,
        'shelter_animal_id' => $pet->id,
        'category' => 'adoption_success',
        'status' => BlogPost::STATUS_PUBLISHED,
    ]);

    $response = $this->actingAs($user)->put(route('account.user.stories.update', $story), [
        'title' => 'Now A General Review',
        'category' => 'testimonial',
        'content' => 'Updated content that meets the minimum length requirement for testing.',
        'rating' => 5,
        'shelter_animal_id' => '',
    ]);

    $response->assertRedirect(route('account.user.stories.index'));

    $story->refresh();
    expect($story->shelter_animal_id)->toBeNull();
    expect($story->category)->toBe('testimonial');
    expect($story->status)->toBe(BlogPost::STATUS_PENDING);
});
