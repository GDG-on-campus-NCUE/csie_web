<?php

namespace App\Http\Controllers\Api;

use App\Models\Attachment;
use App\Repositories\Contracts\BaseRepository;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AttachmentController extends BaseApiController
{
    public function __construct()
    {
        parent::__construct(app(BaseRepository::class, ['model' => new Attachment()]));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'attached_to_type' => ['required', 'string'],
            'attached_to_id' => ['required', 'integer'],
            'type' => ['required', Rule::in(['image', 'document', 'link'])],
            'title' => ['nullable', 'string'],
            'filename' => ['nullable', 'string'],
            'disk_path' => ['nullable', 'string'],
            'external_url' => ['nullable', 'string'],
            'mime_type' => ['nullable', 'string'],
            'size' => ['nullable', 'integer'],
            'visibility' => ['nullable', Rule::in([Attachment::VISIBILITY_PUBLIC, Attachment::VISIBILITY_AUTHORIZED, Attachment::VISIBILITY_PRIVATE])],
            'alt_text' => ['nullable', 'string'],
            'alt_text_en' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        if (! isset($data['visibility'])) {
            $data['visibility'] = Attachment::VISIBILITY_PUBLIC;
        }

        if ($request->user()) {
            $data['uploaded_by'] = $request->user()->id;
        }

        $record = $this->service->create($data);

        return response()->json($record, 201);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'type' => ['sometimes', Rule::in(['image', 'document', 'link'])],
            'title' => ['nullable', 'string'],
            'filename' => ['nullable', 'string'],
            'disk_path' => ['nullable', 'string'],
            'external_url' => ['nullable', 'string'],
            'mime_type' => ['nullable', 'string'],
            'size' => ['nullable', 'integer'],
            'visibility' => ['nullable', Rule::in([Attachment::VISIBILITY_PUBLIC, Attachment::VISIBILITY_AUTHORIZED, Attachment::VISIBILITY_PRIVATE])],
            'alt_text' => ['nullable', 'string'],
            'alt_text_en' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        if ($request->user() && ! isset($data['uploaded_by'])) {
            $data['uploaded_by'] = $request->user()->id;
        }

        $record = $this->service->update($id, $data);
        abort_if(! $record, 404);

        return response()->json($record);
    }
}

