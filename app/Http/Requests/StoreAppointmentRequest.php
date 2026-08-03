<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // public booking endpoint
    }

    public function rules(): array
    {
        return [
            // NOTE: 'clinic' existence is verified defensively in the controller
            // (a raw `exists:clinics,slug` rule would 500 if the clinics table
            // is empty or unmigrated). The controller returns a friendly 422.
            'clinic'        => ['required', 'string', 'max:60'],
            'firstName'     => ['required', 'string', 'max:80'],
            'lastName'      => ['required', 'string', 'max:80'],
            'phone'         => ['required', 'string', 'max:30'],
            'email'         => ['nullable', 'email:rfc', 'max:150'],
            'dob'           => ['required', 'date', 'before:today'],
            'address'       => ['required', 'string', 'max:255'],
            'isExisting'    => ['nullable', 'string', 'in:Yes,No'],
            'service'       => ['nullable', 'string', 'max:120'],
            'date'          => ['required', 'date', 'after_or_equal:today'],
            'time'          => ['required', 'date_format:H:i'],
            'notes'         => ['nullable', 'string', 'max:2000'],
            'consent'       => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'consent.accepted'    => 'You must accept the privacy notice to continue.',
            'date.after_or_equal' => 'Please choose today or a future date.',
            'time.date_format'    => 'Please choose a valid time slot.',
            'dob.required'        => 'Please enter your date of birth.',
            'dob.before'          => 'Please enter a valid date of birth.',
            'address.required'   => 'Please enter your address.',
        ];
    }
}
