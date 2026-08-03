<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Requires an authenticated, active admin user. Pair with the Sanctum/web
 * guard so cookies drive the session. Returns JSON 401 for SPA fetches.
 */
class AdminOnly
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user || ! ($user->isAdmin() ?? false)) {
            return response()->json([
                'message' => 'Unauthenticated. Please log in as an admin.',
            ], 401);
        }
        return $next($request);
    }
}
