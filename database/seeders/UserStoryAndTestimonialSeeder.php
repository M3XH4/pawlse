<?php

namespace Database\Seeders;

use App\Enums\AdoptionApplicationStatus;
use App\Enums\Role;
use App\Models\AdoptionApplication;
use App\Models\BlogPost;
use App\Models\BlogPostReaction;
use App\Models\ShelterAnimal;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserStoryAndTestimonialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create standard test users
        $user = User::where('email', 'user@pawlse.test')->first() ?? User::factory()->create([
            'name' => 'Pawlse User',
            'email' => 'user@pawlse.test',
            'role' => Role::User->value,
            'password' => 'password',
        ]);

        $admin = User::where('email', 'admin@pawlse.test')->first() ?? User::factory()->admin()->create([
            'name' => 'Pawlse Admin',
            'email' => 'admin@pawlse.test',
            'role' => Role::Admin->value,
            'password' => 'password',
        ]);

        // Link to real resident dogs
        $adoptedDog = ShelterAnimal::where('name', 'Reto')->first() ?? ShelterAnimal::first();
        $adoptedDog2 = ShelterAnimal::where('name', 'Happy')->first() ?? ShelterAnimal::skip(1)->first();

        // Ensure user has approved adoption application for Bantay
        $adoptionApp = AdoptionApplication::where('user_id', $user->id)
            ->where('shelter_animal_id', $adoptedDog->id)
            ->first();

        if (! $adoptionApp) {
            $adoptionApp = AdoptionApplication::factory()->create([
                'user_id' => $user->id,
                'shelter_animal_id' => $adoptedDog->id,
                'status' => AdoptionApplicationStatus::Approved,
                'full_name' => $user->name,
                'email' => $user->email,
            ]);
        }

        // 1. APPROVED & PUBLISHED STORY (Visible on /blog, /blog/adopting-bantay-best-decision, and user dashboard)
        $approvedStory = BlogPost::updateOrCreate(
            ['slug' => 'adopting-bantay-best-decision-our-family-made'],
            [
                'author_id' => $user->id,
                'shelter_animal_id' => $adoptedDog->id,
                'adoption_application_id' => $adoptionApp->id,
                'title' => 'Adopting Bantay: The Best Decision Our Family Ever Made',
                'category' => 'adoption_success',
                'summary' => 'From a shy dog shivering at the shelter to our children’s most faithful guardian and best friend.',
                'content' => "When our family walked into the PAWLSE shelter four months ago, Bantay was resting in the corner of kennel 3 with gentle, soulful eyes. We were initially nervous about adopting an adult rescue dog, but the shelter team patiently guided us through the entire meet-and-greet process.\n\n### The First Few Weeks At Home\nThe transition was smoother than we ever imagined. Bantay quickly learned our routine, mastered house training within a week, and immediately formed an unbreakable bond with our seven-year-old daughter. Every afternoon, he waits by the front gate when the school bus arrives, his tail wagging like a joyful metronome.\n\n### Why You Should Adopt, Not Shop\nRescue animals possess an incredible capacity for gratitude. Bantay brings so much laughter, warmth, and exercise to our daily routine. If you are considering adding a pet to your family, please visit the shelter. You aren't just getting a pet—you are saving a life and gaining a loyal family member.",
                'featured_image' => 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&auto=format&fit=crop&q=80',
                'tags' => ['Adoption Story', 'Aspin Pride', 'Family Companion', 'Testimonial'],
                'reading_time_minutes' => 3,
                'status' => BlogPost::STATUS_PUBLISHED,
                'rating' => 5,
                'is_featured' => true,
                'views_count' => 148,
                'shares_count' => 24,
                'published_at' => now()->subDays(3),
                'reviewed_by' => $admin->id,
                'reviewed_at' => now()->subDays(3),
            ]
        );

        // 2. APPROVED & PUBLISHED COMMUNITY TESTIMONIAL (Visible on /blog under Testimonials tab!)
        BlogPost::updateOrCreate(
            ['slug' => 'why-pawlse-sets-the-gold-standard-for-animal-shelter-care'],
            [
                'author_id' => $user->id,
                'title' => 'Why PAWLSE Sets The Gold Standard For Animal Shelter Care',
                'category' => 'testimonial',
                'summary' => 'Transparent health screening, attentive volunteer counselors, and genuine dedication to every animal in their care.',
                'content' => "Having visited several shelters over the years, our experience with PAWLSE was on a completely different level. From the clean and well-ventilated kennels to the detailed medical breakdown provided by their on-site clinic, the standard of care is astonishing.\n\n### Exceptional Volunteer Guidance\nThe adoption counselors did not rush us into choosing a pet. Instead, they took time to understand our household lifestyle, energy levels, and routine to recommend animals that would genuinely thrive with us.\n\n### Comprehensive Post-Adoption Support\nEven weeks after bringing our companion home, PAWLSE followed up with wellness check-ins and feeding guidance. They don't just find homes for animals; they build long-lasting community relationships.",
                'featured_image' => 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80',
                'tags' => ['Testimonial', 'Shelter Review', 'Compassion In Action', 'Community Voice'],
                'reading_time_minutes' => 3,
                'status' => BlogPost::STATUS_PUBLISHED,
                'rating' => 5,
                'is_featured' => false,
                'views_count' => 96,
                'shares_count' => 18,
                'published_at' => now()->subDay(),
                'reviewed_by' => $admin->id,
                'reviewed_at' => now()->subDay(),
            ]
        );

        // Add some reactions to the published story
        BlogPostReaction::firstOrCreate([
            'blog_post_id' => $approvedStory->id,
            'user_id' => $admin->id,
            'reaction_type' => 'heart',
        ]);
        BlogPostReaction::firstOrCreate([
            'blog_post_id' => $approvedStory->id,
            'session_id' => 'sample_guest_session_1',
            'reaction_type' => 'paws',
        ]);

        // 3. PENDING REVIEW STORY (Visible in User Dashboard as Pending & in Admin Panel ready for Approve/Reject)
        BlogPost::updateOrCreate(
            ['slug' => 'kokos-first-month-forever-home-purrs-and-playtime'],
            [
                'author_id' => $user->id,
                'shelter_animal_id' => $adoptedDog2->id,
                'title' => "Happy's First Month in Her Forever Sanctuary: Tail Wags and Endless Sunshine",
                'category' => 'adoption_success',
                'summary' => 'Our sweet rescue dog Happy brings endless laughter and warmth to the whole sanctuary family.',
                'content' => "We welcomed Happy into our sanctuary community after her rescue in San Miguel. She is a bundle of unconditional joy!\n\nShe spends her mornings welcoming visitors with eager tail wags and her afternoons napping in the shade. Thank you to the PAWLSE team for the spotless medical records, initial vaccination care, and dedicated volunteer support.",
                'featured_image' => 'https://images.unsplash.com/photo-1588943211346-090881b578cb?w=1200&auto=format&fit=crop&q=80',
                'tags' => ['Adoption Story', 'Aspin Love', 'Sanctuary Ambassador'],
                'reading_time_minutes' => 2,
                'status' => BlogPost::STATUS_PENDING,
                'rating' => 5,
                'is_featured' => false,
                'views_count' => 0,
                'shares_count' => 0,
                'published_at' => null,
            ]
        );

        // 4. PENDING REVIEW TESTIMONIAL (A pure testimonial waiting for admin review)
        BlogPost::updateOrCreate(
            ['slug' => 'heartfelt-praise-for-the-rescue-and-outreach-team'],
            [
                'author_id' => $user->id,
                'title' => 'Heartfelt Praise for the Emergency Rescue & Clinic Team',
                'category' => 'testimonial',
                'summary' => 'Their swift response and compassionate handling during an injured stray emergency saved a life.',
                'content' => "Last month we encountered a stray dog that had been struck by a motorcycle along the highway. We called the PAWLSE SOS emergency hotline with little hope, but within 25 minutes their rescue vehicle arrived.\n\nThe volunteers and veterinary team acted with immense professionalism, stabilization, and warmth. Today that dog is healing well. I cannot thank PAWLSE enough for their tireless devotion.",
                'featured_image' => 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200&auto=format&fit=crop&q=80',
                'tags' => ['Testimonial', 'Rescue Support', 'Veterinary Care'],
                'reading_time_minutes' => 2,
                'status' => BlogPost::STATUS_PENDING,
                'rating' => 5,
                'is_featured' => false,
                'views_count' => 0,
                'shares_count' => 0,
                'published_at' => null,
            ]
        );

        // 5. REVISION REQUESTED / REJECTED STORY (Visible in User Dashboard with Admin Feedback note)
        BlogPost::updateOrCreate(
            ['slug' => 'weekend-park-adventures-with-our-pups'],
            [
                'author_id' => $user->id,
                'title' => 'Weekend Park Adventures With Our Pups',
                'category' => 'rescue_story',
                'summary' => 'Fun memories from our weekend run.',
                'content' => 'We took the dogs out to the park. It was very fun and they ran around a lot.',
                'featured_image' => 'https://images.unsplash.com/photo-1534361960057-19889db98a1e?w=1200&auto=format&fit=crop&q=80',
                'tags' => ['Weekend', 'Dogs'],
                'reading_time_minutes' => 1,
                'status' => BlogPost::STATUS_REJECTED,
                'rejection_reason' => 'Please provide more details about your rescue or adoption experience and how PAWLSE helped your journey.',
                'rating' => 4,
                'is_featured' => false,
                'published_at' => null,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now()->subDay(),
            ]
        );
    }
}
