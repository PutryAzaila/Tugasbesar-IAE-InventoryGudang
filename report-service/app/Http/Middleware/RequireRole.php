<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Support\JwtVerifier;
use App\Support\Request;
use App\Support\Response;

final class RequireRole
{
    public function __construct(private readonly array $allowedRoles)
    {
    }

    public function handle(Request $request): bool
    {
        $claims = (new JwtVerifier(getenv('JWT_SECRET') ?: 'change-me-in-production'))->verify($request->authorization());
        if ($claims === null) {
            Response::json(['error' => 'invalid token'], 401);
            return false;
        }
        if (!in_array($claims['role'] ?? '', $this->allowedRoles, true)) {
            Response::json(['error' => 'role is not allowed'], 403);
            return false;
        }
        $request->setUser($claims);
        return true;
    }
}
