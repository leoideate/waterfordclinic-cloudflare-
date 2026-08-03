<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'date', 'scope', 'is_full_day',
        'start_time', 'end_time', 'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'is_full_day' => 'boolean',
        // start_time / end_time are MySQL TIME columns — keep as string.
        'start_time' => 'string',
        'end_time' => 'string',
    ];

    /**
     * The platform supports per-clinic scoping for multi-location clients
     * (see the original two-clinic build). Waterford Clinic is a single
     * location, so 'both' is really "the clinic" — kept as the key so
     * affects() and the admin UI need no special-casing for one location.
     */
    public const SCOPES = [
        'both' => 'Waterford Clinic',
    ];

    /** Does this holiday affect the given clinic slug? */
    public function affects(string $clinicSlug): bool
    {
        return $this->scope === 'both' || $this->scope === $clinicSlug;
    }
}
