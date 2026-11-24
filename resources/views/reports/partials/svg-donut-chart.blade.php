@php
    $segments = $donut['segments'] ?? [];
    $total = $donut['total'] ?? 0;
    $circumference = $donut['circumference'] ?? 226.19;
@endphp

<div class="donut-wrap">
    <svg width="110" height="110" viewBox="0 0 100 100" class="donut-svg" role="img" aria-label="{{ $title ?? 'Distribution Chart' }}">
        <circle cx="50" cy="50" r="36" fill="none" stroke="#E2E8F0" stroke-width="14" />
        @if ($total > 0)
            @foreach ($segments as $seg)
                <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="none"
                    stroke="{{ $seg['color'] }}"
                    stroke-width="14"
                    stroke-dasharray="{{ $seg['dash'] }} {{ $seg['gap'] }}"
                    stroke-dashoffset="{{ $seg['offset'] }}"
                    transform="rotate(-90 50 50)"
                />
            @endforeach
        @endif
        <text x="50" y="47" text-anchor="middle" font-size="14" font-weight="800" fill="#0F172A" font-family="Fredoka, Quicksand, sans-serif">
            {{ number_format((float) $total) }}
        </text>
        <text x="50" y="60" text-anchor="middle" font-size="7.5" font-weight="700" fill="#64748B" font-family="Quicksand, sans-serif">
            TOTAL
        </text>
    </svg>

    <div class="donut-legend">
        @if (count($segments) === 0)
            <div class="legend-empty">No records recorded for this period.</div>
        @else
            @foreach ($segments as $seg)
                <div class="legend-row">
                    <span class="legend-label">
                        <span class="legend-dot" style="background-color: {{ $seg['color'] }};"></span>
                        <span>{{ $seg['name'] }}</span>
                    </span>
                    <span class="legend-val">{{ number_format((float) $seg['value']) }} ({{ $seg['percent'] }}%)</span>
                </div>
            @endforeach
        @endif
    </div>
</div>
