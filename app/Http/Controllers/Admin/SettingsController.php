<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Global app settings stored as a single JSON blob under the cache key
 * 'admin.settings'. Clinic-specific settings live on each clinic's
 * clinic_booking_settings row; this is for app-wide defaults only.
 */
class SettingsController extends Controller
{
    private const KEY = 'admin.settings';

    private const DEFAULTS = [
        'default_slot_minutes'   => 30,
        'default_confirmation'   => 'Booking request received. Our team will confirm by phone.',
        'default_unavailable'    => 'Online appointments are currently unavailable. Please contact the clinic by phone.',
        'admin_notification_email' => null,
    ];

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->all()]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'default_slot_minutes'     => ['sometimes', 'integer', 'between:5,240'],
            'default_confirmation'     => ['sometimes', 'string', 'max:1000'],
            'default_unavailable'      => ['sometimes', 'string', 'max:1000'],
            'admin_notification_email' => ['sometimes', 'nullable', 'email', 'max:150'],
        ]);

        $merged = array_merge($this->all(), $data);
        Cache::forever(self::KEY, $merged);

        \App\Models\AdminActivityLog::record('settings.update', $data);
        return response()->json(['data' => $merged]);
    }

    private function all(): array
    {
        return array_merge(self::DEFAULTS, Cache::get(self::KEY, []));
    }
}
