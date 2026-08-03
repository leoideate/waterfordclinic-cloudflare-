<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Patient-facing confirmation email — sent to the patient after they book.
 *
 * Distinct from AppointmentRequested (which goes to the CLINIC with full
 * patient details). This one is a polite, branded acknowledgement to the
 * patient including their booking reference, the €60 / no-Medical-Card
 * notice, and the clinic phone for changes.
 *
 * Implements ShouldQueue so it's dispatched via the queue and doesn't
 * slow the HTTP response. With QUEUE_CONNECTION=sync it runs inline.
 */
class AppointmentConfirmed extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Appointment $appointment,
        public string $clinicName,
        public string $clinicPhone,
        public string $clinicAddress = ''
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(
                config('mail.from.address', 'info@waterfordclinic.ie'),
                config('mail.from.name', config('app.name'))
            ),
            subject: 'Your ' . config('app.name') . ' appointment confirmation — ' . $this->appointment->reference,
        );
    }

    public function content(): Content
    {
        $a = $this->appointment;

        return new Content(
            html: 'emails.booking-confirmed',
            with: [
                'brand'         => config('app.name'),
                'firstName'     => $a->first_name,
                'lastName'      => $a->last_name,
                'reference'     => $a->reference,
                'clinic'        => $this->clinicName,
                'clinicPhone'   => $this->clinicPhone,
                'clinicAddress' => $this->clinicAddress,
                'date'          => optional($a->preferred_date)->format('l j F Y'),
                'time'          => $a->preferred_time ? substr((string) $a->preferred_time, 0, 5) : '—',
                'service'       => $a->service,
                // Deliberately unset until confirmed with the client — see
                // src/config/site.js for the same rule on the public site.
                'consultationFee' => null,
                'acceptsMedicalCard' => null,
            ],
        );
    }
}
