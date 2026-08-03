<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminActivityLog extends Model
{
    use HasFactory;

    protected $table = 'admin_activity_log';

    public const UPDATED_AT = null;   // log only uses created_at

    protected $fillable = ['user_id', 'action', 'subject_type', 'subject_id', 'meta', 'ip_address'];

    protected $casts = [
        'meta' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Convenience helper used throughout controllers. */
    public static function record(string $action, array $meta = [], $subject = null): void
    {
        try {
            self::create([
                'user_id' => auth()->id(),
                'action' => $action,
                'subject_type' => $subject ? get_class($subject) : null,
                'subject_id' => $subject?->id,
                'meta' => $meta,
                'ip_address' => request()?->ip(),
            ]);
        } catch (\Throwable $e) {
            // Logging must never break the actual operation.
            logger()->warning('Failed to record admin activity', ['action' => $action, 'error' => $e->getMessage()]);
        }
    }
}
