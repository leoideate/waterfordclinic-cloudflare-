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

    public const SCOPES = [
        'both' => 'Both clinics',
        'tullamore' => 'Tullamore only',
        'kildare' => 'Kildare only',
    ];

    /** Does this holiday affect the given clinic slug? */
    public function affects(string $clinicSlug): bool
    {
        return $this->scope === 'both' || $this->scope === $clinicSlug;
    }
}
