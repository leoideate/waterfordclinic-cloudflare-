<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id', 'reference',
        'first_name', 'last_name', 'phone', 'email', 'dob', 'address', 'is_existing_patient',
        'service', 'preferred_date', 'preferred_time', 'notes', 'admin_notes',
        'status', 'source', 'ip_address', 'confirmed_at',
    ];

    protected $casts = [
        'preferred_date' => 'date',
        'dob' => 'date',
        'is_existing_patient' => 'boolean',
        'confirmed_at' => 'datetime',
    ];

    /** Valid status values for the admin workflow. */
    public const STATUSES = [
        'new' => 'New',
        'confirmed' => 'Confirmed',
        'cancelled' => 'Cancelled',
        'completed' => 'Completed',
        'no_show' => 'No-show',
    ];

    /** Statuses that count toward slot capacity (block double-booking). */
    public const ACTIVE_STATUSES = ['new', 'confirmed'];

    protected static function booted(): void
    {
        static::creating(function (Appointment $appt) {
            if (empty($appt->reference)) {
                $appt->reference = static::generateReference();
            }
        });
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    /**
     * Readable, hard-to-guess reference: WIGP-XXXXXX (6 alnum chars).
     * Retries on rare collisions.
     */
    public static function generateReference(): string
    {
        do {
            $ref = 'WIGP-' . strtoupper(Str::random(6));
        } while (static::where('reference', $ref)->exists());

        return $ref;
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }
}
