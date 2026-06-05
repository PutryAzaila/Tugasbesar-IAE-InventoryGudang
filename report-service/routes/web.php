<?php

declare(strict_types=1);

use App\Http\Controllers\HealthController;
use App\Http\Controllers\ReportController;
use App\Http\Middleware\RequireRole;
use App\Support\Router;

return static function (Router $router): void {
    $router->get('/health', [HealthController::class, 'show']);
    $router->get('/reports/summary', [ReportController::class, 'summary'], [new RequireRole(['admin'])]);
};
