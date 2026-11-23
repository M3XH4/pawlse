<?php

use App\Enums\ShelterAnimalStatus;
use App\Models\BlogPost;
use App\Models\Event;
use App\Models\PetReport;
use App\Models\PetReportPhoto;
use App\Models\ShelterAnimal;

it('renders missing pet details in open graph meta tags when sharing a pet link', function () {
    $report = PetReport::create([
        'type' => 'missing',
        'name' => 'Mimi',
        'animal_type' => 'Cat',
        'breed' => 'Puspin',
        'color' => 'Calico',
        'gender' => 'female',
        'age_category' => 'young',
        'size' => 'small',
        'reward' => '2000',
        'location' => 'Tibanga Near 7-Eleven, Iligan City',
        'last_seen_date' => '2026-11-22',
        'description' => 'Friendly calico cat with distinct orange and black patches.',
        'contact_name' => 'Carlo Mendoza',
        'contact_phone' => '0918 234 5678',
        'status' => 'pending',
    ]);

    PetReportPhoto::create([
        'pet_report_id' => $report->id,
        'path' => '/storage/missing_pets/mimi.jpg',
        'original_filename' => 'mimi.jpg',
        'mime_type' => 'image/jpeg',
        'file_size' => 1024,
    ]);

    $response = $this->get('/missing?pet='.$report->id);

    $response->assertOk()
        ->assertSee('Missing Cat: Mimi (Puspin) - Pawlse', false)
        ->assertSee('• Name: Mimi', false)
        ->assertSee('• Species &amp; Breed: Cat (Puspin)', false)
        ->assertSee('• Traits: Female • Young • Small • Calico', false)
        ->assertSee('• Last Seen: Tibanga Near 7-Eleven, Iligan City (Nov 22, 2026)', false)
        ->assertSee('💰 REWARD: ₱2000', false)
        ->assertSee('• Details: Friendly calico cat with distinct orange and black patches.', false)
        ->assertSee('• Contact: Carlo Mendoza (0918 234 5678)', false)
        ->assertSee('/storage/missing_pets/mimi.jpg', false)
        ->assertSee('/missing?pet='.$report->id, false);
});

it('renders adoptable pet details in open graph meta tags when sharing an adoption link', function () {
    $pet = ShelterAnimal::factory()->create([
        'name' => 'Bamba',
        'type' => 'dog',
        'breed' => 'Aspin',
        'age' => '2 years',
        'gender' => 'male',
        'color' => 'Brown',
        'vaccinated' => true,
        'status' => ShelterAnimalStatus::Available,
        'photo_url' => '/storage/pet_photos/bamba/photo.png',
        'rescue_story' => 'Very friendly and responds to his name.',
    ]);

    $this->get('/adopt/'.$pet->id)
        ->assertOk()
        ->assertSee('Adopt Bamba (Aspin) - Pawlse', false)
        ->assertSee('• Name: Bamba', false)
        ->assertSee('• Species &amp; Breed: Dog (Aspin)', false)
        ->assertSee('• Traits: Male • 2 years • Brown', false)
        ->assertSee('• Vaccinated: Yes', false)
        ->assertSee('• Story: Very friendly and responds to his name.', false)
        ->assertSee('/storage/pet_photos/bamba/photo.png', false);
});

it('renders event details in open graph meta tags when sharing an event link', function () {
    $event = Event::create([
        'title' => 'Iligan Stray Feeding Drive',
        'category' => 'Feeding',
        'date' => '2026-12-10',
        'time' => '8:00 AM - 12:00 PM',
        'location' => 'Rizal Park, Iligan City',
        'spots' => 30,
        'status' => 'open',
        'img' => '/images/events/feeding.jpg',
        'desc' => 'Join us for our monthly community feeding drive.',
    ]);

    $this->get('/events?event='.$event->id)
        ->assertOk()
        ->assertSee('Iligan Stray Feeding Drive - Pawlse Events', false)
        ->assertSee('• Event: Iligan Stray Feeding Drive', false)
        ->assertSee('• Date: Dec 10, 2026', false)
        ->assertSee('• Time: 8:00 AM - 12:00 PM', false)
        ->assertSee('• Location: Rizal Park, Iligan City', false)
        ->assertSee('• Details: Join us for our monthly community feeding drive.', false)
        ->assertSee('/images/events/feeding.jpg', false);
});

it('renders blog post details in open graph meta tags when sharing a blog link', function () {
    $post = BlogPost::factory()->create([
        'title' => 'How Community Feeding Saves Lives',
        'slug' => 'how-community-feeding-saves-lives',
        'category' => 'rescue_story',
        'summary' => 'A look inside our weekly feeding routes across Iligan City.',
        'status' => BlogPost::STATUS_PUBLISHED,
        'published_at' => now(),
        'featured_image' => '/storage/blog/feeding.jpg',
    ]);

    $this->get('/blog/'.$post->slug)
        ->assertOk()
        ->assertSee('How Community Feeding Saves Lives - Pawlse Blog', false)
        ->assertSee('• Category: Rescue Story', false)
        ->assertSee('• Summary: A look inside our weekly feeding routes across Iligan City.', false)
        ->assertSee('/storage/blog/feeding.jpg', false);
});
