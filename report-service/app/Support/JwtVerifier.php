<?php

declare(strict_types=1);

namespace App\Support;

final class JwtVerifier
{
    public function __construct(private readonly string $secret)
    {
    }

    public function verify(string $authorization): ?array
    {
        if (!str_starts_with($authorization, 'Bearer ')) {
            return null;
        }
        $parts = explode('.', substr($authorization, 7));
        if (count($parts) !== 3) {
            return null;
        }
        $header = json_decode($this->base64UrlDecode($parts[0]), true);
        if (($header['alg'] ?? '') !== 'HS256') {
            return null;
        }
        $expected = $this->base64UrlEncode(hash_hmac('sha256', $parts[0] . '.' . $parts[1], $this->secret, true));
        if (!hash_equals($expected, $parts[2])) {
            return null;
        }
        $claims = json_decode($this->base64UrlDecode($parts[1]), true);
        if (!is_array($claims)) {
            return null;
        }
        if (isset($claims['exp']) && time() > (int) $claims['exp']) {
            return null;
        }
        return $claims;
    }

    private function base64UrlDecode(string $value): string
    {
        return base64_decode(strtr($value, '-_', '+/')) ?: '';
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
