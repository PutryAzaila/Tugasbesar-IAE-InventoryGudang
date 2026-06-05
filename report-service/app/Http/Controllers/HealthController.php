<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Support\Request;
use App\Support\Response;

final class HealthController
{
    public function show(Request $request): void
    {
        Response::json(['status' => 'ok', 'service' => 'report-service']);
    }
}
