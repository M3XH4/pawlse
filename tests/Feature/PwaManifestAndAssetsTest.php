<?php

test('pwa manifest and icon assets exist and are valid', function () {
    $expectedAssets = [
        'favicon.ico',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'manifest.json',
        'sw.js',
        'images/pwa/icon-192x192.png',
        'images/pwa/icon-512x512.png',
        'images/pwa/icon-maskable-192x192.png',
        'images/pwa/icon-maskable-512x512.png',
    ];

    foreach ($expectedAssets as $asset) {
        $path = public_path($asset);
        expect(file_exists($path))->toBeTrue("Missing asset: {$asset}");
        expect(filesize($path))->toBeGreaterThan(0, "Empty asset: {$asset}");
    }

    $manifest = json_decode(file_get_contents(public_path('manifest.json')), true, flags: JSON_THROW_ON_ERROR);

    expect($manifest)->toBeArray()
        ->and($manifest['short_name'])->toBe('PAWLSE')
        ->and($manifest['display'])->toBe('standalone')
        ->and($manifest['start_url'])->toBe('/')
        ->and($manifest['scope'])->toBe('/')
        ->and($manifest['background_color'])->toBe('#FFFDF8')
        ->and($manifest['theme_color'])->toBe('#1F2937')
        ->and($manifest['icons'])->toHaveCount(4);

    $icons = collect($manifest['icons']);

    expect($icons->contains(fn (array $icon) => $icon['sizes'] === '192x192' && $icon['purpose'] === 'any'))->toBeTrue()
        ->and($icons->contains(fn (array $icon) => $icon['sizes'] === '512x512' && $icon['purpose'] === 'any'))->toBeTrue()
        ->and($icons->contains(fn (array $icon) => $icon['sizes'] === '192x192' && $icon['purpose'] === 'maskable'))->toBeTrue()
        ->and($icons->contains(fn (array $icon) => $icon['sizes'] === '512x512' && $icon['purpose'] === 'maskable'))->toBeTrue();
});

test('home page renders pwa manifest, mobile capability meta tags, and standalone splash markup', function () {
    $response = $this->get('/');

    $response->assertSuccessful()
        ->assertSee('<link rel="manifest" href="/manifest.json">', false)
        ->assertSee('<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">', false)
        ->assertSee('<meta name="theme-color" content="#1F2937">', false)
        ->assertSee('<meta name="mobile-web-app-capable" content="yes">', false)
        ->assertSee('<meta name="apple-mobile-web-app-capable" content="yes">', false)
        ->assertSee('id="pawlse-splash"', false)
        ->assertSee("navigator.serviceWorker.register('/sw.js'", false);
});
