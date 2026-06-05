<?php

declare(strict_types=1);

namespace App\Support;

final class Router
{
    private array $routes = [];

    public function get(string $path, array $handler, array $middleware = []): void
    {
        $this->routes['GET'][$path] = [$handler, $middleware];
    }

    public function handle(): void
    {
        $request = new Request();
        $route = $this->routes[$request->method()][$request->path()] ?? null;
        if ($route === null) {
            Response::json(['error' => 'route not found'], 404);
            return;
        }

        [$handler, $middleware] = $route;
        foreach ($middleware as $item) {
            if (!$item->handle($request)) {
                return;
            }
        }

        [$class, $method] = $handler;
        (new $class())->{$method}($request);
    }
}
