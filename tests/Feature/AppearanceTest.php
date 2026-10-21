<?php

use Illuminate\Support\Facades\View;

test('it defaults to light mode appearance when no cookie is set', function () {
    $response = $this->get('/');

    $response->assertOk();
    expect(View::shared('appearance'))->toBe('light');
});

test('it respects explicit appearance cookie when provided', function () {
    $response = $this->withUnencryptedCookie('appearance', 'dark')->get('/');

    $response->assertOk();
    expect(View::shared('appearance'))->toBe('dark');
});
