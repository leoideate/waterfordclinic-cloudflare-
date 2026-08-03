<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BreakTime extends Model
{
    use HasFactory;

    protected $table = 'break_times';

    protected $fillable = [
        'clinic_id', 'weekday', 'date', 'start_time', 'end_time',
        'reason', 'custom_reason', 'recurrence', 'notes',
    ];

    protected $casts = [
        'weekday' => 'integer',
        'date' => 'date',
        // start_time / end_time are MySQL TIME columns — keep as string
        // (datetime:... cast misparses '08:00:00' as year=08 → garbage).
        'start_time' => 'string',
        'end_time' => 'string',
    ];

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public const REASONS = [
        'lunch' => 'Lunch break',
        'doctor_unavailable' => 'Doctor unavailable',
        'emergency' => 'Emergency break',
        'staff_meeting' => 'Staff meeting',
        'training' => 'Training',
        'custom' => 'Custom reason',
    ];

    public const RECURRENCES = [
        'once' => 'Apply once',
        'weekly' => 'Apply weekly',
    ];
}
