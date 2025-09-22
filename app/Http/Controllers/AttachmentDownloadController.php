<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttachmentDownloadController extends Controller
{
    // GET /attachments/{attachment}
    public function redirect(Attachment $attachment): RedirectResponse|HttpResponse|StreamedResponse
    {
        Gate::authorize('view', $attachment);

        // Prefer external link when present
        if (!empty($attachment->external_url)) {
            return redirect()->away($attachment->external_url, 302);
        }
        return $this->download($attachment);
    }

    // GET /attachments/{attachment}/download
    public function download(Attachment $attachment): RedirectResponse|HttpResponse|StreamedResponse
    {
        Gate::authorize('view', $attachment);

        $fileUrl = (string) ($attachment->file_url ?? '');

        // Absolute URL -> external redirect
        if ($fileUrl !== '' && preg_match('#^https?://#i', $fileUrl)) {
            return redirect()->away($fileUrl, 302);
        }

        if ($attachment->disk && $attachment->disk_path) {
            try {
                $downloadName = $attachment->title ?? $attachment->filename ?? basename($attachment->disk_path);
                $headers = [];
                if (!empty($attachment->mime_type)) {
                    $headers['Content-Type'] = $attachment->mime_type;
                }

                if (Storage::disk($attachment->disk)->exists($attachment->disk_path)) {
                    return Storage::disk($attachment->disk)->download($attachment->disk_path, $downloadName, $headers);
                }
            } catch (FileNotFoundException) {
                // Fallback to legacy handler below
            }
        }

        // Normalize public disk path
        $path = ltrim($fileUrl, '/');
        if ($path === '') {
            // Nothing to serve; fall back to external if any
            if (!empty($attachment->external_url)) {
                return redirect()->away($attachment->external_url, 302);
            }
            abort(404);
        }

        // Map common prefixes to the public disk
        // Examples: storage/legacy/.. or legacy/..
        $path = preg_replace('#^storage/#', '', $path); // public/storage symlink prefix

        try {
            if (!Storage::disk('public')->exists($path)) {
                // Try legacy symlink path if user stored '/legacy/...'
                $alt = preg_replace('#^legacy/#', '', $path, 1, $count);
                if ($count > 0 && Storage::disk('public')->exists('legacy/'.$alt)) {
                    $path = 'legacy/'.$alt;
                } else {
                    // Last resort: redirect to raw URL (may be a symlink path under /legacy)
                    return redirect('/'.$fileUrl, 302);
                }
            }

            $downloadName = $attachment->title ?: basename($path);
            $headers = [];
            if (!empty($attachment->mime_type)) {
                $headers['Content-Type'] = $attachment->mime_type;
            }
            return Storage::disk('public')->download($path, $downloadName, $headers);
        } catch (FileNotFoundException $e) {
            abort(404);
        }
    }
}

