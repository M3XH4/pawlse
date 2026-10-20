@php
    $logoUrl = asset('images/logo.png');
    $spacedOtp = implode(' ', str_split((string) ($otp ?? '000000')));
    $appName = config('app.name', 'PAWLSE');
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Pawlse Verification Code: {{ $otp }}</title>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Quicksand:wght@500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; -webkit-font-smoothing: antialiased;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 36px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 45px -15px rgba(31, 41, 55, 0.08); border: 1px solid #e2e8f0;">
                    <!-- Top Branded Header Bar -->
                    <tr>
                        <td align="center" style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #f1f5f9; background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%);">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td valign="middle" style="padding-right: 12px;">
                                        <img src="{{ $logoUrl }}" data-logo="{{ $logoUrl }}" alt="Iligan Stray Feeders Logo" width="44" height="44" style="display: block; width: 44px; height: 44px; border-radius: 9999px; object-fit: cover; border: 2px solid #f59e0b; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.2);" />
                                    </td>
                                    <td valign="middle" align="left">
                                        <div style="font-family: 'Fredoka', sans-serif; font-size: 22px; font-weight: 700; color: #1f2937; letter-spacing: 0.02em; line-height: 1.1;">
                                            PAWLSE
                                        </div>
                                        <div style="font-size: 11px; font-weight: 800; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.08em;">
                                            Iligan Stray Feeders
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main Security Content -->
                    <tr>
                        <td style="padding: 32px 36px 24px 36px;">
                            <h1 style="margin: 0 0 18px 0; font-family: 'Fredoka', sans-serif; font-size: 26px; font-weight: 700; color: #1f2937; line-height: 1.25;">
                                Here's your code to verify your account
                            </h1>

                            <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #1f2937;">
                                Hello {{ $recipientName ?? 'Valued Member' }},
                            </p>

                            <p style="margin: 0 0 24px 0; font-size: 14px; font-weight: 600; color: #475569; line-height: 1.6;">
                                Someone requested email verification for your <strong>PAWLSE — Iligan Stray Feeders</strong> account. Enter the 6-digit verification code below in the app to verify your email address and unlock full community features.
                            </p>

                            <!-- Large Spaced 6-Digit OTP Box (Meta Reference Style) -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
                                <tr>
                                    <td align="center" style="background-color: #f1f5f9; border: 2px solid #e2e8f0; border-radius: 18px; padding: 24px 16px;">
                                        <div style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; color: #0f172a; letter-spacing: 10px; line-height: 1;">
                                            {{ $spacedOtp }}
                                        </div>
                                        <div style="display: none; font-size: 0; line-height: 0;">{{ $otp }}</div>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 26px 0; text-align: center; font-size: 12.5px; font-weight: 700; color: #64748b;">
                                Don't share this code with anyone &bull; Expires at <span style="color: #d97706;">{{ $formattedExpiry }}</span> (10-minute window)
                            </p>

                            <p style="margin: 0 0 12px 0; font-size: 13.5px; font-weight: 600; color: #475569; line-height: 1.5;">
                                Your verification code protects your profile across the PAWLSE animal welfare ecosystem:
                            </p>

                            <!-- Account Context Pill Card (Meta Reference Style) -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1.5px solid #e2e8f0; border-radius: 18px; padding: 14px 18px; margin-bottom: 28px; background-color: #ffffff;">
                                <tr>
                                    <td width="46" valign="middle">
                                        <img src="{{ $logoUrl }}" alt="ISF Emblem" width="40" height="40" style="display: block; width: 40px; height: 40px; border-radius: 9999px; object-fit: cover; border: 1.5px solid #cbd5e1;" />
                                    </td>
                                    <td valign="middle" style="padding-left: 10px;">
                                        <div style="font-size: 14px; font-weight: 800; color: #1f2937; line-height: 1.3;">
                                            PAWLSE Community Account
                                        </div>
                                        <div style="font-size: 12.5px; font-weight: 600; color: #64748b; line-height: 1.3;">
                                            {{ $recipientName ?? 'Valued Member' }}{{ !empty($recipientEmail) ? ' • '.$recipientEmail : '' }}
                                        </div>
                                    </td>
                                    <td width="64" align="right" valign="middle">
                                        <span style="display: inline-block; background-color: #fef3c7; color: #b45309; font-size: 11px; font-weight: 800; padding: 5px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.04em;">
                                            OTP
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <!-- Security Sections -->
                            <h3 style="margin: 0 0 6px 0; font-family: 'Fredoka', sans-serif; font-size: 16px; font-weight: 700; color: #1f2937;">
                                If someone asks for this code
                            </h3>
                            <p style="margin: 0 0 20px 0; font-size: 13.5px; font-weight: 600; color: #475569; line-height: 1.6;">
                                Do not share this code with anyone, especially if they tell you they work for PAWLSE or Iligan Stray Feeders. Pawlse staff will never ask for your one-time code.
                            </p>

                            <h3 style="margin: 0 0 6px 0; font-family: 'Fredoka', sans-serif; font-size: 16px; font-weight: 700; color: #1f2937;">
                                Didn't request this?
                            </h3>
                            <p style="margin: 0 0 24px 0; font-size: 13.5px; font-weight: 600; color: #475569; line-height: 1.6;">
                                If you received this email but did not create or verify an account on PAWLSE, no further action is required and you can safely ignore this message. Need help? Contact <a href="mailto:info@pawlse.org" style="color: #f59e0b; text-decoration: underline; font-weight: 700;">info@pawlse.org</a>.
                            </p>

                            <p style="margin: 0; font-size: 13.5px; font-weight: 700; color: #1f2937; line-height: 1.5;">
                                Warm regards,<br>
                                <span style="color: #f59e0b;">The Pawlse Community &amp; Security Team</span>
                            </p>
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
                                        <img src="{{ $logoUrl }}" alt="ISF Logo" width="34" height="34" style="display: block; width: 34px; height: 34px; border-radius: 9999px; border: 1.5px solid #f59e0b;" />
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
