<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

/**
 * Admin SPA authentication via Sanctum cookies.
 *
 * Every DB-touching path is wrapped so the endpoint NEVER returns a bare 500.
 * If the database isn't configured (file missing, tables not migrated, etc.),
 * we return a clear 503 with a developer-friendly message instead.
 */
class AuthController extends Controller
{
    /**
     * Public auth endpoints are stateless JSON. They are exempted from CSRF
     * in bootstrap/app.php (see $middleware->validateCsrfTokens(except:)).
     * login() establishes the session on success; protected admin routes
     * still require that session cookie.
     *
     * Rate-limit login attempts to slow brute-force attacks.
     */
    public function __construct()
    {
        $this->middleware('throttle:60,1')->only(['login']);
    }

    /** POST /api/admin/login — CSRF-exempt, returns JSON with {success, message}. */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email_or_username' => ['required', 'string'],
            'password'          => ['required', 'string'],
        ]);

        // --- Guard: is the database actually ready? ---
        if (($ready = $this->databaseReady()) !== true) {
            return response()->json([
                'success'      => false,
                'message'      => $ready,   // friendly setup hint
                'reason_code'  => 'database_not_configured',
            ], 503);
        }

        try {
            $identifier = $data['email_or_username'];
            $user = User::where('email', $identifier)
                ->orWhere('username', $identifier)
                ->first();

            if (! $user || ! $user->is_active ||
                ! Auth::attempt(['email' => $user->email, 'password' => $data['password']], true)
            ) {
                // Same message regardless of which part failed → no user enumeration.
                // Direct 401 JSON (not a 422 ValidationException) so the frontend
                // gets a clean "invalid creds" message with no CSRF baggage.
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid username or password.',
                ], 401);
            }

            $request->session()->regenerate();
            $user->update(['last_login_at' => now()]);
            AdminActivityLog::record('admin.login', ['email' => $user->email]);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data'    => $this->present($user),
            ]);
        } catch (QueryException $e) {
            logger()->error('Admin login DB error', ['error' => $e->getMessage()]);
            return response()->json([
                'success'     => false,
                'message'     => 'Database file is missing. Please run setup.bat or setup.sh.',
                'reason_code' => 'database_not_configured',
            ], 503);
        } catch (\Throwable $e) {
            // Catch-all so the endpoint NEVER returns a bare 500 to the user.
            logger()->error('Admin login failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success'     => false,
                'message'     => 'Login could not be completed. Please try again.',
                'reason_code' => 'login_error',
            ], 500);
        }
    }

    /** POST /admin/logout */
    public function logout(Request $request): JsonResponse
    {
        try {
            AdminActivityLog::record('admin.logout');
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        } catch (\Throwable $e) {
            // Best-effort — logout should never fail visibly.
        }
        return response()->json(['message' => 'Logged out.']);
    }

    /** GET /admin/me */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated. Please log in as an admin.',
                'reason_code' => 'unauthenticated',
            ], 401);
        }
        return response()->json(['data' => $this->present($user)]);
    }

    /**
     * GET /admin/health — quick DB + migrations readiness check.
     * Returns 200 if everything's wired up, 503 otherwise.
     * The frontend uses this to show setup guidance.
     */
    public function health(): JsonResponse
    {
        $ready = $this->databaseReady();
        if ($ready === true) {
            return response()->json([
                'status' => 'ok',
                'database' => 'configured',
                'admin_user_seeded' => User::where('username', 'admin')->exists(),
            ]);
        }
        return response()->json([
            'status' => 'error',
            'message' => $ready,
            'reason_code' => 'database_not_configured',
        ], 503);
    }

    private function present(User $u): array
    {
        return [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'username' => $u->username,
            'role' => $u->role,
            'last_login_at' => $u->last_login_at?->toIso8601String(),
        ];
    }

    /**
     * Returns true if the DB is reachable AND the users table exists.
     * Otherwise returns a string explaining what's wrong + how to fix it.
     * Messages match the spec exactly (no destructive migrate:fresh).
     */
    private function databaseReady(): bool|string
    {
        // 1. Is the SQLite file itself present?
        $dbPath = config('database.connections.sqlite.database');
        if ($dbPath && $dbPath !== ':memory:' && ! file_exists($dbPath)) {
            return 'Database file is missing. Please run setup.bat or setup.sh.';
        }

        try {
            if (! Schema::hasTable('users')) {
                return 'Database tables are missing. Please run php artisan migrate --seed.';
            }
            return true;
        } catch (QueryException $e) {
            $msg = $e->getMessage();
            if (str_contains($msg, 'no such table') || str_contains($msg, 'users')) {
                return 'Database tables are missing. Please run php artisan migrate --seed.';
            }
            // Unable to open file / corrupt / permissions
            return 'Database file is missing. Please run setup.bat or setup.sh.';
        } catch (\Throwable $e) {
            return 'Database file is missing. Please run setup.bat or setup.sh.';
        }
    }
}
