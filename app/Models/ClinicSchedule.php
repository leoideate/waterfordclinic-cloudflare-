<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One row per (clinic, weekday). weekday: 0 = Sunday ... 6 = Saturday.
 * Sunday bookings are controlled simply by is_open on weekday 0.
 */
class ClinicSchedule extends Model
{
    use HasFactory;

    protected $table = 'clinic_schedules';

    protected $fillable = [
        'clinic_id', 'weekday', 'is_open',
        'open_time', 'close_time', 'slot_minutes', 'max_per_slot',
    ];

    protected $casts = [
        'weekday' => 'integer',
        'is_open' => 'boolean',
        // open_time / close_time are MySQL TIME columns ('08:00:00'). Casting
        // them as datetime:... makes Eloquent try to parse the value as a full
        // date+time, which misinterprets "08:00:00" as year=08 → garbage.
        // Leave them as plain strings; AvailabilityService does the formatting.
        'open_time' => 'string',
        'close_time' => 'string',
        'slot_minutes' => 'integer',
        'max_per_slot' => 'integer',
    ];

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public const WEEKDAYS = [
        0 => 'Sunday',
        1 => 'Monday',
        2 => 'Tuesday',
        3 => 'Wednesday',
        4 => 'Thursday',
        5 => 'Friday',
        6 => 'Saturday',
    ];
}
