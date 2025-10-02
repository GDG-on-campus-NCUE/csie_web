<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentDownloadController extends Controller
{
    /**
     * 下載附件或轉址至外部連結。
     */
    public function __invoke(Request $request, Attachment $attachment)
    {
        $this->authorize('view', $attachment);

        if ($attachment->external_url) {
            return redirect()->away($attachment->external_url);
        }

        if ($attachment->file_url && str_starts_with($attachment->file_url, 'http')) {
            return redirect()->away($attachment->file_url);
        }

        $disk = $attachment->disk ?: 'public';
        $path = $attachment->disk_path;

        if (! $path || ! Storage::disk($disk)->exists($path)) {
            abort(404);
        }

        $filename = $attachment->filename ?: basename($path);

        return Storage::disk($disk)->download($path, $filename);
    }
}
