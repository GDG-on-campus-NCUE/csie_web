<?php

namespace App\Http\Controllers\Api;

use App\Models\Attachment;
use App\Repositories\Contracts\BaseRepository;
use Illuminate\Http\Request;

class AttachmentController extends BaseApiController
{
    public function __construct()
    {
        parent::__construct(app(BaseRepository::class, ['model' => new Attachment()]));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'attached_to_type' => 'required|string',
            'attached_to_id' => 'required|integer',
            'type' => 'required|string|in:image,document,link',
            'title' => 'nullable|string',
            'filename' => 'nullable|string',
            'disk' => 'nullable|string',
            'disk_path' => 'nullable|string',
            'file_url' => 'nullable|string',
            'external_url' => 'nullable|string',
            'mime_type' => 'nullable|string',
            'size' => 'nullable|integer',
            'uploaded_by' => 'nullable|integer|exists:users,id',
            'visibility' => 'nullable|in:public,private',
            'alt_text' => 'nullable|string',
            'alt_text_en' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);
        $m = $this->service->create($data);
        return response()->json($m, 201);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'type' => 'sometimes|string|in:image,document,link',
            'title' => 'nullable|string',
            'filename' => 'nullable|string',
            'disk' => 'nullable|string',
            'disk_path' => 'nullable|string',
            'file_url' => 'nullable|string',
            'external_url' => 'nullable|string',
            'mime_type' => 'nullable|string',
            'size' => 'nullable|integer',
            'uploaded_by' => 'nullable|integer|exists:users,id',
            'visibility' => 'nullable|in:public,private',
            'alt_text' => 'nullable|string',
            'alt_text_en' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);
        $m = $this->service->update($id, $data);
        abort_if(!$m, 404);
        return response()->json($m);
    }
}

