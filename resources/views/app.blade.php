<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
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
            $ogTitle = isset($sharedEvent) && $sharedEvent ? $sharedEvent->title . ' - Pawlse Events' : config('app.name', 'Pawlse') . ' - Animal Rescue & Care Platform';
            $ogDesc = isset($sharedEvent) && $sharedEvent ? ($sharedEvent->desc ?: 'Join us for ' . $sharedEvent->title . ' on ' . $sharedEvent->date . ' at ' . $sharedEvent->location) : 'Connecting strays to loving homes, animal rescues, and community volunteers in Iligan City.';
            $ogImage = isset($sharedEvent) && $sharedEvent && $sharedEvent->img ? (str_starts_with($sharedEvent->img, 'http') ? $sharedEvent->img : url($sharedEvent->img)) : url('/assets/paw-icon.png');
            $ogUrl = isset($sharedEvent) && $sharedEvent ? url('/events?event=' . $sharedEvent->id) : url()->current();
        @endphp
        <meta property="og:type" content="{{ isset($sharedEvent) && $sharedEvent ? 'article' : 'website' }}">
        <meta property="og:title" content="{{ $ogTitle }}">
        <meta property="og:description" content="{{ $ogDesc }}">
        <meta property="og:image" content="{{ $ogImage }}">
        <meta property="og:url" content="{{ $ogUrl }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $ogTitle }}">
        <meta name="twitter:description" content="{{ $ogDesc }}">
        <meta name="twitter:image" content="{{ $ogImage }}">

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
