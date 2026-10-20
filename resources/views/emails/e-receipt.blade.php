@php
    $logoUrl = asset('images/logo.png');
    $appUrl = config('app.url', 'https://pawlse.org');
    $bannerTheme = $bannerTheme ?? 'green'; // 'green', 'orange', 'blue'
    $bannerGradient = match ($bannerTheme) {
        'orange' => 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
        'blue' => 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
        default => 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
    };
    $accentColor = match ($bannerTheme) {
        'orange' => '#f59e0b',
        'blue' => '#0284c7',
        default => '#16a34a',
    };
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PAWLSE Official E-Receipt - {{ $referenceNumber ?? 'Receipt' }}</title>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Quicksand:wght@500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; -webkit-font-smoothing: antialiased;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px -12px rgba(15, 23, 42, 0.12); border: 1px solid #e2e8f0;">
                    <!-- Grab-Inspired Hero Header Banner with Diagonal/Curved Visual Accent -->
                    <tr>
                        <td style="background: {{ $bannerGradient }}; padding: 28px 32px 32px 32px; color: #ffffff; position: relative;">
                            <!-- Top Row: Receipt Category & Brand Logo -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 18px;">
                                <tr>
                                    <td valign="middle">
                                        <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.22); color: #ffffff; font-size: 12px; font-weight: 800; padding: 5px 12px; border-radius: 9999px; letter-spacing: 0.04em; text-transform: uppercase;">
                                            {{ $receiptCategory ?? 'PAWLSE Official E-Receipt' }}
                                        </span>
                                    </td>
                                    <td align="right" valign="middle">
                                        <table role="presentation" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td valign="middle" style="padding-right: 8px;">
                                                    <span style="font-family: 'Fredoka', sans-serif; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: 0.03em;">
                                                        PAWLSE
                                                    </span>
                                                </td>
                                                <td valign="middle">
                                                    <img src="{{ $logoUrl }}" data-logo="{{ $logoUrl }}" alt="Iligan Stray Feeders Logo" width="38" height="38" style="display: block; width: 38px; height: 38px; border-radius: 9999px; object-fit: cover; border: 2px solid #ffffff;" />
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Hero Message & Emblem Row -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td valign="middle" style="padding-right: 16px;">
                                        <h1 style="margin: 0 0 10px 0; font-family: 'Fredoka', sans-serif; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.18;">
                                            {{ $heroTitle ?? 'Hope you know you saved a life today!' }}
                                        </h1>
                                        <div style="font-size: 12.5px; font-weight: 700; color: rgba(255, 255, 255, 0.92); line-height: 1.5;">
                                            Issued on {{ $issuedDate ?? now()->format('d M Y, g:i A') }}<br>
                                            Ref ID: <span style="font-family: 'Courier New', Courier, monospace; font-weight: 900; background-color: rgba(0, 0, 0, 0.16); padding: 2px 7px; border-radius: 6px;">{{ $referenceNumber ?? 'N/A' }}</span>
                                        </div>
                                    </td>
                                    <td width="88" align="right" valign="middle">
                                        <div style="width: 78px; height: 78px; border-radius: 9999px; background-color: #ffffff; padding: 4px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.18);">
                                            <img src="{{ $logoUrl }}" alt="Iligan Stray Feeders" width="70" height="70" style="display: block; width: 70px; height: 70px; border-radius: 9999px; object-fit: cover;" />
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Total Contributed / Status Highlight Bar -->
                    <tr>
                        <td style="padding: 26px 32px 0 32px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 3px solid {{ $accentColor }}; padding-bottom: 14px;">
                                <tr>
                                    <td valign="baseline">
                                        <span style="font-size: 15px; font-weight: 800; color: #1f2937;">
                                            {{ $highlightLabel ?? 'Total Contributed' }}
                                        </span>
                                    </td>
                                    <td align="right" valign="baseline">
                                        <span style="font-family: 'Fredoka', sans-serif; font-size: 30px; font-weight: 700; color: #1f2937;">
                                            {{ $highlightValue ?? 'CONFIRMED' }}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Organization Acknowledgment Row -->
                    <tr>
                        <td style="padding: 16px 32px 20px 32px;">
                            <p style="margin: 0 0 12px 0; font-size: 12.5px; font-weight: 700; color: #475569;">
                                Acknowledged by <span style="color: {{ $accentColor }}; font-weight: 800;">Iligan Stray Feeders (ISF Shelter)</span>
                            </p>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 12px 16px;">
                                <tr>
                                    <td width="46" valign="middle">
                                        <img src="{{ $logoUrl }}" alt="ISF Badge" width="40" height="40" style="display: block; width: 40px; height: 40px; border-radius: 9999px; object-fit: cover; border: 2px solid #f59e0b;" />
                                    </td>
                                    <td valign="middle" style="padding-left: 10px;">
                                        <div style="font-size: 12px; font-weight: 800; color: #f59e0b;">
                                            5.0 &#9733; &bull; Feed Furr A Cause
                                        </div>
                                        <div style="font-size: 11.5px; font-weight: 600; color: #64748b;">
                                            {{ $subtitle ?? 'Official Community Welfare E-Receipt' }}
                                        </div>
                                        <div style="font-size: 12px; font-weight: 800; color: #1f2937; margin-top: 1px;">
                                            {{ $statusBadgeText ?? 'Verified & Logged in Transparency System' }}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Breakdown Table -->
                    <tr>
                        <td style="padding: 6px 32px 20px 32px;">
                            <div style="font-family: 'Fredoka', sans-serif; font-size: 15px; font-weight: 700; color: #1f2937; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
                                Breakdown
                            </div>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                @foreach (($items ?? []) as $item)
                                    <tr>
                                        <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; font-weight: 600; color: #475569;">
                                            {{ $item['label'] }}
                                        </td>
                                        <td align="right" style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; font-weight: 800; color: #1f2937;">
                                            {{ $item['value'] }}
                                        </td>
                                    </tr>
                                @endforeach
                                <tr>
                                    <td style="padding: 14px 0 6px 0; font-size: 14px; font-weight: 800; color: #1f2937;">
                                        {{ $highlightLabel ?? 'Total Summary' }}
                                    </td>
                                    <td align="right" style="padding: 14px 0 6px 0; font-size: 15px; font-weight: 900; color: {{ $accentColor }};">
                                        {{ $highlightValue ?? 'CONFIRMED' }}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Two-Column Donor/Applicant & Channel Metadata -->
                    <tr>
                        <td style="padding: 0 32px 24px 32px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 16px; padding: 16px 18px; border: 1px solid #f1f5f9;">
                                <tr>
                                    <td width="50%" valign="top" style="padding-right: 12px;">
                                        <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">
                                            {{ $partyRoleLabel ?? 'Supporter / Recipient' }}
                                        </div>
                                        <div style="font-size: 13.5px; font-weight: 800; color: #1f2937; margin-top: 3px;">
                                            {{ $recipientName ?? 'Community Supporter' }}
                                        </div>
                                        @if (!empty($recipientEmail))
                                            <div style="font-size: 11.5px; font-weight: 600; color: #64748b; margin-top: 2px;">
                                                {{ $recipientEmail }}
                                            </div>
                                        @endif
                                        <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 12px;">
                                            Profile
                                        </div>
                                        <div style="font-size: 12px; font-weight: 800; color: #475569; margin-top: 2px; text-transform: uppercase;">
                                            {{ $privacyLabel ?? 'PUBLIC RECORD' }}
                                        </div>
                                    </td>
                                    <td width="50%" valign="top" style="padding-left: 12px; border-left: 1px solid #e2e8f0;">
                                        <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">
                                            {{ $channelHeading ?? 'Processed Via' }}
                                        </div>
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 4px;">
                                            <tr>
                                                <td valign="middle">
                                                    <span style="display: inline-block; background-color: #fffbeb; border: 1px solid #fde68a; color: #b45309; font-size: 10.5px; font-weight: 800; padding: 2px 7px; border-radius: 5px; text-transform: uppercase; margin-right: 6px;">
                                                        ISF
                                                    </span>
                                                    <span style="font-size: 13px; font-weight: 800; color: #1f2937;">
                                                        {{ $methodLabel ?? 'PAWLSE Portal' }}
                                                    </span>
                                                </td>
                                                <td align="right" valign="middle" style="font-size: 12.5px; font-weight: 800; color: #1f2937;">
                                                    {{ $highlightValue ?? 'OK' }}
                                                </td>
                                            </tr>
                                        </table>
                                        <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 12px;">
                                            Receipt Status
                                        </div>
                                        <div style="font-size: 12px; font-weight: 800; color: {{ $accentColor }}; margin-top: 2px; text-transform: uppercase;">
                                            {{ $statusLabel ?? 'COMPLETED & VERIFIED' }}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    @if (!empty($footerMessage))
                        <tr>
                            <td style="padding: 0 32px 22px 32px;">
                                <div style="background-color: #fffbeb; border: 1.5px dashed #fcd34d; border-radius: 16px; padding: 14px 18px; text-align: center; font-size: 12.5px; font-weight: 700; color: #92400e; line-height: 1.5;">
                                    {{ $footerMessage }}
                                </div>
                            </td>
                        </tr>
                    @endif

                    @if (!empty($actionUrl) && !empty($actionText))
                        <tr>
                            <td align="center" style="padding: 0 32px 24px 32px;">
                                <a href="{{ $actionUrl }}" style="display: inline-block; background-color: #f59e0b; color: #ffffff; font-family: 'Fredoka', sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 28px; border-radius: 14px; letter-spacing: 0.04em; text-transform: uppercase; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.25);">
                                    {{ $actionText }}
                                </a>
                            </td>
                        </tr>
                    @endif

                    <!-- Support Quick-Links Row (Grab Reference Style) -->
                    <tr>
                        <td style="padding: 16px 32px 22px 32px; border-top: 1px solid #f1f5f9;">
                            <div style="text-align: center; font-size: 11.5px; font-weight: 700; color: #64748b; margin-bottom: 14px;">
                                Got a question about your receipt? We've got your back.
                            </div>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="25%" align="center" style="border-right: 1px solid #e2e8f0;">
                                        <a href="{{ $appUrl }}/donate" style="text-decoration: none; color: #0284c7; font-size: 11.5px; font-weight: 800;">
                                            &#128203;<br>Audit Ledger
                                        </a>
                                    </td>
                                    <td width="25%" align="center" style="border-right: 1px solid #e2e8f0;">
                                        <a href="{{ $appUrl }}/adopt" style="text-decoration: none; color: #0284c7; font-size: 11.5px; font-weight: 800;">
                                            &#128062;<br>Meet Strays
                                        </a>
                                    </td>
                                    <td width="25%" align="center" style="border-right: 1px solid #e2e8f0;">
                                        <a href="{{ $appUrl }}/volunteer" style="text-decoration: none; color: #0284c7; font-size: 11.5px; font-weight: 800;">
                                            &#129309;<br>Volunteer
                                        </a>
                                    </td>
                                    <td width="25%" align="center">
                                        <a href="{{ $appUrl }}/about" style="text-decoration: none; color: #0284c7; font-size: 11.5px; font-weight: 800;">
                                            &#128172;<br>Get Support
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Dark Paw-Navy Footer (Grab Reference Dark Footer Style) -->
                    <tr>
                        <td style="background-color: #111827; padding: 28px 32px; color: #e2e8f0;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td valign="top">
                                        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
                                            <tr>
                                                <td valign="middle" style="padding-right: 10px;">
                                                    <img src="{{ $logoUrl }}" alt="ISF Logo" width="36" height="36" style="display: block; width: 36px; height: 36px; border-radius: 9999px; border: 1.5px solid #f59e0b;" />
                                                </td>
                                                <td valign="middle">
                                                    <div style="font-family: 'Fredoka', sans-serif; font-size: 18px; font-weight: 700; color: #f59e0b;">
                                                        PAWLSE
                                                    </div>
                                                    <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;">
                                                        Iligan Stray Feeders
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                        <div style="font-size: 11.5px; font-weight: 700; color: #cbd5e1; line-height: 1.55;">
                                            Iligan Stray Feeders Shelter<br>
                                            Zone 5, Barangay Tambo, Iligan City, 9200 Philippines<br>
                                            <span style="color: #94a3b8;">info@pawlse.org &bull; +63 912 345 6789</span>
                                        </div>
                                    </td>
                                    <td valign="top" align="right">
                                        <div style="font-size: 11px; font-weight: 800; color: #ffffff; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">
                                            Follow Our Mission
                                        </div>
                                        <table role="presentation" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-left: 6px;">
                                                    <span style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; border-radius: 9999px; background-color: #374151; color: #ffffff; font-size: 12px; font-weight: 800;">f</span>
                                                </td>
                                                <td style="padding-left: 6px;">
                                                    <span style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; border-radius: 9999px; background-color: #374151; color: #ffffff; font-size: 12px; font-weight: 800;">&#9829;</span>
                                                </td>
                                                <td style="padding-left: 6px;">
                                                    <span style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; border-radius: 9999px; background-color: #374151; color: #ffffff; font-size: 12px; font-weight: 800;">&#128062;</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <div style="border-top: 1px solid #1f2937; margin-top: 20px; padding-top: 16px; text-align: center; font-size: 11px; font-weight: 700; color: #64748b;">
                                &copy; {{ date('Y') }} PAWLSE &bull; Iligan Stray Feeders (Feed Furr A Cause). Computer-generated official e-receipt.
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
