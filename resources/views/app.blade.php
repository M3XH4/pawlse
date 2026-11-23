<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'light') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        {{-- Inline script to apply theme immediately and prevent flashing (defaulting to light mode) --}}
        <script>
            (function() {
                try {
                    const migrated = localStorage.getItem('appearance_initialized_v2');
                    let stored = localStorage.getItem('appearance');

                    if (!migrated) {
                        if (!stored || stored === 'system') {
                            stored = 'light';
                            localStorage.setItem('appearance', 'light');
                            document.cookie = 'appearance=light;path=/;max-age=' + (365 * 24 * 60 * 60) + ';SameSite=Lax';
                        }
                        localStorage.setItem('appearance_initialized_v2', 'true');
                    }

                    const appearance = stored || '{{ $appearance ?? "light" }}';

                    if (appearance === 'dark') {
                        document.documentElement.classList.add('dark');
                        document.documentElement.style.colorScheme = 'dark';
                    } else if (appearance === 'system') {
                        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                        if (prefersDark) {
                            document.documentElement.classList.add('dark');
                            document.documentElement.style.colorScheme = 'dark';
                        } else {
                            document.documentElement.classList.remove('dark');
                            document.documentElement.style.colorScheme = 'light';
                        }
                    } else {
                        document.documentElement.classList.remove('dark');
                        document.documentElement.style.colorScheme = 'light';
                    }
                } catch (e) {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @php
            $hasSharedEvent = isset($sharedEvent) && $sharedEvent;
            $hasSharedMissingPet = isset($sharedMissingPet) && $sharedMissingPet;
            $hasSharedAdoptPet = isset($sharedAdoptPet) && $sharedAdoptPet;
            $hasSharedBlogPost = isset($sharedBlogPost) && $sharedBlogPost;

            if ($hasSharedEvent) {
                $ogDate = $sharedEvent->date ? ($sharedEvent->date instanceof \Carbon\CarbonInterface ? $sharedEvent->date->format('M d, Y') : (string) $sharedEvent->date) : 'Upcoming';
                $eventCat = $sharedEvent->category instanceof \BackedEnum ? $sharedEvent->category->value : ($sharedEvent->category ?? null);
                $eventMetaLines = array_filter([
                    '• Event: ' . $sharedEvent->title,
                    $eventCat ? '• Category: ' . ucfirst((string) $eventCat) : null,
                    '• Date: ' . $ogDate,
                    $sharedEvent->time ? '• Time: ' . $sharedEvent->time : null,
                    $sharedEvent->location ? '• Location: ' . $sharedEvent->location : null,
                    $sharedEvent->spots ? '• Spots: ' . $sharedEvent->spots : null,
                    $sharedEvent->desc ? '• Details: ' . \Illuminate\Support\Str::limit($sharedEvent->desc, 180) : null,
                ]);
                $ogTitle = $sharedEvent->title . ' - Pawlse Events';
                $ogDesc = implode("\n", $eventMetaLines);
                $ogImage = $sharedEvent->img ? (str_starts_with($sharedEvent->img, 'http') ? $sharedEvent->img : url($sharedEvent->img)) : url('/images/og-image.jpg');
                $ogHasCustomImage = (bool) $sharedEvent->img;
                $ogUrl = url('/events?event=' . $sharedEvent->id);
                $ogType = 'article';
            } elseif ($hasSharedMissingPet) {
                $petName = $sharedMissingPet->name ?: 'Missing Pet';
                $petSpeciesRaw = $sharedMissingPet->animal_type ?? $sharedMissingPet->species ?? 'Pet';
                $petSpecies = ucfirst($petSpeciesRaw instanceof \BackedEnum ? (string) $petSpeciesRaw->value : (string) $petSpeciesRaw);
                $petBreed = $sharedMissingPet->breed ? ' (' . $sharedMissingPet->breed . ')' : '';
                $petLastSeenDate = $sharedMissingPet->last_seen_date
                    ? ($sharedMissingPet->last_seen_date instanceof \Carbon\CarbonInterface ? $sharedMissingPet->last_seen_date->format('M d, Y') : (string) $sharedMissingPet->last_seen_date)
                    : '';

                $petTraits = array_filter([
                    $sharedMissingPet->gender ? ucfirst((string) ($sharedMissingPet->gender instanceof \BackedEnum ? $sharedMissingPet->gender->value : $sharedMissingPet->gender)) : null,
                    $sharedMissingPet->age_category ? ucfirst((string) ($sharedMissingPet->age_category instanceof \BackedEnum ? $sharedMissingPet->age_category->value : $sharedMissingPet->age_category)) : null,
                    $sharedMissingPet->size ? ucfirst((string) ($sharedMissingPet->size instanceof \BackedEnum ? $sharedMissingPet->size->value : $sharedMissingPet->size)) : null,
                    $sharedMissingPet->color ?: null,
                ]);

                $petReward = $sharedMissingPet->reward ? trim((string) $sharedMissingPet->reward) : null;
                if ($petReward !== null && $petReward !== '' && !str_starts_with($petReward, '₱')) {
                    $petReward = '₱' . $petReward;
                }

                $petContact = trim(implode(' ', array_filter([
                    $sharedMissingPet->contact_name ?: null,
                    $sharedMissingPet->contact_phone ? '(' . $sharedMissingPet->contact_phone . ')' : null,
                ])));

                $petMetaLines = array_filter([
                    '• Name: ' . $petName,
                    '• Species & Breed: ' . $petSpecies . $petBreed,
                    !empty($petTraits) ? '• Traits: ' . implode(' • ', $petTraits) : null,
                    $sharedMissingPet->location ? '• Last Seen: ' . $sharedMissingPet->location . ($petLastSeenDate ? ' (' . $petLastSeenDate . ')' : '') : null,
                    $petReward ? '💰 REWARD: ' . $petReward : null,
                    $sharedMissingPet->description ? '• Details: ' . \Illuminate\Support\Str::limit($sharedMissingPet->description, 180) : null,
                    $petContact !== '' ? '• Contact: ' . $petContact : null,
                ]);

                $ogTitle = '🚨 Missing ' . $petSpecies . ': ' . $petName . $petBreed . ' - Pawlse';
                $ogDesc = implode("\n", $petMetaLines);
                $petPhotoPath = $sharedMissingPet->photos->first()?->path;
                $ogImage = $petPhotoPath ? (str_starts_with($petPhotoPath, 'http') ? $petPhotoPath : url($petPhotoPath)) : url('/images/og-image.jpg');
                $ogHasCustomImage = (bool) $petPhotoPath;
                $ogUrl = url('/missing?pet=' . $sharedMissingPet->id);
                $ogType = 'article';
            } elseif ($hasSharedAdoptPet) {
                $adoptName = $sharedAdoptPet->name ?: 'Adoptable Pet';
                $adoptTypeRaw = $sharedAdoptPet->type instanceof \BackedEnum ? $sharedAdoptPet->type->value : ($sharedAdoptPet->type ?: 'Pet');
                $adoptType = ucfirst((string) $adoptTypeRaw);
                $adoptBreed = $sharedAdoptPet->breed ? ' (' . $sharedAdoptPet->breed . ')' : '';
                $adoptTraits = array_filter([
                    $sharedAdoptPet->gender ? ucfirst((string) ($sharedAdoptPet->gender instanceof \BackedEnum ? $sharedAdoptPet->gender->value : $sharedAdoptPet->gender)) : null,
                    $sharedAdoptPet->age ?: null,
                    $sharedAdoptPet->color ?: null,
                ]);
                $adoptStory = $sharedAdoptPet->rescue_story ?: $sharedAdoptPet->story;
                $adoptMetaLines = array_filter([
                    '• Name: ' . $adoptName,
                    '• Species & Breed: ' . $adoptType . $adoptBreed,
                    !empty($adoptTraits) ? '• Traits: ' . implode(' • ', $adoptTraits) : null,
                    '• Vaccinated: ' . ($sharedAdoptPet->vaccinated ? 'Yes' : 'Pending'),
                    $adoptStory ? '• Story: ' . \Illuminate\Support\Str::limit($adoptStory, 180) : null,
                ]);
                $adoptPhoto = $sharedAdoptPet->photo_url ?: ($sharedAdoptPet->all_photos[0] ?? null);
                $ogTitle = '🐾 Adopt ' . $adoptName . $adoptBreed . ' - Pawlse';
                $ogDesc = implode("\n", $adoptMetaLines);
                $ogImage = $adoptPhoto ? (str_starts_with($adoptPhoto, 'http') ? $adoptPhoto : url($adoptPhoto)) : url('/images/og-image.jpg');
                $ogHasCustomImage = (bool) $adoptPhoto;
                $ogUrl = url('/adopt/' . $sharedAdoptPet->id);
                $ogType = 'article';
            } elseif ($hasSharedBlogPost) {
                $blogCategory = \App\Models\BlogPost::CATEGORIES[$sharedBlogPost->category] ?? ucfirst((string) $sharedBlogPost->category);
                $blogDate = $sharedBlogPost->published_at
                    ? ($sharedBlogPost->published_at instanceof \Carbon\CarbonInterface ? $sharedBlogPost->published_at->format('M d, Y') : (string) $sharedBlogPost->published_at)
                    : '';
                $blogSummary = $sharedBlogPost->summary ?: trim(strip_tags((string) $sharedBlogPost->content));
                $blogMetaLines = array_filter([
                    '• Category: ' . $blogCategory,
                    $sharedBlogPost->author?->name ? '• Author: ' . $sharedBlogPost->author->name : null,
                    $blogDate ? '• Published: ' . $blogDate : null,
                    $blogSummary ? '• Summary: ' . \Illuminate\Support\Str::limit($blogSummary, 180) : null,
                ]);
                $blogPhoto = $sharedBlogPost->featured_image ?: $sharedBlogPost->shelterAnimal?->photo_url;
                $ogTitle = $sharedBlogPost->title . ' - Pawlse Blog';
                $ogDesc = implode("\n", $blogMetaLines);
                $ogImage = $blogPhoto ? (str_starts_with($blogPhoto, 'http') ? $blogPhoto : url($blogPhoto)) : url('/images/og-image.jpg');
                $ogHasCustomImage = (bool) $blogPhoto;
                $ogUrl = url('/blog/' . $sharedBlogPost->slug);
                $ogType = 'article';
            } else {
                $ogTitle = config('app.name', 'Pawlse') . ' - Animal Rescue & Care Platform';
                $ogDesc = 'Connecting strays to loving homes, animal rescues, and community volunteers in Iligan City.';
                $ogImage = url('/images/og-image.jpg');
                $ogHasCustomImage = false;
                $ogUrl = url()->current();
                $ogType = 'website';
            }
        @endphp
        <meta name="description" content="{{ $ogDesc }}">
        <meta property="og:site_name" content="{{ config('app.name', 'Pawlse') }}">
        <meta property="og:type" content="{{ $ogType }}">
        <meta property="og:locale" content="en_US">
        <meta property="og:title" content="{{ $ogTitle }}">
        <meta property="og:description" content="{{ $ogDesc }}">
        <meta property="og:image" content="{{ $ogImage }}">
        @if (str_starts_with($ogImage, 'https://'))
            <meta property="og:image:secure_url" content="{{ $ogImage }}">
        @endif
        @if (!$ogHasCustomImage)
            <meta property="og:image:type" content="image/jpeg">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="630">
        @endif
        <meta property="og:image:alt" content="{{ $ogTitle }}">
        <meta property="og:url" content="{{ $ogUrl }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $ogTitle }}">
        <meta name="twitter:description" content="{{ $ogDesc }}">
        <meta name="twitter:image" content="{{ $ogImage }}">

        @if (($page['component'] ?? '') === 'welcome')
            <link rel="preload" as="image" href="/images/hero-image.webp" type="image/webp" fetchpriority="high">
        @endif

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
