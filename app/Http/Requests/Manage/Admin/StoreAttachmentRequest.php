<?php

namespace App\Http\Requests\Manage\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 附件上傳請求驗證。
 * 驗證上傳的檔案類型、大小，以及基本資訊（標題、可見性）。
 */
class StoreAttachmentRequest extends FormRequest
{
    /**
     * 判斷使用者是否有權限執行此請求。
     */
    public function authorize(): bool
    {
        // 由 AttachmentPolicy 統一管理權限，這裡總是返回 true
        return true;
    }

    /**
     * 定義驗證規則。
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:' . config('filesystems.max_upload_size', 10240), // 預設最大 10MB
                'mimes:' . config('filesystems.allowed_mimes', 'pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,gif,zip,rar'),
            ],
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'visibility' => 'nullable|in:public,private',
            'space_id' => 'nullable|integer|exists:spaces,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ];
    }

    /**
     * 定義自訂錯誤訊息。
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => '請選擇要上傳的檔案。',
            'file.file' => '上傳的檔案無效。',
            'file.max' => '檔案大小不能超過 :max KB。',
            'file.mimes' => '檔案類型不支援，僅允許：:values。',
            'title.string' => '標題格式無效。',
            'title.max' => '標題長度不能超過 :max 字元。',
            'description.string' => '描述格式無效。',
            'description.max' => '描述長度不能超過 :max 字元。',
            'visibility.in' => '可見性設定無效，僅支援 public 或 private。',
            'space_id.integer' => 'Space ID 格式無效。',
            'space_id.exists' => '指定的 Space 不存在。',
            'tags.array' => '標籤格式無效。',
            'tags.*.string' => '每個標籤必須是字串。',
            'tags.*.max' => '標籤長度不能超過 :max 字元。',
        ];
    }
}
