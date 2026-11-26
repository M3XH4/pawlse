<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $resource->title }} — {{ $brand['app_name'] }} | Iligan Stray Feeders</title>
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
            font-size: 12px;
            line-height: 1.5;
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
            background: rgba(11, 35, 64, 0.96);
            backdrop-filter: blur(8px);
            color: #F8FAFC;
            border-bottom: 2px solid #F59E0B;
        }

        .toolbar-left {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
        }

        .toolbar-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 9999px;
            background: rgba(245, 158, 11, 0.2);
            border: 1px solid rgba(253, 230, 138, 0.45);
            color: #FDE68A;
            font-size: 10.5px;
            font-weight: 800;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            white-space: nowrap;
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
            background: #F59E0B;
            color: #0B2340;
            font-weight: 800;
        }

        .btn-accent {
            background: {{ $theme['accent_hex'] }};
            color: #FFFFFF;
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.12);
            color: #F8FAFC;
            border-color: rgba(255, 255, 255, 0.22);
        }

        /* Document Shell */
        .page-container {
            max-width: 860px;
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

        /* ISF Official Hero Header */
        .hero {
            background: linear-gradient(135deg, #0B2340 0%, #13345B 62%, #1B4970 100%);
            color: #FFFFFF;
            padding: 24px 28px 22px;
            border-radius: 18px 18px 0 0;
            border-top: 5px solid {{ $theme['accent_hex'] }};
            border-bottom: 4px solid #F59E0B;
        }

        .hero-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding-bottom: 16px;
            margin-bottom: 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.18);
        }

        .brand-lockup {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .logo-frame {
            width: 54px;
            height: 54px;
            border-radius: 9999px;
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
            overflow: hidden;
            flex-shrink: 0;
            background: #FFFFFF;
        }

        .logo-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .brand-name {
            font-family: 'Fredoka', sans-serif;
            font-size: 21px;
            font-weight: 700;
            letter-spacing: 0.03em;
            line-height: 1.1;
            margin: 0;
        }

        .brand-sub {
            font-size: 11px;
            font-weight: 700;
            color: #FDE68A;
            margin-top: 3px;
        }

        .hero-partner {
            display: flex;
            align-items: center;
            gap: 10px;
            text-align: right;
        }

        .doc-pill {
            display: inline-block;
            background: rgba(255, 255, 255, 0.14);
            border: 1px solid rgba(255, 255, 255, 0.28);
            padding: 4px 11px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #FDE68A;
        }

        .doc-ref {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            font-weight: 700;
            color: #E2E8F0;
            margin-top: 4px;
        }

        .badge-pill {
            display: inline-block;
            background: {{ $theme['soft_bg_hex'] }};
            color: {{ $theme['accent_dark_hex'] }};
            border: 1px solid {{ $theme['border_hex'] }};
            padding: 3px 10px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        .hero-title {
            font-family: 'Fredoka', sans-serif;
            font-size: 25px;
            font-weight: 700;
            margin: 0 0 5px;
            line-height: 1.18;
            color: #FFFFFF;
        }

        .hero-subtitle {
            margin: 0;
            font-size: 12.5px;
            font-weight: 600;
            color: #CBD5E1;
        }

        /* Metadata Strip */
        .meta-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            padding: 14px 28px;
            background: #F8FAFC;
            border-bottom: 1px solid #E2E8F0;
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

        /* Overview Callout */
        .overview-box {
            background: {{ $theme['soft_bg_hex'] }};
            border: 1px solid {{ $theme['border_hex'] }};
            border-left: 4px solid {{ $theme['accent_hex'] }};
            border-radius: 12px;
            padding: 14px 18px;
            margin-bottom: 20px;
            break-inside: avoid;
        }

        .overview-label {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: {{ $theme['accent_dark_hex'] }};
            margin-bottom: 4px;
        }

        .overview-text {
            margin: 0;
            font-size: 12.5px;
            font-weight: 600;
            color: #1E293B;
        }

        /* Guide Sections */
        .section {
            margin-top: 18px;
            break-inside: avoid;
        }

        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 2px solid {{ $theme['border_hex'] }};
        }

        .section-title {
            font-family: 'Fredoka', sans-serif;
            font-size: 15px;
            font-weight: 700;
            color: #0B2340;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .section-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 9999px;
            background: {{ $theme['accent_hex'] }};
            flex-shrink: 0;
        }

        .kv-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-bottom: 10px;
        }

        .kv-card {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            padding: 9px 12px;
        }

        .kv-label {
            font-size: 9.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #64748B;
        }

        .kv-val {
            font-size: 12px;
            font-weight: 700;
            color: #0F172A;
            margin-top: 2px;
        }

        .body-paragraph {
            margin: 0 0 8px;
            color: #334155;
            font-weight: 600;
        }

        .checklist {
            list-style: none;
            margin: 4px 0 0;
            padding: 0;
        }

        .checklist li {
            position: relative;
            padding: 6px 10px 6px 26px;
            margin-bottom: 6px;
            background: #FFFFFF;
            border: 1px solid #F1F5F9;
            border-radius: 10px;
            color: #1E293B;
            font-weight: 600;
        }

        .checklist li::before {
            content: '';
            position: absolute;
            left: 10px;
            top: 12px;
            width: 7px;
            height: 7px;
            border-radius: 2px;
            background: #F59E0B;
        }

        /* Emergency Vet Table */
        .vet-box {
            margin-top: 22px;
            border: 1px solid #CBD5E1;
            border-radius: 14px;
            overflow: hidden;
            break-inside: avoid;
        }

        .vet-box-head {
            background: #0B2340;
            color: #FFFFFF;
            padding: 10px 16px;
            font-family: 'Fredoka', sans-serif;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.02em;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .vet-box-sub {
            font-family: 'Quicksand', sans-serif;
            font-size: 10px;
            font-weight: 700;
            color: #FDE68A;
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }

        table.vet-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }

        table.vet-table th {
            text-align: left;
            padding: 8px 12px;
            background: #F8FAFC;
            color: #475569;
            font-size: 9.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #CBD5E1;
        }

        table.vet-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #E2E8F0;
            font-weight: 600;
            color: #0F172A;
            vertical-align: top;
        }

        table.vet-table tr:last-child td {
            border-bottom: none;
        }

        .phone-highlight {
            color: #0F766E;
            font-weight: 800;
            white-space: nowrap;
        }

        /* Disclaimer */
        .disclaimer {
            margin-top: 18px;
            padding: 12px 16px;
            border-radius: 12px;
            background: #FFFBEB;
            border: 1px solid #FDE68A;
            color: #92400E;
            font-size: 10.5px;
            font-weight: 600;
            line-height: 1.5;
            break-inside: avoid;
        }

        /* Official Footer Seal */
        .doc-footer {
            margin-top: 20px;
            padding: 14px 18px;
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
            object-fit: cover;
            border: 1.5px solid #F59E0B;
        }

        .footer-note {
            font-size: 10px;
            color: #475569;
            font-weight: 600;
            line-height: 1.45;
        }

        .footer-seal {
            text-align: right;
            font-size: 10px;
            color: #334155;
            font-weight: 700;
            flex-shrink: 0;
        }

        @media screen and (max-width: 720px) {
            .toolbar { padding: 10px 12px; }
            .toolbar-actions { width: 100%; flex-wrap: wrap; }
            .toolbar-actions .btn { flex: 1 1 auto; justify-content: center; }
            .page-container { margin: 10px 8px 24px; border-radius: 14px; }
            .hero { padding: 18px; border-radius: 14px 14px 0 0; }
            .hero-top { flex-direction: column; align-items: flex-start; }
            .hero-partner { width: 100%; justify-content: space-between; text-align: left; }
            .meta-grid { grid-template-columns: repeat(2, 1fr); padding: 12px 18px; }
            .doc-body { padding: 18px; }
            .kv-grid { grid-template-columns: 1fr; }
            .doc-footer { flex-direction: column; align-items: flex-start; }
            .footer-seal { text-align: left; }
        }

        @media print {
            html, body { background: #FFFFFF !important; }
            .no-print { display: none !important; }
            .page-container {
                max-width: 100%;
                margin: 0;
                border: none;
                border-radius: 0;
                box-shadow: none;
            }
            .hero { border-radius: 10px; }
            .meta-grid {
                margin-top: 10px;
                border-radius: 10px;
                border: 1px solid #E2E8F0;
            }
            .doc-body { padding: 14px 4px 0; }
        }
    </style>
</head>
<body>
    <!-- Non-Printable Screen Toolbar -->
    <div class="toolbar no-print">
        <div class="toolbar-left">
            <span class="toolbar-badge">ISF Resource Guide • A4 Preview</span>
            <span style="font-size: 13px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                {{ $resource->title }}
            </span>
        </div>
        <div class="toolbar-actions">
            <a href="{{ $downloadUrl }}" onclick="try{localStorage.setItem('pawlse_skip_splash_until',String(Date.now()+180000));sessionStorage.setItem('pawlse_splash_shown','1')}catch(e){}" class="btn btn-primary">Download PDF</a>
            <button type="button" onclick="try{localStorage.setItem('pawlse_skip_splash_until',String(Date.now()+180000));sessionStorage.setItem('pawlse_splash_shown','1')}catch(e){}; window.print()" class="btn btn-accent">Save as PDF / Print</button>
            <button type="button" onclick="try{localStorage.setItem('pawlse_skip_splash_until',String(Date.now()+180000));sessionStorage.setItem('pawlse_splash_shown','1')}catch(e){}; window.close(); if (!window.closed) { if (window.history.length > 1) { window.history.back(); } else { window.location.href = '{{ route('vet') }}'; } }" class="btn btn-secondary">Close</button>
        </div>
    </div>

    <div class="page-container">
        <!-- Official ISF Letterhead Hero -->
        <header class="hero">
            <div class="hero-top">
                <div class="brand-lockup">
                    <div class="logo-frame">
                        @if (! empty($brand['primary_logo']))
                            <img src="{{ $brand['primary_logo'] }}" alt="Iligan Stray Feeders Official Logo" />
                        @endif
                    </div>
                    <div>
                        <h1 class="brand-name">{{ $brand['app_name'] }} &bull; Iligan Stray Feeders</h1>
                        <div class="brand-sub">Feed Furr A Cause &mdash; Official Pet Care Resource Guide</div>
                    </div>
                </div>

                <div class="hero-partner">
                    <div>
                        <div class="doc-pill">Official ISF Template</div>
                        <div class="doc-ref">REF: {{ $documentRef }}</div>
                    </div>
                </div>
            </div>

            <span class="badge-pill">{{ $resource->badge ?: 'Community Resource' }}</span>
            <h2 class="hero-title">{{ $resource->title }}</h2>
            <p class="hero-subtitle">{{ $theme['subtitle'] }} &bull; Source: {{ $theme['source_label'] }}</p>
        </header>

        <!-- Resource Metadata Bar -->
        <div class="meta-grid">
            <div>
                <div class="meta-label">Category</div>
                <div class="meta-value">{{ $theme['category_label'] }}</div>
            </div>
            <div>
                <div class="meta-label">Classification</div>
                <div class="meta-value">{{ $resource->badge ?: 'Community Resource' }}</div>
            </div>
            <div>
                <div class="meta-label">Published By</div>
                <div class="meta-value">Iligan Stray Feeders (ISF)</div>
            </div>
            <div>
                <div class="meta-label">Issued / Updated</div>
                <div class="meta-value">{{ $generatedAt }}</div>
            </div>
        </div>

        <main class="doc-body">
            <!-- Overview Callout -->
            @if (! empty($resource->description))
                <div class="overview-box">
                    <div class="overview-label">Overview</div>
                    <p class="overview-text">{{ $resource->description }}</p>
                </div>
            @endif

            <!-- Parsed Structured Guide Sections -->
            @forelse ($sections as $section)
                <section class="section">
                    <div class="section-header">
                        <h3 class="section-title">
                            <span class="section-dot"></span>
                            <span>{{ $section['heading'] }}</span>
                        </h3>
                    </div>

                    @if (count($section['kv']) > 0)
                        <div class="kv-grid">
                            @foreach ($section['kv'] as $kv)
                                <div class="kv-card">
                                    <div class="kv-label">{{ $kv['label'] }}</div>
                                    <div class="kv-val">{{ $kv['value'] }}</div>
                                </div>
                            @endforeach
                        </div>
                    @endif

                    @foreach ($section['paragraphs'] as $paragraph)
                        <p class="body-paragraph">{{ $paragraph }}</p>
                    @endforeach

                    @if (count($section['bullets']) > 0)
                        <ul class="checklist">
                            @foreach ($section['bullets'] as $bullet)
                                <li>{{ $bullet }}</li>
                            @endforeach
                        </ul>
                    @endif
                </section>
            @empty
                <section class="section">
                    <div class="section-header">
                        <h3 class="section-title">
                            <span class="section-dot"></span>
                            <span>Resource Guidelines</span>
                        </h3>
                    </div>
                    <p class="body-paragraph">
                        This guide is maintained by Iligan Stray Feeders (ISF) through PAWLSE to help adopters, foster parents, and pet owners across Iligan City access reliable pet care guidance.
                    </p>
                </section>
            @endforelse

            <!-- Live Iligan City Veterinary Partners Reference Table -->
            <div class="vet-box">
                <div class="vet-box-head">
                    <span>Iligan City Veterinary Contacts &amp; ISF Support Desk</span>
                    <span class="vet-box-sub">Emergency &amp; Routine Care</span>
                </div>
                <table class="vet-table">
                    <thead>
                        <tr>
                            <th>Clinic / Partner</th>
                            <th>Location</th>
                            <th>Operating Hours</th>
                            <th>Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($clinics as $clinic)
                            <tr>
                                <td><strong>{{ $clinic['name'] }}</strong></td>
                                <td>{{ $clinic['location'] }}</td>
                                <td>{{ $clinic['hours'] }}</td>
                                <td class="phone-highlight">{{ $clinic['phone'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <!-- Transparency Disclaimer -->
            <div class="disclaimer">
                <strong>ISF Community Transparency Note:</strong> This resource guide is published by Iligan Stray Feeders (ISF) via {{ $brand['app_name'] }} for educational and community referral purposes. Listings marked <em>Community Resource</em> or <em>Informational Resource</em> are independent recommendations; please verify current rates, vaccination rules, and service schedules directly with providers.
            </div>

            <!-- Official ISF Footer Seal -->
            <footer class="doc-footer">
                <div class="footer-brand">
                    @if (! empty($brand['partner_logo']))
                        <img src="{{ $brand['partner_logo'] }}" alt="ISF Emblem" class="footer-logo" />
                    @endif
                    <div class="footer-note">
                        <strong>Iligan Stray Feeders (Feed Furr A Cause)</strong><br>
                        Purok 13, Kiwalan, Iligan City, 9200 Philippines<br>
                        {{ $brand['contact_email'] }} &bull; {{ $brand['contact_phone'] }}
                    </div>
                </div>
                <div class="footer-seal">
                    <div>Verified {{ $brand['app_name'] }} Resource</div>
                    <div style="color: #64748B; font-weight: 600;">{{ $documentRef }} &bull; &copy; {{ date('Y') }} ISF</div>
                </div>
            </footer>
        </main>
    </div>

    @if (! empty($autoprint))
        <script>
            window.addEventListener('load', function () {
                setTimeout(function () { window.print(); }, 350);
            });
        </script>
    @endif
</body>
</html>
