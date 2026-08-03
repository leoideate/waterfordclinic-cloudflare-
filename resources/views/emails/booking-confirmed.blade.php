@php
    // Brand colours reused throughout the email.
    $green   = '#1f7a3e';
    $greenDk = '#14552d';
    $ink     = '#1f2a24';
    $muted   = '#5b6b62';
    $amberBg = '#fff8e1';
    $amberBd = '#f4b740';
    $amberInk = '#5c4408';
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Walk In GP appointment confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:{{ $ink }};">

    {{-- Outer wrapper for background tint on desktop clients --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f5;padding:24px 12px;">
        <tr>
            <td align="center">

                {{-- Main card --}}
                <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.06);">

                    {{-- Brand header bar --}}
                    <tr>
                        <td style="background:{{ $greenDk }};padding:22px 28px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.01em;">
                                        Walk In GP
                                    </td>
                                    <td align="right" style="font-size:12px;color:#c8f0d3;text-transform:uppercase;letter-spacing:0.1em;">
                                        Appointment confirmed
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding:30px 28px 8px 28px;">
                            <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;color:{{ $ink }};">
                                Hi {{ $firstName }},
                            </h1>
                            <p style="margin:0 0 18px 0;font-size:15px;line-height:1.6;color:{{ $ink }};">
                                Thanks for booking online — your appointment is <strong>confirmed</strong>.
                                Please find your booking details below, and we look forward to seeing you.
                            </p>

                            {{-- Booking summary box --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f8f5;border:1px solid #e2ece6;border-radius:10px;margin:18px 0;">
                                <tr><td colspan="2" style="padding:14px 18px 6px 18px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:{{ $muted }};font-weight:600;">Your booking</td></tr>
                                <tr>
                                    <td style="padding:4px 18px;font-size:14px;color:{{ $muted }};width:40%;">Reference</td>
                                    <td style="padding:4px 18px;font-size:14px;font-weight:700;color:{{ $greenDk }};">{{ $reference }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:4px 18px;font-size:14px;color:{{ $muted }};">Clinic</td>
                                    <td style="padding:4px 18px;font-size:14px;color:{{ $ink }};">{{ $clinic }}</td>
                                </tr>
                                @if (! empty($clinicAddress))
                                <tr>
                                    <td style="padding:4px 18px;font-size:14px;color:{{ $muted }};">Address</td>
                                    <td style="padding:4px 18px;font-size:14px;color:{{ $ink }};">{{ $clinicAddress }}</td>
                                </tr>
                                @endif
                                <tr>
                                    <td style="padding:4px 18px;font-size:14px;color:{{ $muted }};">Date</td>
                                    <td style="padding:4px 18px;font-size:14px;color:{{ $ink }};">{{ $date }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:4px 18px;font-size:14px;color:{{ $muted }};">Time</td>
                                    <td style="padding:4px 18px;font-size:14px;color:{{ $ink }};">{{ $time }}</td>
                                </tr>
                                @if (! empty($service))
                                <tr>
                                    <td style="padding:4px 18px 14px 18px;font-size:14px;color:{{ $muted }};">Service</td>
                                    <td style="padding:4px 18px 14px 18px;font-size:14px;color:{{ $ink }};">{{ $service }}</td>
                                </tr>
                                @endif
                            </table>

                            {{-- Important notice --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{{ $amberBg }};border:1px solid {{ $amberBd }};border-left:4px solid {{ $amberBd }};border-radius:8px;margin:6px 0 18px 0;">
                                <tr>
                                    <td style="padding:14px 18px;font-size:14px;line-height:1.5;color:{{ $amberInk }};">
                                        <strong style="color:#6e4f06;">⚠️ Please note:</strong>
                                        Medical Cards and GMS are not accepted at Walk In GP.
                                        The consultation fee is <strong>€60</strong>, payable on the day.
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 8px 0;font-size:14px;line-height:1.6;color:{{ $ink }};">
                                Need to change or cancel your booking? Just call us on
                                <a href="tel:{{ $clinicPhone }}" style="color:{{ $green }};text-decoration:none;font-weight:600;">{{ $clinicPhone }}</a>
                                during opening hours (Mon–Fri 8:00–19:00, Sat 9:00–14:00).
                            </p>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="padding:22px 28px 28px 28px;border-top:1px solid #eef2ee;background:#fafbfa;">
                            <p style="margin:0 0 6px 0;font-size:12px;line-height:1.5;color:{{ $muted }};">
                                This confirmation was sent because an appointment was booked at Walk In GP.
                                If you didn't make this booking, please call the clinic on {{ $clinicPhone }}.
                            </p>
                            <p style="margin:0;font-size:12px;color:{{ $muted }};">
                                © {{ date('Y') }} Walk In GP · Tullamore &amp; Kildare, Ireland
                            </p>
                        </td>
                    </tr>
                </table>

                {{-- Subtle preheader-style spacer note --}}
                <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
                    <tr><td style="padding:14px 0;text-align:center;font-size:11px;color:#9aa7a0;">Walk In GP — booking confirmation</td></tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>
