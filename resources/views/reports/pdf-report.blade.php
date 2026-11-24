@php
    $isSuperAdmin = ($roleScope ?? 'admin') === 'super-admin';
    $section = $section ?? 'all';
    $accent = $isSuperAdmin ? '#4F46E5' : '#0D9488';
    $accentSoft = $isSuperAdmin ? '#EEF2FF' : '#F0FDFA';
    $accentBorder = $isSuperAdmin ? '#C7D2FE' : '#99F6E4';
    $heroGradient = $isSuperAdmin
        ? 'linear-gradient(135deg, #312E81 0%, #4F46E5 55%, #7C3AED 100%)'
        : 'linear-gradient(135deg, #0B2340 0%, #0F766E 58%, #10B981 100%)';

    $showAll = $section === 'all';
    $showRescues = $showAll || $section === 'rescues' || ($isSuperAdmin && $section === 'operations');
    $showAdoptions = $showAll || $section === 'adoptions' || ($isSuperAdmin && $section === 'operations');
    $showDonations = $showAll || $section === 'donations' || ($isSuperAdmin && $section === 'financials');
    $showOperations = $showAll || $section === 'operations' || ($isSuperAdmin && $section === 'ecosystem');
    $showSecurity = $isSuperAdmin && ($showAll || $section === 'security');
    $showAi = $isSuperAdmin && ($showAll || $section === 'ai');
    $showEcosystem = $isSuperAdmin && ($showAll || $section === 'ecosystem');

    if ($isSuperAdmin) {
        $stats = $analytics['stats'];
        $deltas = $analytics['deltas'];
        $ecosystem = $analytics['ecosystem'];
        $governance = $analytics['governance'];
        $securityPosture = $analytics['security_posture'] ?? null;
        $infrastructure = $analytics['infrastructure'] ?? null;
        $platformEcosystem = $analytics['platform_ecosystem'] ?? null;
        $aiFeaturePerformance = $analytics['ai_feature_performance'] ?? [];
    } else {
        $summary = $analytics['summary'];
        $kpis = $analytics['kpis'];
        $ecosystem = [
            'shelterCensus' => $analytics['shelterCensus'],
            'fosterMetrics' => $analytics['fosterMetrics'],
            'volunteerImpact' => $analytics['volunteerImpact'],
            'communityMetrics' => $analytics['communityMetrics'],
            'inventorySustainability' => $analytics['inventorySustainability'],
            'topRescueLocations' => $analytics['topRescueLocations'],
        ];
    }

    $census = $ecosystem['shelterCensus'];
    $foster = $ecosystem['fosterMetrics'];
    $volunteer = $ecosystem['volunteerImpact'];
    $community = $ecosystem['communityMetrics'];
    $inventory = $ecosystem['inventorySustainability'];
    $sustainability = $inventory['sustainability'];
    $topLocations = $ecosystem['topRescueLocations'] ?? [];
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $brand['app_name'] }} — {{ $reportTitle }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Quicksand:wght@500;600;700;800&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm 13mm;
        }

        * {
            box-sizing: border-box;
        }

        html, body {
            margin: 0;
            padding: 0;
            background-color: #E2E8F0;
            color: #0F172A;
            font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 11.5px;
            line-height: 1.45;
            -webkit-font-smoothing: antialiased;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Screen Preview Action Toolbar */
        .toolbar {
            position: sticky;
            top: 0;
            z-index: 50;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 12px 24px;
            background: rgba(15, 23, 42, 0.94);
            backdrop-filter: blur(8px);
            color: #F8FAFC;
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .toolbar-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .toolbar-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 9999px;
            background: rgba(255, 255, 255, 0.12);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }

        .toolbar-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            border-radius: 10px;
            font-family: inherit;
            font-size: 12px;
            font-weight: 700;
            text-decoration: none;
            border: 1px solid transparent;
            cursor: pointer;
            transition: opacity 0.15s ease;
        }

        .btn:hover { opacity: 0.92; }

        .btn-primary {
            background: {{ $accent }};
            color: #FFFFFF;
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.12);
            color: #F8FAFC;
            border-color: rgba(255, 255, 255, 0.22);
        }

        /* Document Shell */
        .page-container {
            max-width: 900px;
            margin: 22px auto 36px;
            background: #FFFFFF;
            border-radius: 20px;
            overflow: visible;
            box-shadow: 0 24px 60px -15px rgba(15, 23, 42, 0.18);
            border: 1px solid #CBD5E1;
        }

        .doc-body {
            padding: 24px 28px 28px;
        }

        /* Executive Hero Header */
        .hero {
            background: {{ $heroGradient }};
            color: #FFFFFF;
            padding: 24px 28px;
            border-radius: 18px 18px 0 0;
        }

        .hero-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding-bottom: 16px;
            margin-bottom: 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .brand-lockup {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .logo-frame {
            width: 52px;
            height: 52px;
            border-radius: 9999px;
            background: transparent;
            padding: 0;
            border: none;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            overflow: hidden;
        }

        .logo-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 9999px;
            display: block;
            transform: scale(1.04);
        }

        .brand-name {
            font-family: 'Fredoka', sans-serif;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.03em;
            line-height: 1.1;
            margin: 0;
        }

        .brand-sub {
            font-size: 11px;
            font-weight: 700;
            opacity: 0.9;
            margin-top: 2px;
        }

        .hero-partner {
            display: flex;
            align-items: center;
            gap: 10px;
            text-align: right;
        }

        .report-pill {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.35);
            padding: 4px 11px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .report-ref {
            font-family: 'Courier New', Courier, monospace;
            font-size: 10.5px;
            font-weight: 700;
            opacity: 0.92;
            margin-top: 4px;
        }

        .hero-title {
            font-family: 'Fredoka', sans-serif;
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 6px;
            line-height: 1.18;
        }

        .hero-desc {
            margin: 0;
            font-size: 12px;
            font-weight: 600;
            opacity: 0.92;
            max-width: 680px;
        }

        /* Metadata Bar */
        .meta-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            padding: 14px 28px;
            background: #F8FAFC;
            border-bottom: 1px solid #E2E8F0;
        }

        .meta-item {
            min-width: 0;
        }

        .meta-label {
            font-size: 9.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #64748B;
        }

        .meta-value {
            font-size: 11.5px;
            font-weight: 700;
            color: #0F172A;
            margin-top: 2px;
            word-break: break-word;
        }

        /* Section Headings */
        .section {
            margin-top: 20px;
            break-inside: avoid;
        }

        .section-allow-break {
            margin-top: 20px;
        }

        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 2px solid {{ $accentBorder }};
        }

        .section-title {
            font-family: 'Fredoka', sans-serif;
            font-size: 15px;
            font-weight: 700;
            color: #0B2340;
            margin: 0;
        }

        .section-tag {
            font-size: 9.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: {{ $accent }};
            background: {{ $accentSoft }};
            padding: 3px 9px;
            border-radius: 9999px;
            border: 1px solid {{ $accentBorder }};
        }

        /* KPI Cards */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
        }

        .kpi-card {
            border: 1px solid #E2E8F0;
            border-radius: 14px;
            padding: 12px 14px;
            background: #FFFFFF;
            border-top: 3px solid {{ $accent }};
            break-inside: avoid;
        }

        .kpi-label {
            font-size: 9.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748B;
        }

        .kpi-value {
            font-family: 'Fredoka', sans-serif;
            font-size: 20px;
            font-weight: 700;
            color: #0F172A;
            margin: 4px 0 3px;
            line-height: 1.15;
        }

        .kpi-sub {
            font-size: 10.5px;
            font-weight: 600;
            color: #475569;
        }

        .pill {
            display: inline-block;
            padding: 2px 7px;
            border-radius: 9999px;
            font-size: 9.5px;
            font-weight: 800;
        }

        .pill-green { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
        .pill-amber { background: #FFFBEB; color: #B45309; border: 1px solid #FDE68A; }
        .pill-rose { background: #FFF1F2; color: #BE123C; border: 1px solid #FECDD3; }
        .pill-indigo { background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; }
        .pill-slate { background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1; }

        /* Grid Cards */
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }

        .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }

        .card {
            border: 1px solid #E2E8F0;
            border-radius: 14px;
            padding: 14px 16px;
            background: #FFFFFF;
            break-inside: avoid;
        }

        .card-title {
            font-family: 'Fredoka', sans-serif;
            font-size: 13px;
            font-weight: 700;
            color: #0B2340;
            margin: 0 0 3px;
        }

        .card-sub {
            font-size: 10.5px;
            color: #64748B;
            margin: 0 0 10px;
            font-weight: 600;
        }

        /* Metric List Rows */
        .stat-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 6px 0;
            border-bottom: 1px dashed #E2E8F0;
            font-size: 11px;
        }

        .stat-row:last-child { border-bottom: none; }
        .stat-key { color: #475569; font-weight: 600; }
        .stat-val { color: #0F172A; font-weight: 800; text-align: right; }

        /* Progress Bar */
        .progress-track {
            width: 100%;
            height: 8px;
            border-radius: 9999px;
            background: #E2E8F0;
            overflow: hidden;
            margin: 6px 0;
        }

        .progress-fill {
            height: 100%;
            border-radius: 9999px;
            background: {{ $accent }};
        }

        /* SVG Charts */
        .trend-chart-box { width: 100%; }
        .trend-legend {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 6px;
            font-size: 10.5px;
            font-weight: 700;
            color: #334155;
        }
        .trend-legend-item { display: inline-flex; align-items: center; gap: 5px; }
        .trend-svg { width: 100%; height: auto; display: block; }

        .donut-wrap {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .donut-svg { flex-shrink: 0; }
        .donut-legend { flex: 1; min-width: 0; }
        .legend-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            font-size: 10.5px;
            padding: 3px 0;
        }
        .legend-label {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-weight: 600;
            color: #334155;
        }
        .legend-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 9999px;
            flex-shrink: 0;
        }
        .legend-val {
            font-weight: 800;
            color: #0F172A;
            white-space: nowrap;
        }
        .legend-empty {
            font-size: 10.5px;
            color: #64748B;
            font-style: italic;
        }

        /* Tables (100% visible, no clipping) */
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
        }

        table.data-table th {
            text-align: left;
            padding: 7px 8px;
            background: #F8FAFC;
            color: #475569;
            font-size: 9.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1.5px solid #CBD5E1;
        }

        table.data-table td {
            padding: 7px 8px;
            border-bottom: 1px solid #E2E8F0;
            color: #0F172A;
            font-weight: 600;
            vertical-align: top;
            word-break: break-word;
            overflow-wrap: anywhere;
        }

        table.data-table tr {
            break-inside: avoid;
        }

        table.data-table tr:last-child td { border-bottom: none; }
        .text-right { text-align: right !important; }

        /* Footer & Official Verification Seal */
        .doc-footer {
            margin-top: 24px;
            padding: 16px 20px;
            border-radius: 14px;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            break-inside: avoid;
        }

        .footer-brand {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .footer-logo {
            width: 36px;
            height: 36px;
            border-radius: 9999px;
            border: none;
            object-fit: cover;
            background: transparent;
        }

        .footer-note {
            font-size: 10px;
            color: #475569;
            font-weight: 600;
            line-height: 1.4;
        }

        .footer-seal {
            text-align: right;
            font-size: 10px;
            color: #475569;
            font-weight: 700;
            flex-shrink: 0;
        }

        @media print {
            html, body {
                background: #FFFFFF !important;
            }
            .no-print {
                display: none !important;
            }
            .page-container {
                max-width: 100%;
                margin: 0;
                border: none;
                border-radius: 0;
                box-shadow: none;
            }
            .hero {
                border-radius: 12px;
            }
            .doc-body {
                padding: 14px 4px 0;
            }
            .meta-grid {
                padding: 10px 14px;
                border-radius: 10px;
                margin-top: 10px;
                border: 1px solid #E2E8F0;
            }
        }
    </style>
</head>
<body>
    <!-- Non-Printable Screen Toolbar -->
    <div class="toolbar no-print">
        <div class="toolbar-left">
            <span class="toolbar-badge">A4 Executive PDF Preview</span>
            <span style="font-size: 13px; font-weight: 700;">{{ $brand['app_name'] }} — {{ $reportTitle }}</span>
        </div>
        <div class="toolbar-actions">
            @if (! empty($csvUrl))
                <a href="{{ $csvUrl }}" class="btn btn-secondary">Download CSV</a>
            @endif
            <button type="button" onclick="window.print()" class="btn btn-primary">Save as PDF / Print</button>
            <button type="button" onclick="window.close()" class="btn btn-secondary">Close</button>
        </div>
    </div>

    <div class="page-container">
        <!-- Executive Hero Header with Dual Embedded Base64 Logos -->
        <header class="hero">
            <div class="hero-top">
                <div class="brand-lockup">
                    <div class="logo-frame">
                        @if (! empty($brand['primary_logo']))
                            <img src="{{ $brand['primary_logo'] }}" alt="{{ $brand['app_name'] }} Official Logo" />
                        @else
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="{{ $accent }}" aria-hidden="true">
                                <circle cx="11" cy="4" r="2" />
                                <circle cx="18" cy="8" r="2" />
                                <circle cx="20" cy="16" r="2" />
                                <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
                            </svg>
                        @endif
                    </div>
                    <div>
                        <h1 class="brand-name">{{ $brand['app_name'] }}</h1>
                        <div class="brand-sub">{{ $brand['organization_name'] }}</div>
                    </div>
                </div>

                <div class="hero-partner">
                    <div>
                        <div class="report-pill">{{ $isSuperAdmin ? 'Super-Admin Intelligence' : 'Admin Analytics' }}</div>
                        <div class="report-ref">REF: {{ $meta['report_id'] }}</div>
                    </div>
                    <div class="logo-frame">
                        @if (! empty($brand['partner_logo']))
                            <img src="{{ $brand['partner_logo'] }}" alt="Iligan Stray Feeders Emblem" />
                        @else
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="{{ $accent }}" aria-hidden="true">
                                <path d="M12 21s-7-4.35-9.33-8.36C.57 9.05 2.45 4.5 6.5 4.5c2.04 0 3.74 1.07 4.5 2.4.76-1.33 2.46-2.4 4.5-2.4 4.05 0 5.93 4.55 3.83 8.14C19 16.65 12 21 12 21z" />
                            </svg>
                        @endif
                    </div>
                </div>
            </div>

            <h2 class="hero-title">{{ $reportTitle }}</h2>
            <p class="hero-desc">{{ $reportSubtitle }}</p>
        </header>

        <!-- Report Metadata Strip -->
        <div class="meta-grid">
            <div class="meta-item">
                <div class="meta-label">Reporting Window</div>
                <div class="meta-value">{{ $meta['period_label'] }}</div>
                <div style="font-size: 10px; color: #64748B; font-weight: 600;">{{ $meta['date_range'] }}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Generated By</div>
                <div class="meta-value">{{ $meta['generated_by'] }}</div>
                <div style="font-size: 10px; color: #64748B; font-weight: 600;">{{ $meta['generated_role'] }}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Generated On</div>
                <div class="meta-value">{{ $meta['generated_at'] }}</div>
                <div style="font-size: 10px; color: #64748B; font-weight: 600;">Verified Platform Snapshot</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">{{ $isSuperAdmin ? 'System Vitality Score' : 'Care Sustainability' }}</div>
                <div class="meta-value">
                    @if ($isSuperAdmin)
                        {{ $stats['health_score'] }}/100
                        <span class="pill {{ $stats['health_score'] >= 85 ? 'pill-green' : ($stats['health_score'] >= 70 ? 'pill-amber' : 'pill-rose') }}">
                            {{ $stats['health_score'] >= 85 ? 'Optimal' : ($stats['health_score'] >= 70 ? 'Attention' : 'Critical') }}
                        </span>
                    @else
                        {{ $sustainability['est_days'] }} Days Runway
                        <span class="pill {{ $sustainability['urgency_status'] === 'STABLE' ? 'pill-green' : ($sustainability['urgency_status'] === 'NEEDS SUPPORT' ? 'pill-amber' : 'pill-rose') }}">
                            {{ $sustainability['urgency_status'] }}
                        </span>
                    @endif
                </div>
            </div>
        </div>

        <div class="doc-body">
            <!-- 1. Executive KPI Summary -->
            <section class="section">
                <div class="section-header">
                    <h3 class="section-title">1. Executive Performance Summary</h3>
                    <span class="section-tag">Key Metrics</span>
                </div>

                @if ($isSuperAdmin)
                    <div class="kpi-grid">
                        <div class="kpi-card">
                            <div class="kpi-label">Verified Donations</div>
                            <div class="kpi-value">₱{{ number_format((float) $stats['donations_amount'], 2) }}</div>
                            <div class="kpi-sub">
                                {{ $stats['donations_count'] }} gifts • Avg ₱{{ number_format((float) $stats['avg_donation_amount'], 0) }}
                                <span class="pill {{ $deltas['donations_amount'] >= 0 ? 'pill-green' : 'pill-rose' }}">
                                    {{ $deltas['donations_amount'] >= 0 ? '+' : '' }}{{ $deltas['donations_amount'] }}%
                                </span>
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-label">Rescue Operations</div>
                            <div class="kpi-value">{{ number_format($stats['rescue_reports']) }} Reports</div>
                            <div class="kpi-sub">
                                {{ $stats['rescue_resolution_rate'] }}% resolved
                                <span class="pill {{ $deltas['rescues'] >= 0 ? 'pill-indigo' : 'pill-slate' }}">
                                    {{ $deltas['rescues'] >= 0 ? '+' : '' }}{{ $deltas['rescues'] }}%
                                </span>
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-label">Users &amp; Adoptions</div>
                            <div class="kpi-value">{{ number_format($stats['users']) }} Users</div>
                            <div class="kpi-sub">
                                {{ $stats['adoptions'] }} apps ({{ $stats['adoption_approval_rate'] }}% approved)
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-label">Security &amp; AI Telemetry</div>
                            <div class="kpi-value">{{ $stats['ai_accuracy_rate'] }}% AI Acc.</div>
                            <div class="kpi-sub">
                                {{ $stats['suspicious_logins'] }} alerts • {{ $stats['login_success_rate'] }}% login OK
                            </div>
                        </div>
                    </div>
                @else
                    @php
                        $rescueRate = $summary['rescues']['total'] > 0
                            ? round(($summary['rescues']['resolved'] / $summary['rescues']['total']) * 100, 1)
                            : 0;
                        $adoptionRate = $summary['adoptions']['total'] > 0
                            ? round(($summary['adoptions']['approved'] / $summary['adoptions']['total']) * 100, 1)
                            : 0;
                        $avgDonation = $summary['donations']['total_cash_count'] > 0
                            ? round($summary['donations']['total_cash'] / $summary['donations']['total_cash_count'], 2)
                            : 0;
                    @endphp
                    <div class="kpi-grid">
                        <div class="kpi-card">
                            <div class="kpi-label">Rescue Resolution</div>
                            <div class="kpi-value">{{ $rescueRate }}%</div>
                            <div class="kpi-sub">
                                {{ $summary['rescues']['resolved'] }} of {{ $summary['rescues']['total'] }} resolved
                                ({{ $kpis['period_rescues'] }} in window)
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-label">Adoption Success</div>
                            <div class="kpi-value">{{ $adoptionRate }}%</div>
                            <div class="kpi-sub">
                                {{ $summary['adoptions']['approved'] }} of {{ $summary['adoptions']['total'] }} approved
                                ({{ $kpis['period_adoptions'] }} in window)
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-label">Verified Cash Raised</div>
                            <div class="kpi-value">₱{{ number_format((float) $summary['donations']['total_cash'], 2) }}</div>
                            <div class="kpi-sub">
                                Avg ₱{{ number_format($avgDonation, 0) }} • {{ $summary['donations']['total_inkind_count'] }} In-Kind
                            </div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-label">Volunteer Force</div>
                            <div class="kpi-value">{{ number_format($summary['volunteers']['total']) }} Active</div>
                            <div class="kpi-sub">
                                {{ number_format($volunteer['hours_logged'], 1) }} hrs • {{ $volunteer['strays_fed'] }} strays fed
                            </div>
                        </div>
                    </div>
                @endif
            </section>

            <!-- 2. Visual Analytics Trends & Distributions -->
            @if ($showAll || $showRescues || $showAdoptions)
                <section class="section">
                    <div class="section-header">
                        <h3 class="section-title">2. Visual Activity Trends &amp; Distributions</h3>
                        <span class="section-tag">Vector Charts</span>
                    </div>

                    <div class="card" style="margin-bottom: 12px;">
                        <h4 class="card-title">Rescues vs. Adoptions Volume Trend</h4>
                        <p class="card-sub">{{ $isSuperAdmin ? 'Activity intervals across the selected reporting window' : 'Monthly comparative operational volume for ' . now()->year }}</p>
                        @include('reports.partials.svg-trend-chart', [
                            'series' => $charts['trendSeries'] ?? [],
                            'primaryLabel' => 'Rescues & Reports',
                            'secondaryLabel' => 'Adoption Applications',
                            'primaryColor' => $isSuperAdmin ? '#4F46E5' : '#0D9488',
                            'secondaryColor' => '#F43F5E',
                        ])
                    </div>

                    <div class="grid-3">
                        @if ($isSuperAdmin)
                            <div class="card">
                                <h4 class="card-title">User Role Distribution</h4>
                                <p class="card-sub">Registered platform accounts</p>
                                @include('reports.partials.svg-donut-chart', [
                                    'title' => 'User Roles',
                                    'donut' => $charts['roleDonut'],
                                ])
                            </div>
                            <div class="card">
                                <h4 class="card-title">Payment Channels</h4>
                                <p class="card-sub">Verified transaction methods</p>
                                @include('reports.partials.svg-donut-chart', [
                                    'title' => 'Payment Channels',
                                    'donut' => $charts['paymentDonut'],
                                ])
                            </div>
                            <div class="card">
                                <h4 class="card-title">AI Validation Split</h4>
                                <p class="card-sub">Human-verified predictions</p>
                                @include('reports.partials.svg-donut-chart', [
                                    'title' => 'AI Validation',
                                    'donut' => $charts['aiDonut'],
                                ])
                            </div>
                        @else
                            <div class="card">
                                <h4 class="card-title">Rescue Species Split</h4>
                                <p class="card-sub">Reported animal classifications</p>
                                @include('reports.partials.svg-donut-chart', [
                                    'title' => 'Species Split',
                                    'donut' => $charts['animalDonut'],
                                ])
                            </div>
                            <div class="card">
                                <h4 class="card-title">Donation Channels</h4>
                                <p class="card-sub">Verified gift breakdown</p>
                                @include('reports.partials.svg-donut-chart', [
                                    'title' => 'Donation Channels',
                                    'donut' => $charts['donationDonut'],
                                ])
                            </div>
                            <div class="card">
                                <h4 class="card-title">Shelter Animal Census</h4>
                                <p class="card-sub">Current shelter population status</p>
                                @include('reports.partials.svg-donut-chart', [
                                    'title' => 'Shelter Census',
                                    'donut' => $charts['shelterDonut'],
                                ])
                            </div>
                        @endif
                    </div>
                </section>
            @endif

            <!-- 3. Shelter Census, Foster Care, Volunteer Impact & Sustainability -->
            @if ($showOperations || $showDonations)
                <section class="section">
                    <div class="section-header">
                        <h3 class="section-title">3. Shelter Operations, Foster Network &amp; Sustainability</h3>
                        <span class="section-tag">Deep Analytics</span>
                    </div>

                    <div class="grid-3">
                        <!-- Shelter Animal Census -->
                        <div class="card">
                            <h4 class="card-title">Shelter Animal Census</h4>
                            <p class="card-sub">{{ $census['total'] }} total animals registered</p>
                            <div class="stat-row"><span class="stat-key">Available for Adoption</span><span class="stat-val">{{ $census['available'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Pending Adoption</span><span class="stat-val">{{ $census['pending'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Successfully Adopted</span><span class="stat-val">{{ $census['adopted'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">In Foster Care</span><span class="stat-val">{{ $census['foster'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Treatment / Quarantine</span><span class="stat-val">{{ $census['treatment'] + $census['quarantine'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Vaccination Rate</span><span class="stat-val">{{ $census['vaccination_rate'] }}% ({{ $census['vaccinated_count'] }})</span></div>
                            <div class="stat-row"><span class="stat-key">Avg. Days to Adoption</span><span class="stat-val">{{ $census['avg_adoption_days'] }} days</span></div>
                        </div>

                        <!-- Foster & Volunteer Impact -->
                        <div class="card">
                            <h4 class="card-title">Foster &amp; Field Impact</h4>
                            <p class="card-sub">Period outreach &amp; volunteer output</p>
                            <div class="stat-row"><span class="stat-key">Active Foster Placements</span><span class="stat-val">{{ $foster['active_placements'] }} / {{ $foster['total_capacity'] }} cap</span></div>
                            <div class="progress-track">
                                <div class="progress-fill" style="width: {{ min(100, $foster['utilization_rate']) }}%;"></div>
                            </div>
                            <div class="stat-row"><span class="stat-key">Approved Foster Parents</span><span class="stat-val">{{ $foster['approved_parents'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Volunteer Hours Logged</span><span class="stat-val">{{ number_format($volunteer['hours_logged'], 1) }} hrs</span></div>
                            <div class="stat-row"><span class="stat-key">Feeding Routes Completed</span><span class="stat-val">{{ $volunteer['feeding_routes_completed'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Strays Fed / Food Packs</span><span class="stat-val">{{ $volunteer['strays_fed'] }} / {{ $volunteer['food_packs_distributed'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Partner Pickups / Certs</span><span class="stat-val">{{ $volunteer['partner_pickups_completed'] }} / {{ $volunteer['certificates_issued'] }}</span></div>
                        </div>

                        <!-- Care Sustainability & Community -->
                        <div class="card">
                            <h4 class="card-title">Care Sustainability &amp; Support</h4>
                            <p class="card-sub">Financial runway &amp; community queue</p>
                            <div class="stat-row"><span class="stat-key">Verified Care Funds</span><span class="stat-val">₱{{ number_format((float) $sustainability['verified_funds'], 2) }}</span></div>
                            <div class="stat-row"><span class="stat-key">Daily Burn Rate</span><span class="stat-val">₱{{ number_format((float) $sustainability['daily_cost'], 2) }}/day</span></div>
                            <div class="stat-row"><span class="stat-key">Estimated Runway</span><span class="stat-val">{{ $sustainability['est_days'] }} days ({{ $sustainability['urgency_status'] }})</span></div>
                            <div class="stat-row"><span class="stat-key">Low-Stock Inventory Alerts</span><span class="stat-val">{{ $inventory['low_stock_count'] }} of {{ $inventory['total_items'] }} items</span></div>
                            <div class="stat-row"><span class="stat-key">Approved / Pending Events</span><span class="stat-val">{{ $community['events_approved'] }} / {{ $community['events_pending'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Shelter Visits (Confirmed)</span><span class="stat-val">{{ $community['shelter_visits_confirmed'] }} ({{ $community['shelter_visits_pending'] }} pending)</span></div>
                            <div class="stat-row"><span class="stat-key">Help Desk Open / Avg SLA</span><span class="stat-val">{{ $community['help_desk_open'] }} open • {{ $community['help_desk_avg_resolution_hours'] }}h</span></div>
                        </div>
                    </div>
                </section>
            @endif

            <!-- 4. Super-Admin Security, AI & Governance Section -->
            @if ($isSuperAdmin && ($showSecurity || $showAi || $showEcosystem))
                <section class="section">
                    <div class="section-header">
                        <h3 class="section-title">4. Security Posture, AI Telemetry &amp; Infrastructure</h3>
                        <span class="section-tag">System Telemetry</span>
                    </div>

                    <div class="grid-2" style="margin-bottom: 12px;">
                        <div class="card">
                            <h4 class="card-title">Top Administrative Actors</h4>
                            <p class="card-sub">Highest recorded audit trail activity in window</p>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Administrator</th>
                                        <th>Role</th>
                                        <th class="text-right">Actions</th>
                                        <th class="text-right">Last Active</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse ($analytics['top_audit_actors'] as $actor)
                                        <tr>
                                            <td>
                                                <div>{{ $actor['name'] }}</div>
                                                <div style="font-size: 9.5px; color: #64748B;">{{ $actor['email'] }}</div>
                                            </td>
                                            <td>{{ $actor['role'] }}</td>
                                            <td class="text-right">{{ number_format($actor['actions_count']) }}</td>
                                            <td class="text-right">{{ $actor['last_action'] }}</td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="4" style="text-align: center; color: #64748B;">No audit events recorded for this period.</td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>

                        <div class="card">
                            <h4 class="card-title">Security Compliance, Backups &amp; Governance</h4>
                            <p class="card-sub">2FA adoption, webhook pipeline, and pending queues</p>
                            @if ($securityPosture)
                                <div class="stat-row"><span class="stat-key">Verified User Accounts</span><span class="stat-val">{{ $securityPosture['verified_users'] }} / {{ $securityPosture['total_users'] }} ({{ $securityPosture['email_verification_rate'] }}%)</span></div>
                                <div class="stat-row"><span class="stat-key">Staff 2FA Enforcement</span><span class="stat-val">{{ $securityPosture['staff_2fa_enabled'] }} / {{ $securityPosture['staff_total'] }} ({{ $securityPosture['staff_2fa_rate'] }}%)</span></div>
                            @endif
                            @if ($infrastructure)
                                <div class="stat-row"><span class="stat-key">Backup Storage (Completed / Failed)</span><span class="stat-val">{{ $infrastructure['backups_total_size_mb'] }} MB ({{ $infrastructure['backups_completed'] }} / {{ $infrastructure['backups_failed'] }})</span></div>
                                <div class="stat-row"><span class="stat-key">Payment Webhooks (Processed / Pending)</span><span class="stat-val">{{ $infrastructure['webhook_events_processed'] }} / {{ $infrastructure['webhook_events_pending'] }}</span></div>
                            @endif
                            @if ($platformEcosystem)
                                <div class="stat-row"><span class="stat-key">Active Partners / Resource Downloads</span><span class="stat-val">{{ $platformEcosystem['partners_active'] }} / {{ number_format($platformEcosystem['resources_total_downloads']) }}</span></div>
                            @endif
                            <div class="stat-row"><span class="stat-key">Pending Events / Stories / Escalated Tickets</span><span class="stat-val">{{ $governance['pending_events'] }} / {{ $governance['pending_blogs'] }} / {{ $governance['escalated_tickets'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Archive Backlog / Latest Backup</span><span class="stat-val">{{ $governance['archived_records_total'] }} • {{ $governance['latest_backup_at'] }}</span></div>
                        </div>
                    </div>

                    @if ($showAi && count($aiFeaturePerformance) > 0)
                        <div class="card" style="margin-bottom: 12px;">
                            <h4 class="card-title">AI Feature Performance Matrix</h4>
                            <p class="card-sub">Execution volume, average model confidence, and verified accuracy per pipeline</p>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>AI Feature</th>
                                        <th class="text-right">Predictions</th>
                                        <th class="text-right">Avg. Confidence</th>
                                        <th class="text-right">Verified Accuracy</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($aiFeaturePerformance as $feat)
                                        <tr>
                                            <td>{{ $feat['feature'] }}</td>
                                            <td class="text-right">{{ number_format($feat['total']) }}</td>
                                            <td class="text-right">{{ $feat['avg_confidence'] }}%</td>
                                            <td class="text-right">{{ $feat['accuracy_rate'] !== null ? $feat['accuracy_rate'].'%' : 'Pending' }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @endif

                    @if ($showSecurity && count($analytics['recent_security_events']) > 0)
                        <div class="card">
                            <h4 class="card-title">Recent Security Alerts &amp; Failed Logins</h4>
                            <p class="card-sub">Audited authentication anomalies within the selected window</p>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Target Account / Email</th>
                                        <th>IP Address</th>
                                        <th>Classification</th>
                                        <th class="text-right">Detected</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($analytics['recent_security_events'] as $evt)
                                        <tr>
                                            <td>{{ $evt['email'] }}</td>
                                            <td>{{ $evt['ip_address'] }}</td>
                                            <td>
                                                <span class="pill {{ $evt['is_suspicious'] ? 'pill-rose' : 'pill-amber' }}">
                                                    {{ $evt['is_suspicious'] ? 'Suspicious' : ucfirst($evt['status']) }}
                                                </span>
                                            </td>
                                            <td class="text-right">{{ $evt['time'] }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @endif
                </section>
            @endif

            <!-- 4. Admin-Scope Module Deep-Dive -->
            @if (! $isSuperAdmin && ! empty($analytics['adminInsights']))
                @php
                    $insights = $analytics['adminInsights'];
                    $animalCare = $insights['animalCare'];
                    $rescueFunnel = $insights['rescueFunnel'];
                    $adoptionPipeline = $insights['adoptionPipeline'];
                    $fosterOps = $insights['fosterVolunteerOps'];
                    $support = $insights['donationsAndSupport'];
                @endphp
                <section class="section">
                    <div class="section-header">
                        <h3 class="section-title">4. Admin Operational Modules Breakdown</h3>
                        <span class="section-tag">Admin Scope</span>
                    </div>

                    <div class="grid-3">
                        <div class="card">
                            <h4 class="card-title">Animal Medical &amp; Wishlist Care</h4>
                            <p class="card-sub">Master records health &amp; animal needs</p>
                            <div class="stat-row"><span class="stat-key">Medical Records (Period / Total)</span><span class="stat-val">{{ $animalCare['medical_records_period'] }} / {{ $animalCare['medical_records_total'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Active Ongoing Treatments</span><span class="stat-val">{{ $animalCare['active_treatments'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Upcoming Due Medical (14d)</span><span class="stat-val">{{ $animalCare['upcoming_due_medical'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Open Animal Wishlist Needs</span><span class="stat-val">{{ $animalCare['open_wishlist_needs'] }} ({{ $animalCare['urgent_wishlist_needs'] }} urgent)</span></div>
                            <div class="stat-row"><span class="stat-key">Fulfilled Wishlist Needs</span><span class="stat-val">{{ $animalCare['fulfilled_wishlist_needs'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Expiring Inventory Batches (30d)</span><span class="stat-val">{{ $support['expiring_batches_30d'] }} ({{ $support['expired_batches_with_stock'] }} expired)</span></div>
                        </div>

                        <div class="card">
                            <h4 class="card-title">Rescue Funnel &amp; Adoption Pipeline</h4>
                            <p class="card-sub">AI validation, visits, rehoming &amp; follow-ups</p>
                            <div class="stat-row"><span class="stat-key">AI Validation Queue (Pending)</span><span class="stat-val">{{ $rescueFunnel['ai_validation_pending'] }} ({{ $rescueFunnel['ai_validation_approved'] }} approved)</span></div>
                            <div class="stat-row"><span class="stat-key">Shelter Visits (Pending / Confirmed)</span><span class="stat-val">{{ $adoptionPipeline['visits_pending'] }} / {{ $adoptionPipeline['visits_confirmed'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Confirmed Visitors in Period</span><span class="stat-val">{{ $adoptionPipeline['visits_total_visitors'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Rehoming (Pending / Intaken)</span><span class="stat-val">{{ $adoptionPipeline['rehoming_pending'] }} / {{ $adoptionPipeline['rehoming_intaken'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Post-Adoption Follow-Ups</span><span class="stat-val">{{ $adoptionPipeline['follow_ups_total'] }} ({{ $adoptionPipeline['follow_ups_due_soon'] }} due 14d)</span></div>
                            <div class="stat-row"><span class="stat-key">Donation Reviews / Edit Req.</span><span class="stat-val">{{ $support['pending_donation_reviews'] }} / {{ $support['pending_amount_edit_requests'] }}</span></div>
                        </div>

                        <div class="card">
                            <h4 class="card-title">Foster Logs, Pickups &amp; Community</h4>
                            <p class="card-sub">Field logistics, blogs &amp; help desk queue</p>
                            <div class="stat-row"><span class="stat-key">Foster Care Updates (Period)</span><span class="stat-val">{{ $fosterOps['foster_updates_period'] }} ({{ $fosterOps['foster_updates_unacknowledged'] }} unacked)</span></div>
                            <div class="stat-row"><span class="stat-key">Partner Food Pickups (Done / Pending)</span><span class="stat-val">{{ $fosterOps['pickups_completed_period'] }} / {{ $fosterOps['pickups_pending'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Field Injuries (Open / Confirmed)</span><span class="stat-val">{{ $fosterOps['injuries_open'] }} / {{ $fosterOps['injuries_confirmed_period'] }}</span></div>
                            <div class="stat-row"><span class="stat-key">Event Registrations (Period)</span><span class="stat-val">{{ $support['event_registrations_period'] }} ({{ $support['events_upcoming_spots'] }} open spots)</span></div>
                            <div class="stat-row"><span class="stat-key">Published Blogs (Views / Shares)</span><span class="stat-val">{{ $support['blogs_published'] }} ({{ number_format($support['blogs_total_views']) }} / {{ number_format($support['blogs_total_shares']) }})</span></div>
                            <div class="stat-row"><span class="stat-key">Total Inventory Units On Hand</span><span class="stat-val">{{ number_format($support['total_inventory_units']) }}</span></div>
                        </div>
                    </div>
                </section>
            @endif

            <!-- 5. Top Rescue Zones, Low-Stock Alerts & Top Volunteers -->
            <section class="section">
                <div class="section-header">
                    <h3 class="section-title">5. Field Hotspots, Contributors &amp; Supply Alerts</h3>
                    <span class="section-tag">Actionable Insights</span>
                </div>

                <div class="grid-2">
                    <div class="card">
                        <h4 class="card-title">Top Rescue Hotspots</h4>
                        <p class="card-sub">Highest incident locations in selected period</p>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Location / Zone</th>
                                    <th class="text-right">Reports</th>
                                    <th class="text-right">Resolved</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($topLocations as $loc)
                                    <tr>
                                        <td>{{ $loc['location'] }}</td>
                                        <td class="text-right">{{ $loc['total'] }}</td>
                                        <td class="text-right">{{ $loc['resolved'] }} ({{ $loc['resolution_rate'] }}%)</td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="3" style="text-align: center; color: #64748B;">No location data recorded in period.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <div class="card">
                        <h4 class="card-title">Low-Stock Inventory Watchlist</h4>
                        <p class="card-sub">Supplies at or below minimum threshold</p>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Category</th>
                                    <th class="text-right">Stock / Min</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($inventory['low_stock_items'] as $item)
                                    <tr>
                                        <td>{{ $item['name'] }}</td>
                                        <td>{{ $item['category'] }}</td>
                                        <td class="text-right">
                                            <span class="pill pill-rose">{{ $item['quantity'] }} / {{ $item['min_threshold'] }} {{ $item['unit'] }}</span>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="3" style="text-align: center; color: #047857;">All inventory items are adequately stocked.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- 6. Detailed Activity Logs (Rescues, Adoptions, Donations) -->
            <section class="section-allow-break">
                <div class="section-header">
                    <h3 class="section-title">6. Detailed Transaction &amp; Case Logs</h3>
                    <span class="section-tag">Latest Records in Period</span>
                </div>

                @if ($showRescues)
                    <div class="card" style="margin-bottom: 12px;">
                        <h4 class="card-title">Recent Rescue &amp; Incident Reports</h4>
                        <p class="card-sub">Latest submitted cases within {{ $meta['date_range'] }}</p>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Type</th>
                                    <th>Animal / Breed</th>
                                    <th>Location</th>
                                    <th>Urgency</th>
                                    <th>Status</th>
                                    <th class="text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($tables['rescues'] as $row)
                                    <tr>
                                        <td>#{{ $row['id'] }}</td>
                                        <td>{{ $row['type'] }}</td>
                                        <td>{{ $row['animal'] }}</td>
                                        <td>{{ $row['location'] }}</td>
                                        <td>{{ $row['urgency'] }}</td>
                                        <td>{{ $row['status'] }}</td>
                                        <td class="text-right">{{ $row['date'] }}</td>
                                    </tr>
                                @empty
                                    <tr><td colspan="7" style="text-align: center; color: #64748B;">No rescue reports recorded in this window.</td></tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                @endif

                @if ($showAdoptions)
                    <div class="card" style="margin-bottom: 12px;">
                        <h4 class="card-title">Recent Adoption Applications</h4>
                        <p class="card-sub">Latest applicant submissions within {{ $meta['date_range'] }}</p>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Applicant</th>
                                    <th>Target Pet</th>
                                    <th>Preference</th>
                                    <th>Status</th>
                                    <th class="text-right">Applied</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($tables['adoptions'] as $row)
                                    <tr>
                                        <td>#{{ $row['id'] }}</td>
                                        <td>{{ $row['applicant'] }}</td>
                                        <td>{{ $row['pet'] }}</td>
                                        <td>{{ $row['preference'] }}</td>
                                        <td>{{ $row['status'] }}</td>
                                        <td class="text-right">{{ $row['date'] }}</td>
                                    </tr>
                                @empty
                                    <tr><td colspan="6" style="text-align: center; color: #64748B;">No adoption applications recorded in this window.</td></tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                @endif

                @if ($showDonations)
                    <div class="card">
                        <h4 class="card-title">Recent Verified Donations</h4>
                        <p class="card-sub">Audited monetary and in-kind contributions within {{ $meta['date_range'] }}</p>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Reference</th>
                                    <th>Donor</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th class="text-right">Amount (PHP)</th>
                                    <th class="text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($tables['donations'] as $row)
                                    <tr>
                                        <td style="font-family: 'Courier New', monospace;">{{ $row['ref'] }}</td>
                                        <td>{{ $row['donor'] }}</td>
                                        <td>{{ $row['type'] }}</td>
                                        <td>{{ $row['status'] }}</td>
                                        <td class="text-right">{{ $row['amount'] > 0 ? '₱'.number_format($row['amount'], 2) : 'In-Kind' }}</td>
                                        <td class="text-right">{{ $row['date'] }}</td>
                                    </tr>
                                @empty
                                    <tr><td colspan="6" style="text-align: center; color: #64748B;">No verified donations recorded in this window.</td></tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                @endif
            </section>

            <!-- Official Verification Footer -->
            <footer class="doc-footer">
                <div class="footer-brand">
                    @if (! empty($brand['primary_logo']))
                        <img src="{{ $brand['primary_logo'] }}" alt="{{ $brand['app_name'] }} Emblem" class="footer-logo" />
                    @endif
                    <div class="footer-note">
                        <strong>{{ $brand['app_name'] }} — {{ $brand['organization_name'] }}</strong><br>
                        Contact: {{ $brand['contact_email'] }} • {{ $brand['contact_phone'] }}<br>
                        Confidential operational &amp; donor telemetry. Handle in compliance with PAWLSE data privacy policies.
                    </div>
                </div>
                <div class="footer-seal">
                    Document ID: {{ $meta['report_id'] }}<br>
                    Authenticated Export • Page Format A4
                </div>
            </footer>
        </div>
    </div>

    @if (! empty($autoprint))
        <script>
            (function () {
                async function triggerPrint() {
                    try {
                        if (document.fonts && document.fonts.ready) {
                            await document.fonts.ready;
                        }
                        const imgs = Array.from(document.querySelectorAll('img'));
                        await Promise.all(
                            imgs.map((img) =>
                                img.complete
                                    ? Promise.resolve()
                                    : new Promise((resolve) => {
                                          img.addEventListener('load', resolve, { once: true });
                                          img.addEventListener('error', resolve, { once: true });
                                      }),
                            ),
                        );
                    } catch (e) {
                        // Proceed to print even if font readiness throws
                    }
                    setTimeout(function () {
                        window.print();
                    }, 220);
                }

                if (document.readyState === 'complete') {
                    triggerPrint();
                } else {
                    window.addEventListener('load', triggerPrint, { once: true });
                }
            })();
        </script>
    @endif
</body>
</html>
