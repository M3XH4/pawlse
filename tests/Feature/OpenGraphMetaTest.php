<?php

test('home page includes valid open graph and twitter meta tags with an existing preview image', function () {
    expect(file_exists(public_path('images/og-image.jpg')))->toBeTrue();

    $response = $this->get('/');

    $response->assertSuccessful();
    $response->assertSee('<meta name="description" content="Connecting strays to loving homes, animal rescues, and community volunteers in Iligan City.">', false);
    $response->assertSee('<meta property="og:title" content="', false);
    $response->assertSee('<meta property="og:description" content="Connecting strays to loving homes, animal rescues, and community volunteers in Iligan City.">', false);
    $response->assertSee('<meta property="og:image" content="'.url('/images/og-image.jpg').'">', false);
    $response->assertSee('<meta property="og:image:width" content="1200">', false);
    $response->assertSee('<meta property="og:image:height" content="630">', false);
    $response->assertSee('<meta name="twitter:card" content="summary_large_image">', false);
    $response->assertSee('<meta name="twitter:image" content="'.url('/images/og-image.jpg').'">', false);
});
