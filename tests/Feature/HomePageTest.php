<?php

use App\Enums\ShelterAnimalStatus;
use App\Models\ShelterAnimal;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the landing page and preloads the hero webp image', function () {
    $response = $this->get('/');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('welcome'))
        ->assertSee('/images/hero-image.webp', false);
});

it('prefers sibling webp assets for local storage pet photos on the home page', function () {
    Storage::fake('public');

    $publicStorageDir = public_path('storage/test_home_webp');
    if (! is_dir($publicStorageDir)) {
        mkdir($publicStorageDir, 0755, true);
    }

    $pngWithWebp = $publicStorageDir.'/with-webp.png';
    $webpSibling = $publicStorageDir.'/with-webp.webp';
    $pngWithoutWebp = $publicStorageDir.'/without-webp.png';

    file_put_contents($pngWithWebp, 'png');
    file_put_contents($webpSibling, 'webp');
    file_put_contents($pngWithoutWebp, 'png');

    try {
        ShelterAnimal::factory()->create([
            'name' => 'WebpPet',
            'status' => ShelterAnimalStatus::Available,
            'photo_url' => '/storage/test_home_webp/with-webp.png',
            'story' => 'Happy rescue story',
        ]);

        ShelterAnimal::factory()->create([
            'name' => 'PngPet',
            'status' => ShelterAnimalStatus::Available,
            'photo_url' => '/storage/test_home_webp/without-webp.png',
            'story' => 'Another rescue story',
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('welcome')
                ->where('pets', function ($pets) {
                    $byName = collect($pets)->keyBy('name');

                    return $byName['WebpPet']['img'] === '/storage/test_home_webp/with-webp.webp'
                        && $byName['PngPet']['img'] === '/storage/test_home_webp/without-webp.png';
                })
                ->where('stories', function ($stories) {
                    $byName = collect($stories)->keyBy('name');

                    return $byName['WebpPet']['image'] === '/storage/test_home_webp/with-webp.webp'
                        && $byName['PngPet']['image'] === '/storage/test_home_webp/without-webp.png';
                })
            );
    } finally {
        @unlink($pngWithWebp);
        @unlink($webpSibling);
        @unlink($pngWithoutWebp);
        @rmdir($publicStorageDir);
    }
});
