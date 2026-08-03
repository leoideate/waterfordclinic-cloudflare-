<?php

namespace App\Http\Controllers;

use App\Models\Clinic;
use Illuminate\Http\JsonResponse;

class ClinicController extends Controller
{
    /**
     * GET /api/clinics — list active clinics (public).
     */
    public function index(): JsonResponse
    {
        $clinics = Clinic::active()
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $clinics->map(fn (Clinic $c) => [
                'key' => $c->slug,
                'name' => $c->name,
                'fullName' => $c->full_name,
                'county' => $c->county,
                'tagline' => $c->tagline,
                'address' => $c->address,
                'phone' => $c->phone,
                'email' => $c->email,
                'hours' => $c->hours ?? [],
            ]),
        ]);
    }
}
