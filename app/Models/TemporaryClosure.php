<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemporaryClosure extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id', 'start_date', 'end_date', 'is_full_day',
        'start_time', 'end_time', 'reason', 'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_full_day' => 'boolean',
        // start_time / end_time are MySQL TIME columns — keep as string.
        'start_time' => 'string',
        'end_time' => 'string',
    ];

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    /** Does this closure apply on the given date (within start/end range)? */
    public function appliesOnDate(string $dateYmd): bool
    {
        $date = \Illuminate\Support\Carbon::parse($dateYmd);
        $start = $this->start_date->startOfDay();
        $end = ($this->end_date ?? $this->start_date)->endOfDay();
        return $date->between($start, $end);
    }

    /** Does this closure affect the given clinic slug (NULL clinic_id = both)? */
    public function affects(?string $clinicSlug): bool
    {
        if (! $this->clinic_id) return true;             // both clinics
        return optional($this->clinic)->slug === $clinicSlug;
    }
}
