<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttachmentDownloadController extends Controller
{
    public function redirect(Request $request, Attachment $attachment): RedirectResponse|StreamedResponse
    {
        if (!$this->authorizedToDownload($request, $attachment)) {
            abort(403);
        }

        if (!empty($attachment->external_url) && ($attachment->type === 'link' || empty($attachment->disk_path))) {
            return redirect()->away($attachment->external_url, 302);
        }

        return $this->streamFile($attachment);
    }

    public function download(Request $request, Attachment $attachment): RedirectResponse|StreamedResponse
    {
        if (!$this->authorizedToDownload($request, $attachment)) {
            abort(403);
        }

        if (!empty($attachment->disk_path)) {
            return $this->streamFile($attachment);
        }

        if (!empty($attachment->external_url)) {
            return redirect()->away($attachment->external_url, 302);
        }

        abort(404);
    }

    private function streamFile(Attachment $attachment): StreamedResponse
    {
        $path = ltrim((string) $attachment->disk_path, '/');
        if ($path === '') {
            abort(404);
        }

        try {
            if (!Storage::disk('public')->exists($path)) {
                abort(404);
            }

            $downloadName = $attachment->filename
                ?: $attachment->title
                ?: basename($path);

            $headers = [];
            if (!empty($attachment->mime_type)) {
                $headers['Content-Type'] = $attachment->mime_type;
            }

            return Storage::disk('public')->download($path, $downloadName, $headers);
        } catch (FileNotFoundException) {
            abort(404);
        }
    }

    private function authorizedToDownload(Request $request, Attachment $attachment): bool
    {
        if ($attachment->visibility === Attachment::VISIBILITY_PUBLIC) {
            return true;
        }

        $user = $request->user();

        if ($attachment->visibility === Attachment::VISIBILITY_AUTHORIZED) {
            return $user !== null;
        }

        if (!$user) {
            return false;
        }

        return Gate::forUser($user)->allows('download', $attachment);
    }
}

