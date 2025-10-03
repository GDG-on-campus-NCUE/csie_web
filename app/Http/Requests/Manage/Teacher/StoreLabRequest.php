<?php

namespace App\Http\Requests\Manage\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class StoreLabRequest extends FormRequest
{
    /**
     * 判斷使用者是否有權限執行此請求。
     */
    public function authorize(): bool
    {
        return in_array($this->user()->role, ['admin', 'teacher']);
    }

    /**
     * 取得驗證規則。
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'field' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'description' => ['nullable', 'string', 'max:5000'],
            'description_en' => ['nullable', 'string', 'max:5000'],
            'equipment_summary' => ['nullable', 'string', 'max:2000'],
            'website_url' => ['nullable', 'url', 'max:500'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'cover_image_url' => ['nullable', 'url', 'max:500'],
            'members' => ['nullable', 'array'],
            'members.*' => ['exists:users,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'visible' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * 取得驗證錯誤訊息。
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => '實驗室名稱為必填欄位',
            'name.max' => '實驗室名稱不得超過 255 個字元',
            'field.required' => '研究領域為必填欄位',
            'capacity.integer' => '容量必須為整數',
            'capacity.min' => '容量至少為 1',
            'website_url.url' => '網站網址格式不正確',
            'contact_email.email' => 'Email 格式不正確',
            'members.*.exists' => '選擇的成員不存在',
        ];
    }

    /**
     * 準備資料以進行驗證。
     */
    protected function prepareForValidation(): void
    {
        // 確保 visible 是布林值
        if ($this->has('visible')) {
            $this->merge([
                'visible' => filter_var($this->input('visible'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }
}

