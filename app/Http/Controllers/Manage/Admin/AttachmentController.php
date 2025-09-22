<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AttachmentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Attachment::query()->with(['attachedTo', 'uploader']);

        $search = trim((string) ($request->input('q') ?? $request->input('search') ?? ''));
        if ($search !== '') {
            $query->where(function ($inner) use ($search) {
                $inner
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('filename', 'like', "%{$search}%")
                    ->orWhere('external_url', 'like', "%{$search}%")
                    ->orWhere('mime_type', 'like', "%{$search}%");
            });
        }

        $type = $request->input('type');
        if (in_array($type, ['image', 'document', 'link'], true)) {
            $query->where('type', $type);
        }

        $visibility = $request->input('visibility');
        if (in_array($visibility, [Attachment::VISIBILITY_PUBLIC, Attachment::VISIBILITY_AUTHORIZED, Attachment::VISIBILITY_PRIVATE], true)) {
            $query->where('visibility', $visibility);
        }

        $attachedType = trim((string) $request->input('attached_to_type', ''));
        if ($attachedType !== '') {
            $query->where('attached_to_type', $attachedType);
        }

        if ($request->filled('attached_to_id')) {
            $query->where('attached_to_id', (int) $request->input('attached_to_id'));
        }

        if ($request->filled('uploaded_by')) {
            $query->where('uploaded_by', (int) $request->input('uploaded_by'));
        }

        $createdFrom = trim((string) $request->input('created_from'));
        if ($createdFrom !== '') {
            try {
                $from = Carbon::parse($createdFrom)->startOfDay();
                $query->where('created_at', '>=', $from);
            } catch (\Throwable) {
                // ignore invalid date
            }
        }

        $createdTo = trim((string) $request->input('created_to'));
        if ($createdTo !== '') {
            try {
                $to = Carbon::parse($createdTo)->endOfDay();
                $query->where('created_at', '<=', $to);
            } catch (\Throwable) {
                // ignore invalid date
            }
        }

        $trashed = $request->input('trashed');
        if ($trashed === 'with') {
            $query->withTrashed();
        } elseif ($trashed === 'only') {
            $query->onlyTrashed();
        }

        $perPageOptions = [10, 20, 50];
        $perPage = (int) $request->input('per_page', 20);
        if (! in_array($perPage, $perPageOptions, true)) {
            $perPage = 20;
        }

        $attachments = $query
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(function (Attachment $attachment) {
                $attachable = $attachment->attachedTo;

                return [
                    'id' => $attachment->id,
                    'type' => $attachment->type,
                    'title' => $attachment->title,
                    'filename' => $attachment->filename,
                    'disk_path' => $attachment->disk_path,
                    'mime_type' => $attachment->mime_type,
                    'size' => $attachment->size,
                    'visibility' => $attachment->visibility,
                    'external_url' => $attachment->external_url,
                    'attached_to_type' => $attachment->attached_to_type,
                    'attached_to_id' => $attachment->attached_to_id,
                    'download_url' => route('public.attachments.download', $attachment),
                    'created_at' => optional($attachment->created_at)?->toIso8601String(),
                    'updated_at' => optional($attachment->updated_at)?->toIso8601String(),
                    'deleted_at' => optional($attachment->deleted_at)?->toIso8601String(),
                    'attachable' => $attachable ? [
                        'type' => $attachment->attached_to_type ? class_basename($attachment->attached_to_type) : null,
                        'id' => method_exists($attachable, 'getKey') ? $attachable->getKey() : null,
                        'label' => $attachable->title
                            ?? $attachable->name
                            ?? $attachable->slug
                            ?? (method_exists($attachable, 'getKey') && $attachable->getKey() !== null ? '#' . $attachable->getKey() : null),
                    ] : null,
                    'uploader' => $attachment->uploader ? [
                        'id' => $attachment->uploader->id,
                        'name' => $attachment->uploader->name,
                        'email' => $attachment->uploader->email,
                    ] : null,
                ];
            });

        $attachableTypes = Attachment::query()
            ->withTrashed()
            ->select('attached_to_type')
            ->distinct()
            ->pluck('attached_to_type')
            ->filter()
            ->values();

        return Inertia::render('manage/admin/attachments/index', [
            'attachments' => $attachments,
            'filters' => $request->only([
                'q',
                'search',
                'type',
                'visibility',
                'attached_to_type',
                'attached_to_id',
                'uploaded_by',
                'created_from',
                'created_to',
                'trashed',
                'per_page',
            ]),
            'typeOptions' => ['image', 'document', 'link'],
            'visibilityOptions' => [
                Attachment::VISIBILITY_PUBLIC,
                Attachment::VISIBILITY_AUTHORIZED,
                Attachment::VISIBILITY_PRIVATE,
            ],
            'attachableTypeOptions' => $attachableTypes,
            'perPageOptions' => $perPageOptions,
        ]);
    }

    public function destroy(Request $request, Attachment $attachment): RedirectResponse
    {
        $this->authorize('delete', $attachment);

        $attachment->delete();

        return back()->with('success', '附件已移至回收桶');
    }

    public function restore(Request $request, int $attachment): RedirectResponse
    {
        $record = Attachment::withTrashed()->findOrFail($attachment);
        $this->authorize('restore', $record);

        $record->restore();

        return back()->with('success', '附件已復原');
    }

    public function forceDelete(Request $request, int $attachment): RedirectResponse
    {
        $record = Attachment::withTrashed()->findOrFail($attachment);
        $this->authorize('forceDelete', $record);

        $this->deletePhysicalFiles(new EloquentCollection([$record]));
        $record->forceDelete();

        return back()->with('success', '附件已永久刪除');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:attachments,id'],
        ]);

        $attachments = Attachment::query()->whereIn('id', $validated['ids'])->get();
        foreach ($attachments as $attachment) {
            $this->authorize('delete', $attachment);
            $attachment->delete();
        }

        return back()->with('success', '選取的附件已刪除');
    }

    private function deletePhysicalFiles(EloquentCollection $attachments): void
    {
        foreach ($attachments as $attachment) {
            $path = $attachment->disk_path;
            if ($path && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }
}

