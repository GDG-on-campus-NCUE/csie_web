<?php

namespace App\Http\Requests\Manage\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStaffRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && in_array($this->user()->role, ['admin', 'teacher']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $staffId = $this->route('staff')->id;

        return [
            'name' => 'required|array',
            'name.zh-TW' => 'required|string|max:100',
            'name.en' => 'nullable|string|max:100',

            'position' => 'required|array',
            'position.zh-TW' => 'required|string|max:100',
            'position.en' => 'nullable|string|max:100',

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('staff', 'email')->ignore($staffId)
            ],
            'phone' => 'nullable|string|max:20',
            'office' => 'nullable|string|max:100',

            'bio' => 'nullable|array',
            'bio.zh-TW' => 'nullable|string|max:1000',
            'bio.en' => 'nullable|string|max:1000',

            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'visible' => 'boolean',
            'sort_order' => 'integer|min:0',
            'classroom_ids' => 'array',
            'classroom_ids.*' => 'integer|exists:classrooms,id',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name.zh-TW' => '姓名 (繁體中文)',
            'name.en' => '姓名 (英文)',
            'position.zh-TW' => '職位 (繁體中文)',
            'position.en' => '職位 (英文)',
            'email' => '電子郵件',
            'phone' => '電話',
            'office' => '辦公室',
            'bio.zh-TW' => '簡介 (繁體中文)',
            'bio.en' => '簡介 (英文)',
            'avatar' => '頭像',
            'visible' => '顯示狀態',
            'sort_order' => '排序',
            'classroom_ids' => '教室指派',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => '姓名為必填欄位',
            'name.zh-TW.required' => '繁體中文姓名為必填欄位',
            'position.required' => '職位為必填欄位',
            'position.zh-TW.required' => '繁體中文職位為必填欄位',
            'email.required' => '電子郵件為必填欄位',
            'email.email' => '請輸入有效的電子郵件地址',
            'email.unique' => '此電子郵件已被使用',
            'avatar.image' => '頭像必須是圖片檔案',
            'avatar.mimes' => '頭像僅支援 JPEG、PNG、JPG、GIF 格式',
            'avatar.max' => '頭像檔案大小不得超過 2MB',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // 確保 visible 有預設值
        if (!$this->has('visible')) {
            $this->merge(['visible' => true]);
        }

        // 確保 sort_order 有預設值
        if (!$this->has('sort_order')) {
            $this->merge(['sort_order' => 0]);
        }

        // 清理空的多語言欄位
        if ($this->has('name')) {
            $this->merge(['name' => array_filter($this->name ?? [])]);
        }

        if ($this->has('position')) {
            $this->merge(['position' => array_filter($this->position ?? [])]);
        }

        if ($this->has('bio')) {
            $this->merge(['bio' => array_filter($this->bio ?? [])]);
        }
    }
}
