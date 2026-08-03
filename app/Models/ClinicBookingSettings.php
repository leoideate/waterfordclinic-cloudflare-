<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One row per clinic. bookings_enabled is the master on/off switch shown on
 * the public booking form. Messages are overridable from Settings.
 */
class ClinicBookingSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id', 'bookings_enabled',
        'confirmation_message', 'unavailable_message', 'notification_email',
    ];

    protected $casts = [
        'bookings_enabled' => 'boolean',
    ];

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public const DEFAULT_CONFIRMATION = 'Appointment confirmed. A confirmation email is on its way.';
    public const DEFAULT_UNAVAILABLE = 'Online appointments are currently unavailable. Please contact the clinic by phone.';
    public const DEFAULT_SLOT_UNAVAILABLE = 'Appointments are not available during this time. Please select another time.';
}
