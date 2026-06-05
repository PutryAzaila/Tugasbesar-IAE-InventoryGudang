<?php

declare(strict_types=1);

namespace App\Support;

use RuntimeException;

final class HttpClient
{
    public function json(string $url, string $authorization): array
    {
        $headers = ["Accept: application/json"];
        if ($authorization !== '') {
            $headers[] = "Authorization: {$authorization}";
        }
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 5,
                'ignore_errors' => true,
                'header' => implode("\r\n", $headers),
            ],
        ]);
        $body = file_get_contents($url, false, $context);
        $statusLine = $http_response_header[0] ?? '';
        if ($body === false || !str_contains($statusLine, '200')) {
            throw new RuntimeException("failed to fetch upstream data from {$url}");
        }
        $decoded = json_decode($body, true);
        if (!is_array($decoded)) {
            throw new RuntimeException("invalid JSON from {$url}");
        }
        return $decoded;
    }
}
