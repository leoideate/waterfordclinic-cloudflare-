<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\BreakTime;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BreakTimeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => BreakTime::with('clinic:id,slug,name')->latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateInput($request);
        $bt = BreakTime::create($data);
        AdminActivityLog::record('break.create', $data, $bt);
        return response()->json(['data' => $bt->fresh('clinic')], 201);
    }

    public function update(Request $request, BreakTime $breakTime): JsonResponse
    {
        $data = $this->validateInput($request, $breakTime->id);
        $breakTime->update($data);
        AdminActivityLog::record('break.update', $data, $breakTime);
        return response()->json(['data' => $breakTime->fresh('clinic')]);
    }

    public function destroy(BreakTime $breakTime): JsonResponse
    {
        $breakTime->delete();
        AdminActivityLog::record('break.delete', [], $breakTime);
        return response()->json(['message' => 'Deleted.']);
    }

    private function validateInput(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'clinic_id'     => ['nullable', 'exists:clinics,id'],     // null = both
            'weekday'       => ['nullable', 'integer', 'between:0,6'],
            'date'          => ['nullable', 'date'],
            'start_time'    => ['required', 'date_format:H:i'],
            'end_time'      => ['required', 'date_format:H:i', 'after:start_time'],
            'reason'        => ['required', Rule::in(array_keys(BreakTime::REASONS))],
            'custom_reason' => ['nullable', 'string', 'max:120'],
            'recurrence'    => ['required', Rule::in(array_keys(BreakTime::RECURRENCES))],
            'notes'         => ['nullable', 'string', 'max:1000'],
        ]) + array_filter([
            // weekly → weekday required; once → date required
        ]);
    }
}
