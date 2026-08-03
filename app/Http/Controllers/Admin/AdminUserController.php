<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AdminUserController extends Controller
{
    /** GET /admin/users */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => User::orderBy('name')->get()->map(fn (User $u) => $this->present($u)),
        ]);
    }

    /** POST /admin/users — add another admin. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:120'],
            'email'    => ['required', 'email', 'max:150', 'unique:users,email'],
            'username' => ['nullable', 'string', 'max:80', 'unique:users,username'],
            'password' => ['required', 'confirmed', Password::min(8)
                ->mixedCase()->numbers()->symbols()],
        ]);
        $u = User::create([
            'name' => $data['name'], 'email' => $data['email'],
            'username' => $data['username'] ?? null,
            'password' => $data['password'],
            'role' => 'admin', 'is_active' => true,
        ]);
        AdminActivityLog::record('adminuser.create', ['email' => $u->email], $u);
        return response()->json(['data' => $this->present($u->fresh())], 201);
    }

    /** PUT /admin/users/{user} — update name/email/username/is_active. */
    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name'      => ['sometimes', 'string', 'max:120'],
            'email'     => ['sometimes', 'email', 'max:150', 'unique:users,email,'.$user->id],
            'username'  => ['sometimes', 'nullable', 'string', 'max:80', 'unique:users,username,'.$user->id],
            'is_active' => ['sometimes', 'boolean'],
        ]);
        $user->update($data);
        AdminActivityLog::record('adminuser.update', $data, $user);
        return response()->json(['data' => $this->present($user->fresh())]);
    }

    /**
     * PATCH /admin/users/{user}/password — change password.
     * Requires the user's CURRENT password (only works for self).
     */
    public function password(Request $request, User $user): JsonResponse
    {
        /** @var User $me */
        $me = $request->user();
        if ($me->id !== $user->id) {
            throw ValidationException::withMessages([
                'password' => ['You can only change your own password.'],
            ]);
        }

        $data = $request->validate([
            'current_password'      => ['required', 'string'],
            'password'              => ['required', 'confirmed', 'different:current_password',
                                        Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        if (! Hash::check($data['current_password'], $me->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $user->update(['password' => $data['password']]);
        AdminActivityLog::record('adminuser.password_change', [], $user);
        return response()->json(['message' => 'Password changed successfully.']);
    }

    /** DELETE /admin/users/{user} — disable (don't hard-delete the last admin). */
    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot disable your own account while logged in.'], 422);
        }
        $activeCount = User::where('is_active', true)->count();
        if ($activeCount <= 1) {
            return response()->json(['message' => 'Cannot disable the last active admin.'], 422);
        }
        $user->update(['is_active' => false]);
        AdminActivityLog::record('adminuser.disable', [], $user);
        return response()->json(['message' => 'Admin disabled.']);
    }

    private function present(User $u): array
    {
        return [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'username' => $u->username,
            'role' => $u->role,
            'is_active' => $u->is_active,
            'last_login_at' => $u->last_login_at?->toIso8601String(),
            'created_at' => $u->created_at?->toIso8601String(),
        ];
    }
}
