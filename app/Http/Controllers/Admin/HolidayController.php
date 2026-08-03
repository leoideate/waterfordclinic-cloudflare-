<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\Holiday;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HolidayController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Holiday::orderBy('date', 'desc')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateInput($request);
        $h = Holiday::create($data);
        AdminActivityLog::record('holiday.create', $data, $h);
        return response()->json(['data' => $h->fresh()], 201);
    }

    public function update(Request $request, Holiday $holiday): JsonResponse
    {
        $data = $this->validateInput($request);
        $holiday->update($data);
        AdminActivityLog::record('holiday.update', $data, $holiday);
        return response()->json(['data' => $holiday->fresh()]);
    }

    public function destroy(Holiday $holiday): JsonResponse
    {
        $holiday->delete();
        AdminActivityLog::record('holiday.delete', [], $holiday);
        return response()->json(['message' => 'Deleted.']);
    }

    private function validateInput(Request $request): array
    {
        return $request->validate([
            'name'       => ['required', 'string', 'max:120'],
            'date'       => ['required', 'date'],
            'scope'      => ['required', Rule::in(array_keys(Holiday::SCOPES))],
            'is_full_day'=> ['required', 'boolean'],
            'start_time' => ['nullable', 'required_if:is_full_day,false', 'date_format:H:i'],
            'end_time'   => ['nullable', 'required_if:is_full_day,false', 'date_format:H:i', 'after:start_time'],
            'notes'      => ['nullable', 'string', 'max:1000'],
        ]);
    }
}
