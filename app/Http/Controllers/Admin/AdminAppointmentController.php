<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\Appointment;
use App\Models\Clinic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminAppointmentController extends Controller
{
    /**
     * GET /admin/appointments
     * Search by patient name/phone/email; filter by clinic/date/status; paginated.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::with('clinic')->latest();

        if ($search = $request->string('search')) {
            $s = $search->toString();
            $query->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%{$s}%")
                  ->orWhere('last_name', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('reference', 'like', "%{$s}%");
            });
        }
        if ($clinic = $request->string('clinic')->toString()) {
            $query->whereHas('clinic', fn ($q) => $q->where('slug', $clinic));
        }
        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }
        if ($date = $request->string('date')->toString()) {
            $query->whereDate('preferred_date', $date);
        }
        if ($from = $request->string('from')->toString()) {
            $query->whereDate('preferred_date', '>=', $from);
        }
        if ($to = $request->string('to')->toString()) {
            $query->whereDate('preferred_date', '<=', $to);
        }

        $perPage = min(100, max(10, (int) $request->integer('per_page', 25)));
        $results = $query->paginate($perPage);

        // IMPORTANT: return a FLAT shape { data: [...], meta: {...} }.
        // Don't use ->through() on the paginator — that returns the full
        // LengthAwarePaginator object, which serializes as
        //   { data: [...], current_page, last_page, ... }
        // Wrapping that under another 'data' key creates a confusing
        // data.data.data nesting that breaks the React frontend. Map the
        // items explicitly and build meta separately.
        $items = array_map(fn (Appointment $a) => $this->present($a), $results->items());

        return response()->json([
            'success' => true,
            'data'    => $items,
            'meta'    => [
                'current_page' => $results->currentPage(),
                'last_page'    => $results->lastPage(),
                'total'        => $results->total(),
                'per_page'     => $results->perPage(),
            ],
        ]);
    }

    /** GET /admin/appointments/{id} */
    public function show(int $id): JsonResponse
    {
        $appt = Appointment::with('clinic')->findOrFail($id);
        return response()->json(['data' => $this->present($appt, true)]);
    }

    /** PUT /admin/appointments/{id} — edit date/time/service/admin_notes etc. */
    public function update(Request $request, int $id): JsonResponse
    {
        $appt = Appointment::with('clinic')->findOrFail($id);

        $data = $request->validate([
            'first_name'      => ['sometimes', 'string', 'max:80'],
            'last_name'       => ['sometimes', 'string', 'max:80'],
            'phone'           => ['sometimes', 'string', 'max:30'],
            'email'           => ['sometimes', 'nullable', 'email', 'max:150'],
            'service'         => ['sometimes', 'string', 'max:120'],
            'preferred_date'  => ['sometimes', 'date'],
            'preferred_time'  => ['sometimes', 'date_format:H:i'],
            'admin_notes'     => ['sometimes', 'nullable', 'string', 'max:5000'],
            'status'          => ['sometimes', Rule::in(array_keys(Appointment::STATUSES))],
        ]);

        $appt->update($data);
        AdminActivityLog::record('appointment.update', ['fields' => array_keys($data)], $appt);

        return response()->json(['data' => $this->present($appt->fresh('clinic'), true)]);
    }

    /** PATCH /admin/appointments/{id}/status — quick status transition. */
    public function status(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(array_keys(Appointment::STATUSES))],
        ]);

        $appt = Appointment::findOrFail($id);
        $old = $appt->status;
        $appt->status = $data['status'];

        if ($data['status'] === 'confirmed' && ! $appt->confirmed_at) {
            $appt->confirmed_at = now();
        }
        $appt->save();

        AdminActivityLog::record('appointment.status', [
            'from' => $old, 'to' => $data['status'],
        ], $appt);

        return response()->json(['data' => $this->present($appt->fresh('clinic'))]);
    }

    /** GET /admin/appointments/export — CSV download. */
    public function export(Request $request)
    {
        $query = Appointment::with('clinic')->latest();
        if ($clinic = $request->string('clinic')->toString()) {
            $query->whereHas('clinic', fn ($q) => $q->where('slug', $clinic));
        }
        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }
        if ($from = $request->string('from')->toString()) $query->whereDate('preferred_date', '>=', $from);
        if ($to = $request->string('to')->toString()) $query->whereDate('preferred_date', '<=', $to);

        $rows = $query->limit(5000)->get();
        $csv = "Reference,Clinic,First Name,Last Name,Phone,Email,DOB,Address,Service,Date,Time,Existing,Status,Created,Admin Notes\n";
        foreach ($rows as $a) {
            $csv .= implode(',', [
                $a->reference,
                $a->clinic?->name ?? '',
                $this->csv($a->first_name), $this->csv($a->last_name),
                $a->phone, $a->email ?? '', optional($a->dob)->toDateString() ?? '',
                $this->csv($a->address ?? ''),
                $this->csv($a->service),
                optional($a->preferred_date)->toDateString() ?? '',
                $a->preferred_time ? substr((string) $a->preferred_time, 0, 5) : '',
                $a->is_existing_patient === null ? '' : ($a->is_existing_patient ? 'Yes' : 'No'),
                $a->status, $a->created_at?->toDateTimeString(),
                $this->csv($a->admin_notes ?? ''),
            ]) . "\n";
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="appointments.csv"',
        ]);
    }

    /* ---- helpers ---- */
    private function csv(?string $value): string
    {
        $v = (string) $value;
        return preg_match('/[",\n]/', $v) ? '"' . str_replace('"', '""', $v) . '"' : $v;
    }

    private function present(Appointment $a, bool $full = false): array
    {
        $base = [
            'id' => $a->id,
            'reference' => $a->reference,
            'clinic' => $a->clinic?->only(['id', 'slug', 'name']),
            'firstName' => $a->first_name,
            'lastName' => $a->last_name,
            'phone' => $a->phone,
            'service' => $a->service,
            'preferredDate' => $a->preferred_date?->toDateString(),
            'preferredTime' => $a->preferred_time ? substr((string) $a->preferred_time, 0, 5) : null,
            'status' => $a->status,
            'createdAt' => $a->created_at?->toIso8601String(),
        ];
        if (! $full) return $base;
        return array_merge($base, [
            'email' => $a->email,
            'dob' => optional($a->dob)?->toDateString(),
            'address' => $a->address,
            'isExistingPatient' => $a->is_existing_patient,
            'notes' => $a->notes,
            'adminNotes' => $a->admin_notes,
            'confirmedAt' => $a->confirmed_at?->toIso8601String(),
        ]);
    }
}
