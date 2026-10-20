<?php

use App\Models\ShelterAnimal;
use Inertia\Testing\AssertableInertia as Assert;

test('search page renders successfully with empty query', function () {
    $response = $this->get(route('search'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('search')
        ->where('query', '')
        ->has('counts')
        ->has('results')
    );
});

test('search page returns matching results for query', function () {
    ShelterAnimal::factory()->create([
        'name' => 'Zeus The Wonder Dog',
        'status' => 'available',
    ]);

    $response = $this->get(route('search', ['q' => 'Zeus']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('search')
        ->where('query', 'Zeus')
        ->where('counts.pets', 1)
        ->has('results.pets.0', fn (Assert $item) => $item
            ->where('name', 'Zeus The Wonder Dog')
            ->etc()
        )
    );
});
