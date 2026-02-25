<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }
        return $next($request);
    }

    protected function unauthenticated($request, array $guards)
{
    throw new \Illuminate\Auth\AuthenticationException(
        'Unauthenticated.',
        $guards,
        $request->expectsJson() ? null : null
    );
}
}
