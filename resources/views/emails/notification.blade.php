@php
    $logoUrl = asset('images/logo.png');
    $appUrl = config('app.url', 'https://pawlse.org');
    $headerBg = match ($level ?? 'primary') {
        'success' => 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
        'error' => 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
        default => 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    };
    $buttonColor = match ($level ?? 'primary') {
        'success' => '#16a34a',
        'error' => '#e11d48',
        default => '#f59e0b',
    };
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? config('app.name', 'PAWLSE') }}</title>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Quicksand:wght@500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; -webkit-font-smoothing: antialiased;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 36px 14px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 26px; overflow: hidden; box-shadow: 0 20px 45px -12px rgba(15, 23, 42, 0.1); border: 1px solid #e2e8f0;">
                    <!-- Solid Branded Header Bar (Angkas Reference Style) -->
                    <tr>
                        <td align="center" style="background: {{ $headerBg }}; padding: 24px 32px;">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td valign="middle" style="padding-right: 12px;">
                                        <img src="{{ $logoUrl }}" data-logo="{{ $logoUrl }}" alt="Iligan Stray Feeders Logo" width="44" height="44" style="display: block; width: 44px; height: 44px; border-radius: 9999px; object-fit: cover; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);" />
                                    </td>
                                    <td valign="middle" align="left">
                                        <div style="font-family: 'Fredoka', sans-serif; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.05em; line-height: 1.05;">
                                            PAWLSE
                                        </div>
                                        <div style="font-size: 10.5px; font-weight: 800; color: rgba(255, 255, 255, 0.92); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px;">
                                            Iligan Stray Feeders
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Centered Emblem Illustration & Friendly Greeting (Angkas Reference Style) -->
                    <tr>
                        <td align="center" style="padding: 36px 36px 12px 36px;">
                            <div style="display: inline-block; padding: 8px; border-radius: 9999px; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 2px dashed #fcd34d; margin-bottom: 14px;">
                                <img src="{{ $logoUrl }}" alt="Iligan Stray Feeders Emblem" width="88" height="88" style="display: block; width: 88px; height: 88px; border-radius: 9999px; object-fit: cover; border: 3px solid #ffffff; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.2);" />
                            </div>

                            @if (!empty($categoryBadge))
                                <div style="margin-bottom: 10px;">
                                    <span style="display: inline-block; background-color: #fffbeb; border: 1px solid #fde68a; color: #d97706; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.06em;">
                                        {{ $categoryBadge }}
                                    </span>
                                </div>
                            @endif

                            <h1 style="margin: 0 0 8px 0; font-family: 'Fredoka', sans-serif; font-size: 26px; font-weight: 700; color: #1f2937; line-height: 1.25;">
                                @if (!empty($greeting))
                                    {{ $greeting }}
                                @else
                                    Hello there!
                                @endif
                            </h1>

                            @if (!empty($headline))
                                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #64748b;">
                                    {{ $headline }}
                                </p>
                            @endif
                        </td>
                    </tr>

                    <!-- Body Lines & Details -->
                    <tr>
                        <td style="padding: 12px 36px 28px 36px;">
                            @foreach (($introLines ?? []) as $line)
                                <div style="margin: 0 0 14px 0; font-size: 14.5px; font-weight: 600; color: #334155; line-height: 1.65;">
                                    {!! \Illuminate\Support\Str::markdown((string) $line) !!}
                                </div>
                            @endforeach

                            @if (!empty($summaryItems) && is_array($summaryItems))
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 18px; padding: 16px 20px; margin: 18px 0;">
                                    @foreach ($summaryItems as $sItem)
                                        <tr>
                                            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 12.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">
                                                {{ $sItem['label'] }}
                                            </td>
                                            <td align="right" style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; font-weight: 800; color: #1f2937;">
                                                {{ $sItem['value'] }}
                                            </td>
                                        </tr>
                                    @endforeach
                                </table>
                            @endif

                            @isset($actionText)
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 26px 0;">
                                    <tr>
                                        <td align="center">
                                            <a href="{{ $actionUrl }}" target="_blank" rel="noopener" style="display: inline-block; background-color: {{ $buttonColor }}; color: #ffffff; font-family: 'Fredoka', sans-serif; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 16px; letter-spacing: 0.04em; text-transform: uppercase; box-shadow: 0 10px 22px -5px rgba(245, 158, 11, 0.38);">
                                                {{ $actionText }}
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            @endisset

                            @foreach (($outroLines ?? []) as $line)
                                <div style="margin: 0 0 14px 0; font-size: 14px; font-weight: 600; color: #475569; line-height: 1.65;">
                                    {!! \Illuminate\Support\Str::markdown((string) $line) !!}
                                </div>
                            @endforeach

                            <!-- Salutation -->
                            <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f5f9; font-size: 13.5px; font-weight: 700; color: #1f2937; line-height: 1.5;">
                                @if (!empty($salutation))
                                    {!! nl2br(e($salutation)) !!}
                                @else
                                    Warm regards,<br>
                                    <span style="color: #f59e0b;">PAWLSE &bull; Iligan Stray Feeders Team</span>
                                @endif
                            </div>

                            @isset($actionText)
                                <div style="margin-top: 20px; padding: 12px 14px; background-color: #f8fafc; border-radius: 12px; font-size: 11px; font-weight: 600; color: #64748b; line-height: 1.5; word-break: break-all;">
                                    If you're having trouble clicking the "{{ $actionText }}" button, copy and paste the URL below into your web browser:<br>
                                    <a href="{{ $actionUrl }}" style="color: #f59e0b; text-decoration: underline;">{{ $displayableActionUrl ?? $actionUrl }}</a>
                                </div>
                            @endisset
                        </td>
                    </tr>

                    <!-- Dark Paw-Navy Footer -->
                    <tr>
                        <td style="background-color: #1f2937; padding: 24px 36px; color: #cbd5e1;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td valign="middle">
                                        <div style="font-family: 'Fredoka', sans-serif; font-size: 15px; font-weight: 700; color: #ffffff;">
                                            PAWLSE &bull; Iligan Stray Feeders
                                        </div>
                                        <div style="font-size: 11.5px; font-weight: 600; color: #94a3b8; margin-top: 2px;">
                                            Zone 5, Barangay Tambo, Iligan City, 9200 &bull; Feed Furr A Cause
                                        </div>
                                    </td>
                                    <td align="right" valign="middle">
                                        <img src="{{ $logoUrl }}" alt="ISF Logo" width="36" height="36" style="display: block; width: 36px; height: 36px; border-radius: 9999px; border: 1.5px solid #f59e0b;" />
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
