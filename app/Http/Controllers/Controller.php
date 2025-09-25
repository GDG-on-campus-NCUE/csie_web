<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

abstract class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    /**
     * Sanitize rich-text HTML content while preserving a limited set of tags.
     */
    protected function sanitizeRichText(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = trim($value);

        if ($value === '') {
            return null;
        }

        $clean = strip_tags($value, '<p><br><strong><em><u><ol><ul><li><a><blockquote>');

        // Remove inline event handlers and javascript: URLs.
        $clean = preg_replace('/\son[a-z]+="[^"]*"/i', '', $clean ?? '');
        $clean = preg_replace('/javascript:/i', '', $clean ?? '');

        // 確保清理後的內容不為空
        $clean = trim($clean ?? '');

        return $clean === '' ? null : $clean;
    }
}
