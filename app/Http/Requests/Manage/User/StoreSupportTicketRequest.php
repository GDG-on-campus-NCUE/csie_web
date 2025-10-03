<?php

namespace App\Http\Requests\Manage\User;

use App\Models\SupportTicket;
use Illuminate\Foundation\Http\FormRequest;

class StoreSupportTicketRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'subject' => 'required|string|max:255',
            'category' => 'required|string|in:' . implode(',', [
                SupportTicket::CATEGORY_TECHNICAL,
                SupportTicket::CATEGORY_ACCOUNT,
                SupportTicket::CATEGORY_FEATURE,
                SupportTicket::CATEGORY_OTHER,
            ]),
            'priority' => 'nullable|string|in:' . implode(',', [
                SupportTicket::PRIORITY_LOW,
                SupportTicket::PRIORITY_MEDIUM,
                SupportTicket::PRIORITY_HIGH,
                SupportTicket::PRIORITY_URGENT,
            ]),
            'message' => 'required|string|min:20',
            'attachment_ids' => 'nullable|array|max:5',
            'attachment_ids.*' => 'exists:attachments,id',
            'tag_ids' => 'nullable|array|max:5',
            'tag_ids.*' => 'exists:tags,id',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'subject' => '主旨',
            'category' => '分類',
            'priority' => '優先級',
            'message' => '問題描述',
            'attachment_ids' => '附件',
            'tag_ids' => '標籤',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'subject.required' => '請輸入主旨',
            'subject.max' => '主旨不能超過 255 個字元',
            'category.required' => '請選擇分類',
            'category.in' => '分類選項無效',
            'priority.in' => '優先級選項無效',
            'message.required' => '請輸入問題描述',
            'message.min' => '問題描述至少需要 20 個字元',
            'attachment_ids.max' => '最多只能上傳 5 個附件',
            'tag_ids.max' => '最多只能選擇 5 個標籤',
        ];
    }
}
