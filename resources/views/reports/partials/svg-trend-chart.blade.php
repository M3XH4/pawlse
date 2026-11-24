@php
    $series = $series ?? [];
    $primaryLabel = $primaryLabel ?? 'Rescues';
    $secondaryLabel = $secondaryLabel ?? 'Adoptions';
    $primaryColor = $primaryColor ?? '#0D9488';
    $secondaryColor = $secondaryColor ?? '#F43F5E';

    $maxVal = 1;
    foreach ($series as $pt) {
        $maxVal = max($maxVal, (int) ($pt['primary'] ?? 0), (int) ($pt['secondary'] ?? 0));
    }

    $count = max(1, count($series));
    $svgWidth = 640;
    $svgHeight = 190;
    $padLeft = 34;
    $padRight = 14;
    $padTop = 20;
    $padBottom = 32;
    $plotWidth = $svgWidth - $padLeft - $padRight;
    $plotHeight = $svgHeight - $padTop - $padBottom;
    $groupWidth = $plotWidth / $count;
    $barWidth = max(6, min(16, ($groupWidth * 0.68) / 2));
@endphp

<div class="trend-chart-box">
    <div class="trend-legend">
        <span class="trend-legend-item">
            <span class="legend-dot" style="background-color: {{ $primaryColor }};"></span>
            {{ $primaryLabel }}
        </span>
        <span class="trend-legend-item">
            <span class="legend-dot" style="background-color: {{ $secondaryColor }};"></span>
            {{ $secondaryLabel }}
        </span>
    </div>

    @if (count($series) === 0)
        <div class="legend-empty" style="padding: 24px 0;">No timeline activity available for this period.</div>
    @else
        <svg viewBox="0 0 {{ $svgWidth }} {{ $svgHeight }}" class="trend-svg" role="img" aria-label="{{ $primaryLabel }} vs {{ $secondaryLabel }} Trend">
            @for ($grid = 0; $grid <= 4; $grid++)
                @php
                    $yPos = $padTop + ($plotHeight * $grid / 4);
                    $tickVal = (int) round($maxVal * (1 - $grid / 4));
                @endphp
                <line x1="{{ $padLeft }}" y1="{{ $yPos }}" x2="{{ $svgWidth - $padRight }}" y2="{{ $yPos }}" stroke="#E2E8F0" stroke-dasharray="3 3" stroke-width="1" />
                <text x="{{ $padLeft - 6 }}" y="{{ $yPos + 3 }}" text-anchor="end" font-size="8.5" fill="#64748B" font-weight="600">{{ $tickVal }}</text>
            @endfor

            @foreach ($series as $idx => $pt)
                @php
                    $pVal = (int) ($pt['primary'] ?? 0);
                    $sVal = (int) ($pt['secondary'] ?? 0);
                    $pHeight = $maxVal > 0 ? ($pVal / $maxVal) * $plotHeight : 0;
                    $sHeight = $maxVal > 0 ? ($sVal / $maxVal) * $plotHeight : 0;
                    $centerX = $padLeft + ($idx * $groupWidth) + ($groupWidth / 2);
                    $pX = $centerX - $barWidth - 1.5;
                    $sX = $centerX + 1.5;
                    $pY = $padTop + $plotHeight - $pHeight;
                    $sY = $padTop + $plotHeight - $sHeight;
                @endphp
                <rect x="{{ $pX }}" y="{{ $pY }}" width="{{ $barWidth }}" height="{{ max(1, $pHeight) }}" rx="2.5" fill="{{ $primaryColor }}" />
                @if ($pVal > 0)
                    <text x="{{ $pX + ($barWidth / 2) }}" y="{{ max(10, $pY - 3) }}" text-anchor="middle" font-size="7.5" fill="#0F172A" font-weight="700">{{ $pVal }}</text>
                @endif

                <rect x="{{ $sX }}" y="{{ $sY }}" width="{{ $barWidth }}" height="{{ max(1, $sHeight) }}" rx="2.5" fill="{{ $secondaryColor }}" />
                @if ($sVal > 0)
                    <text x="{{ $sX + ($barWidth / 2) }}" y="{{ max(10, $sY - 3) }}" text-anchor="middle" font-size="7.5" fill="#0F172A" font-weight="700">{{ $sVal }}</text>
                @endif

                <text x="{{ $centerX }}" y="{{ $svgHeight - 10 }}" text-anchor="middle" font-size="8" fill="#475569" font-weight="700">
                    {{ \Illuminate\Support\Str::limit((string) ($pt['label'] ?? ''), 8, '') }}
                </text>
            @endforeach
        </svg>
    @endif
</div>
