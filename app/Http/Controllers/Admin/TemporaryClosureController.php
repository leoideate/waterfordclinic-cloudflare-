<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\TemporaryClosure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TemporaryClosureController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => TemporaryClosure::with('clinic:id,slug,name')->latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateInput($request);
        $c = TemporaryClosure::create($data);
        AdminActivityLog::record('closure.create', $data, $c);
        return response()->json(['data' => $c->fresh('clinic')], 201);
    }

    public function update(Request $request, TemporaryClosure $temporaryClosure): JsonResponse
    {
        $data = $this->validateInput($request);
        $temporaryClosure->update($data);
        AdminActivityLog::record('closure.update', $data, $temporaryClosure);
        return response()->json(['data' => $temporaryClosure->fresh('clinic')]);
    }

    public function destroy(TemporaryClosure $temporaryClosure): JsonResponse
    {
        $temporaryClosure->delete();
        AdminActivityLog::record('closure.delete', [], $temporaryClosure);
        return response()->json(['message' => 'Deleted.']);
    }

    private function validateInput(Request $request): array
    {
        return $request->validate([
            'clinic_id'   => ['nullable', 'exists:clinics,id'],     // null = both
            'start_date'  => ['required', 'date'],
            'end_date'    => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_full_day' => ['required', 'boolean'],
            'start_time'  => ['nullable', 'required_if:is_full_day,false', 'date_format:H:i'],
            'end_time'    => ['nullable', 'required_if:is_full_day,false', 'date_format:H:i', 'after:start_time'],
            'reason'      => ['nullable', 'string', 'max:160'],
            'notes'       => ['nullable', 'string', 'max:1000'],
        ]);
    }
}
