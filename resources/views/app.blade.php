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

        {{-- Detect installed PWA standalone launch before first paint --}}
        <script>
            (function() {
                try {
                    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
                    const navEntry = window.performance && window.performance.getEntriesByType
                        ? window.performance.getEntriesByType('navigation')[0]
                        : null;
                    const isBackForward = navEntry && navEntry.type === 'back_forward';
                    const isSameOriginReferrer = Boolean(document.referrer && document.referrer.indexOf(window.location.origin) === 0);
                    const skipUntil = Number(localStorage.getItem('pawlse_skip_splash_until') || '0');
                    const isSkipActive = skipUntil > Date.now();
                    if (skipUntil && !isSkipActive) {
                        localStorage.removeItem('pawlse_skip_splash_until');
                    }

                    if (isStandalone && !sessionStorage.getItem('pawlse_splash_shown') && !isBackForward && !isSameOriginReferrer && !isSkipActive) {
                        document.documentElement.classList.add('pawlse-standalone-splash');
                        window.__pawlseSplashShownAt = Date.now();
                    } else if (isStandalone) {
                        sessionStorage.setItem('pawlse_splash_shown', '1');
                    }
                } catch (e) {}
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

            html.pawlse-standalone-splash,
            html.pawlse-standalone-splash.dark {
                background-color: #FFFDF8;
            }

            html.pawlse-standalone-splash body {
                overflow: hidden;
            }

            #pawlse-splash {
                display: none;
            }

            html.pawlse-standalone-splash #pawlse-splash {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                padding: max(2.5rem, env(safe-area-inset-top)) 1.5rem max(2.25rem, env(safe-area-inset-bottom));
                background:
                    radial-gradient(circle at 50% 28%, rgba(251, 191, 36, 0.20) 0%, rgba(255, 253, 248, 0) 58%),
                    radial-gradient(circle at 85% 85%, rgba(245, 158, 11, 0.12) 0%, rgba(255, 253, 248, 0) 48%),
                    linear-gradient(180deg, #FFFDF8 0%, #FFFBEB 55%, #FEF3C7 100%);
                color: #1F2937;
                font-family: 'Instrument Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;
                opacity: 1;
                transition: opacity 0.36s ease-out, transform 0.36s ease-out;
            }

            #pawlse-splash.is-hiding {
                opacity: 0;
                transform: scale(1.02);
                pointer-events: none;
            }

            .pawlse-splash-center {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                margin: auto 0;
                animation: pawlseSplashFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
            }

            .pawlse-splash-logo-wrap {
                position: relative;
                width: 156px;
                height: 156px;
                padding: 14px;
                border-radius: 36px;
                background: #FFFFFF;
                box-shadow:
                    0 20px 45px -15px rgba(245, 158, 11, 0.28),
                    0 8px 20px -8px rgba(31, 41, 55, 0.10),
                    0 0 0 1px rgba(245, 158, 11, 0.18);
                margin-bottom: 1.5rem;
            }

            .pawlse-splash-logo-wrap::after {
                content: '';
                position: absolute;
                inset: -8px;
                border-radius: 42px;
                border: 2px solid rgba(245, 158, 11, 0.22);
                animation: pawlsePulseRing 2.2s ease-in-out infinite;
                pointer-events: none;
            }

            .pawlse-splash-logo {
                width: 100%;
                height: 100%;
                object-fit: contain;
                display: block;
                border-radius: 24px;
            }

            .pawlse-splash-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.375rem;
                padding: 0.35rem 0.85rem;
                border-radius: 9999px;
                background: rgba(245, 158, 11, 0.12);
                border: 1px solid rgba(245, 158, 11, 0.28);
                color: #B45309;
                font-size: 0.6875rem;
                font-weight: 800;
                letter-spacing: 0.14em;
                text-transform: uppercase;
                margin-bottom: 0.625rem;
            }

            .pawlse-splash-title {
                margin: 0;
                font-size: 2rem;
                font-weight: 900;
                letter-spacing: -0.03em;
                line-height: 1.1;
                color: #1F2937;
            }

            .pawlse-splash-tagline {
                margin: 0.45rem 0 0;
                max-width: 18rem;
                font-size: 0.875rem;
                font-weight: 500;
                line-height: 1.45;
                color: #64748B;
            }

            .pawlse-splash-footer {
                width: 100%;
                max-width: 14rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.65rem;
            }

            .pawlse-splash-track {
                width: 100%;
                height: 4px;
                border-radius: 9999px;
                background: rgba(31, 41, 55, 0.08);
                overflow: hidden;
                position: relative;
            }

            .pawlse-splash-bar {
                position: absolute;
                inset: 0 auto 0 0;
                width: 45%;
                border-radius: 9999px;
                background: linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%);
                animation: pawlseLoadingBar 1.2s ease-in-out infinite;
            }

            .pawlse-splash-meta {
                font-size: 0.72rem;
                font-weight: 600;
                letter-spacing: 0.06em;
                color: #94A3B8;
                text-transform: uppercase;
            }

            @keyframes pawlseSplashFadeUp {
                from {
                    opacity: 0;
                    transform: translateY(10px) scale(0.97);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            @keyframes pawlsePulseRing {
                0%, 100% {
                    opacity: 0.45;
                    transform: scale(1);
                }
                50% {
                    opacity: 0.9;
                    transform: scale(1.03);
                }
            }

            @keyframes pawlseLoadingBar {
                0% {
                    transform: translateX(-100%);
                }
                100% {
                    transform: translateX(260%);
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .pawlse-splash-center,
                .pawlse-splash-logo-wrap::after,
                .pawlse-splash-bar {
                    animation: none;
                }
                .pawlse-splash-bar {
                    width: 100%;
                }
                #pawlse-splash {
                    transition: opacity 0.15s ease-out;
                }
            }
        </style>

        <link rel="icon" href="/favicon.ico?v=isf" sizes="any">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=isf">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=isf">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#1F2937">
        <meta name="application-name" content="PAWLSE">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="PAWLSE">

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
        <div id="pawlse-splash" role="status" aria-live="polite" aria-label="Loading PAWLSE">
            <div aria-hidden="true"></div>
            <div class="pawlse-splash-center">
                <div class="pawlse-splash-logo-wrap">
                    <img
                        src="/images/pwa/icon-512x512.png"
                        alt="PAWLSE"
                        class="pawlse-splash-logo"
                        width="128"
                        height="128"
                    >
                </div>
                <span class="pawlse-splash-badge">Iligan Stray Feeders</span>
                <h1 class="pawlse-splash-title">PAWLSE</h1>
                <p class="pawlse-splash-tagline">In Service to the Hungry and Weak</p>
            </div>
            <div class="pawlse-splash-footer">
                <div class="pawlse-splash-track" aria-hidden="true">
                    <div class="pawlse-splash-bar"></div>
                </div>
                <span class="pawlse-splash-meta">Iligan City &bull; Rescue &amp; Care Hub</span>
            </div>
        </div>

        <script>
            (function() {
                let dismissed = false;

                function performHide() {
                    if (dismissed) {
                        return;
                    }
                    dismissed = true;

                    try {
                        sessionStorage.setItem('pawlse_splash_shown', '1');
                    } catch (e) {}

                    const el = document.getElementById('pawlse-splash');
                    if (!el) {
                        document.documentElement.classList.remove('pawlse-standalone-splash');
                        return;
                    }

                    el.classList.add('is-hiding');
                    setTimeout(function() {
                        document.documentElement.classList.remove('pawlse-standalone-splash');
                        if (el.parentNode) {
                            el.parentNode.removeChild(el);
                        }
                    }, 360);
                }

                window.__pawlseHideSplash = function() {
                    if (!document.documentElement.classList.contains('pawlse-standalone-splash')) {
                        return;
                    }
                    const shownAt = window.__pawlseSplashShownAt || Date.now();
                    const remaining = Math.max(0, 950 - (Date.now() - shownAt));
                    setTimeout(performHide, remaining);
                };

                if (document.documentElement.classList.contains('pawlse-standalone-splash')) {
                    setTimeout(performHide, 3200);
                }

                function markSkipNextSplash() {
                    try {
                        localStorage.setItem('pawlse_skip_splash_until', String(Date.now() + 180000));
                        sessionStorage.setItem('pawlse_splash_shown', '1');
                    } catch (e) {}
                }

                if (typeof window.open === 'function') {
                    const origOpen = window.open;
                    window.open = function() {
                        markSkipNextSplash();
                        return origOpen.apply(window, arguments);
                    };
                }

                document.addEventListener('click', function(event) {
                    const anchor = event.target && event.target.closest
                        ? event.target.closest('a[target="_blank"], a[href*="/preview"], a[href*="/download"], a[href*="/pdf"]')
                        : null;
                    if (anchor) {
                        markSkipNextSplash();
                    }
                }, true);

                window.addEventListener('beforeprint', markSkipNextSplash);

                if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function() {});
                    });
                }
            })();
        </script>

        <x-inertia::app />
    </body>
</html>
