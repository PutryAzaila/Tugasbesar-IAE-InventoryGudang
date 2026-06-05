<?php

declare(strict_types=1);

namespace App\Support;

final class Request
{
    private array $user = [];

    public function method(): string
    {
        return $_SERVER['REQUEST_METHOD'] ?? 'GET';
    }

    public function path(): string
    {
        return parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    }

    public function query(string $key, string $default = ''): string
    {
        return isset($_GET[$key]) ? (string) $_GET[$key] : $default;
    }

    public function authorization(): string
    {
        return $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    }

    public function setUser(array $user): void
    {
        $this->user = $user;
    }

    public function user(): array
    {
        return $this->user;
    }
}
