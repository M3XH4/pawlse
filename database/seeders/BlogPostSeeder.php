<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\BlogPostReaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class BlogPostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@pawlse.test')->first() ?? User::first();
        $adminId = $admin?->id;

        $posts = [
            [
                'title' => 'Advocacy in Action: Animal Welfare Act (RA 8485) and Stray Rights in the Philippines',
                'slug' => 'animal-welfare-act-ra-8485-stray-rights',
                'category' => 'advocacy_campaign',
                'summary' => 'Understanding Republic Act No. 8485 and RA 10631: How Philippine law protects stray and companion animals against abuse, abandonment, and illegal trade.',
                'content' => "Animal protection in the Philippines has made significant legislative strides, yet awareness on the grassroots level remains one of our primary battlegrounds. Republic Act No. 8485, known as the Animal Welfare Act of 1998, amended by RA 10631, firmly establishes that all animals possess legal protections against torture, neglect, and maltreatment.\n\n### Key Protections Under RA 8485 & RA 10631\n\n1. **Prohibition of Cruelty and Abandonment**: Any person who subjects any animal to cruelty, maltreatment, or arbitrary abandonment faces criminal liabilities, including fines and imprisonment.\n2. **Duty of Care**: Pet custodians are legally required to provide clean water, sufficient sustenance, and adequate shelter shielding animals from extreme weather.\n3. **Prohibition of the Dog Meat Trade**: Transporting, trading, or slaughtering dogs and cats for commercial meat consumption is strictly unlawful and punishable under national statutes.\n\n### How Community Members Can Advocate\n\nWhen witnessing acts of animal abuse or neglect within Iligan City and surrounding barangays, document evidence safely (photographs, time, and location) and report immediately through PAWLSE's SOS portal or directly to local barangay animal welfare officers. By upholding the law together, we ensure that compassion is not just a sentiment, but an enforced community standard.",
                'featured_image' => 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80',
                'tags' => ['Advocacy', 'RA 8485', 'Animal Welfare Laws', 'Community Awareness'],
                'reading_time_minutes' => 4,
                'status' => 'published',
                'is_featured' => true,
                'views_count' => 342,
                'shares_count' => 58,
                'published_at' => now()->subDays(2),
            ],
            [
                'title' => 'From Tambo Drainage to Shelter Hero: The Survival Journey of Milo',
                'slug' => 'milo-survival-journey-tambo-drainage',
                'category' => 'rescue_story',
                'summary' => 'Trapped in a flash flood drain for over 18 hours, Milo’s dramatic rescue by ISF volunteers brought our community together in heart-stopping solidarity.',
                'content' => "It began as an urgent SOS alert received at 11:45 PM on a rainy Tuesday. Residents in Zone 5, Barangay Tambo reported distress whimpers echoing from a concrete stormwater drainage.\n\nOur night emergency team mobilized promptly with flashlights, harnesses, and safety catch nets. Deep inside the culvert, neck-deep in rising flood water, was a soaked, hypothermic 4-month-old puppy shivering uncontrollably on a narrow mud ledge.\n\nAfter a delicate two-hour extraction operation involving two volunteer responders and compassionate local neighborhood youth, Milo was gently hauled to safety. He was immediately wrapped in thermal blankets and rushed to partner clinic Dr. E Veterinary Clinic for emergency IV fluids and wound treatment.\n\nToday, Milo has completely recovered, gaining 4 kilograms, receiving his core 5-in-1 vaccinations, and charming every single visitor at our shelter. Milo reminds us daily why rapid response and dedicated rescue networks save lives.",
                'featured_image' => 'https://images.unsplash.com/photo-1594004844613-19d4db632e0f?w=1200&auto=format&fit=crop&q=80',
                'tags' => ['Rescue Story', 'Emergency Response', 'Barangay Tambo', 'Puppy Rescue'],
                'reading_time_minutes' => 3,
                'status' => 'published',
                'is_featured' => false,
                'views_count' => 512,
                'shares_count' => 84,
                'published_at' => now()->subDays(4),
            ],
            [
                'title' => 'Bella Finds Her Forever Family: A Year of Rehabilitation and Love',
                'slug' => 'bella-finds-forever-family-adoption-success',
                'category' => 'adoption_success',
                'summary' => 'After 11 months of gentle rehabilitation from severe mange and fear, sweet aspin Bella has officially joined the Del Fierro family.',
                'content' => "When Bella was first admitted to the PAWLSE shelter, she wouldn’t make eye contact. Severely malnourished, suffering from widespread demodectic mange, and terrified of human touch, she spent her first three weeks huddled at the corner of her kennel.\n\nOur foster team and medical staff provided daily medicated baths, nutritional supplements, and patient behavioral enrichment. Week by week, Bella’s tail began to wag, her coat grew into a glossy caramel sheen, and her playful personality emerged.\n\nLast Saturday, after home safety screening and mutual trial visits, the Del Fierro family officially finalized Bella’s adoption papers! Bella now has a spacious fenced garden to romp in, two loving human siblings, and a cozy bed by the living room window.\n\nStories like Bella’s highlight why shelter adoptions transform lives—both for the rescue animal and for the adopters who open their homes.",
                'featured_image' => 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&auto=format&fit=crop&q=80',
                'tags' => ['Adoption Success', 'Foster Care', 'Rehabilitation', 'Forever Home'],
                'reading_time_minutes' => 3,
                'status' => 'published',
                'is_featured' => false,
                'views_count' => 418,
                'shares_count' => 42,
                'published_at' => now()->subDays(7),
            ],
            [
                'title' => 'Responsible Pet Ownership: Vaccinations, Parasite Control, and Nutrition Essentials',
                'slug' => 'responsible-pet-ownership-vaccinations-nutrition',
                'category' => 'community_awareness',
                'summary' => 'A comprehensive guide for pet parents on essential vaccination timelines, deworming schedules, and balanced diets to keep our furry companions healthy.',
                'content' => "Being a pet guardian comes with unconditional joy, but also vital commitments to preventive health care. Here is PAWLSE's essential health checklist for dogs and cats:\n\n### 1. Essential Vaccination Timeline\n- **Core Canine Vaccines**: DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza) starting at 6–8 weeks, with booster shots every 3–4 weeks until 16 weeks old.\n- **Rabies Vaccination**: Mandated by Philippine law under RA 9482 (Anti-Rabies Act). Required at 3–4 months of age with annual booster vaccinations.\n- **Feline Core Vaccines**: FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia) starting at 8 weeks.\n\n### 2. Routine Deworming & Tick/Flea Prevention\nPups and kittens should be dewormed starting at 2 weeks of age, followed by routine preventive treatments every 3 months for adults to eliminate intestinal parasites that can cause severe anemia.\n\n### 3. Nutrition & Clean Hydration\nFresh, potable water should be available 24/7. Avoid toxic human foods such as chocolate, cooked chicken bones (which splinter and puncture intestines), onions, garlic, and grapes.",
                'featured_image' => 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1200&auto=format&fit=crop&q=80',
                'tags' => ['Pet Care', 'Education', 'Vaccines', 'Animal Welfare'],
                'reading_time_minutes' => 5,
                'status' => 'published',
                'is_featured' => false,
                'views_count' => 280,
                'shares_count' => 31,
                'published_at' => now()->subDays(10),
            ],
            [
                'title' => 'PAWLSE Community Spay & Neuter Mission Scheduled for May 2026',
                'slug' => 'pawlse-community-spay-neuter-mission-may-2026',
                'category' => 'announcement',
                'summary' => 'Join our upcoming low-cost and subsidized Kapon mission in partnership with local veterinary practitioners to humanely control stray pet overpopulation.',
                'content' => "PAWLSE Iligan Stray Feeders is proud to announce our upcoming city-wide Kapon (Spay and Neuter) Outreach Drive slated for Saturday, May 23, 2026, at the Barangay Tubod Gymnasium.\n\n### Why Spaying and Neutering Matters\nHumane sterilization is scientifically proven to be the most effective, ethical method to stabilize stray populations and reduce abandonment rates. Neutered pets also live healthier, longer lives with decreased risks of reproductive cancers and territorial roaming.\n\n### Registration Guidelines\n- Pre-registration is mandatory via our portal or at the ISF Shelter Desk.\n- Fasting required: Pets must fast from food 8 hours prior to surgical procedure.\n- Slot allotment: 150 slots prioritized for community aspins and rescue animals.\n\nVolunteer vet assistants and logistics teams are warmly invited to join this impactful initiative!",
                'featured_image' => 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200&auto=format&fit=crop&q=80',
                'tags' => ['Announcement', 'Spay & Neuter', 'Kapon', 'Events'],
                'reading_time_minutes' => 3,
                'status' => 'published',
                'is_featured' => false,
                'views_count' => 389,
                'shares_count' => 63,
                'published_at' => now()->subDays(12),
            ],
            [
                'title' => 'Weekly Feeding Operations Recap: 140+ Strays Fed Across Pala-o, Tubod, and Hinaplanon',
                'slug' => 'weekly-feeding-operations-recap-140-strays',
                'category' => 'news_update',
                'summary' => 'Our volunteer feeding caravan covered 6 major routes this past weekend, providing nutritious kibble, fresh broth, and wound dressings.',
                'content' => "Rain or shine, our dedicated ISF volunteer feeding teams hit the streets across Pala-o Public Market, Tubod highway corridors, and Hinaplanon riverbanks.\n\nOver the course of 3 days, our volunteers distributed more than 85 kilograms of balanced high-protein dry food and chicken broth meals to 142 documented community cats and dogs. During the route, our volunteer vet team also applied wound antiseptics and anti-mange sprays to 8 community dogs.\n\nWe extend our heartfelt gratitude to all food donors and sponsors whose generosity fills empty bellies every week. If you'd like to join our upcoming weekend feeding convoy, register through our Volunteer tab!",
                'featured_image' => 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=1200&auto=format&fit=crop&q=80',
                'tags' => ['News', 'Feeding Operations', 'Volunteers', 'Community Care'],
                'reading_time_minutes' => 2,
                'status' => 'published',
                'is_featured' => false,
                'views_count' => 215,
                'shares_count' => 29,
                'published_at' => now()->subDays(15),
            ],
        ];

        foreach ($posts as $postData) {
            $post = BlogPost::updateOrCreate(
                ['slug' => $postData['slug']],
                array_merge($postData, ['author_id' => $adminId])
            );

            // Seed sample reactions
            if ($post->reactions()->count() === 0) {
                $reactionTypes = ['heart', 'paws', 'celebrate', 'care'];
                foreach ($reactionTypes as $type) {
                    BlogPostReaction::create([
                        'blog_post_id' => $post->id,
                        'user_id' => $adminId,
                        'session_id' => 'seed-session-'.$type,
                        'reaction_type' => $type,
                    ]);
                }
            }
        }
    }
}
