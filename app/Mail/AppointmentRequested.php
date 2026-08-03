<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Email sent to the clinic's notification_email when a new booking arrives.
 * Configure MAIL_* in .env (SMTP, Mailtrap for dev, etc.). If mail fails,
 * Laravel logs it — booking creation is never blocked.
 */
class AppointmentRequested extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Appointment $appointment, public string $clinicName)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New appointment request — ' . $this->clinicName
                . ' — ' . $this->appointment->full_name,
        );
    }

    public function content(): Content
    {
        $a = $this->appointment;
        return new Content(
            text: 'emails.appointment-requested',
            with: [
                'name' => $a->full_name,
                'firstName' => $a->first_name,
                'lastName' => $a->last_name,
                'phone' => $a->phone,
                'email' => $a->email ?: '—',
                'dob' => optional($a->dob)?->format('j M Y') ?: '—',
                'address' => $a->address ?: '—',
                'clinic' => $this->clinicName,
                'date' => optional($a->preferred_date)->format('j M Y'),
                'time' => $a->preferred_time ? substr((string) $a->preferred_time, 0, 5) : '—',
                'service' => $a->service ?: '—',
                'isExisting' => is_null($a->is_existing_patient) ? 'Not specified' : ($a->is_existing_patient ? 'Existing patient' : 'New patient'),
                'reference' => $a->reference,
                'status' => $a->status,
                'notes' => $a->notes ?: '—',
            ],
        );
    }
}
