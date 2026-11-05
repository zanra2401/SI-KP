<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS scheme in production or behind HTTPS reverse proxy / Cloudflare
        $isHttpsProxy = isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower((string) $_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https';
        $isCloudflareHttps = isset($_SERVER['HTTP_CF_VISITOR']) && str_contains((string) $_SERVER['HTTP_CF_VISITOR'], '"scheme":"https"');
        $isAppUrlHttps = str_starts_with(strtolower((string) config('app.url')), 'https://');

        if ($this->app->environment('production') || $isHttpsProxy || $isCloudflareHttps || $isAppUrlHttps) {
            URL::forceScheme('https');
            if (isset($_SERVER['HTTP_HOST'])) {
                $_SERVER['HTTPS'] = 'on';
            }
        }

        // Auto-cleanup stale public/hot file in production or if Vite dev server is offline
        if (file_exists(public_path('hot'))) {
            if (! $this->app->environment('local')) {
                @unlink(public_path('hot'));
            } else {
                $hotContent = trim((string) @file_get_contents(public_path('hot')));
                $parts = parse_url($hotContent);
                $host = $parts['host'] ?? '127.0.0.1';
                $port = (int) ($parts['port'] ?? 5173);

                $targetHost = ($host === '[::1]' || $host === '::1') ? '127.0.0.1' : $host;
                $fp = @fsockopen($targetHost, $port, $errno, $errstr, 0.1);
                if (! $fp && ($host === '[::1]' || $host === '::1')) {
                    $fp = @fsockopen('::1', $port, $errno, $errstr, 0.1);
                }

                if ($fp) {
                    fclose($fp);
                } else {
                    if (file_exists(public_path('build/manifest.json'))) {
                        @unlink(public_path('hot'));
                    }
                }
            }
        }
    }
}
