<?php

declare(strict_types=1);

require dirname(__DIR__) . '/vendor/autoload.php';
if (!class_exists('FPDF')) {
    require dirname(__DIR__) . '/vendor/setasign/fpdf/fpdf.php';
}

use App\Support\Router;

$router = new Router();
(require dirname(__DIR__) . '/routes/web.php')($router);

return $router;
