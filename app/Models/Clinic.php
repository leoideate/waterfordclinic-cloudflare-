<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Clinic extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug', 'name', 'full_name', 'county', 'tagline',
        'address', 'phone', 'email', 'hours', 'is_active',
    ];

    protected $casts = [
        'hours' => 'array',
        'is_active' => 'boolean',
    ];

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Find a clinic by slug (e.g. 'tullamore') or fail.
     */
    public function scopeForSlug($query, string $slug)
    {
        return $query->where('slug', $slug);
    }
}
