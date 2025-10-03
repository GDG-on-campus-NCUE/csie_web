<?php

namespace App\Http\Requests\Manage\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * 更新外觀設定請求驗證
 */
class UpdateAppearanceRequest extends FormRequest
{
    /**
     * 判斷使用者是否有權限提出此請求
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * 取得驗證規則
     */
    public function rules(): array
    {
        return [
            'theme' => ['required', Rule::in(['light', 'dark', 'system'])],
            'font_size' => ['required', Rule::in(['small', 'medium', 'large'])],
            'sidebar_pinned' => ['required', 'boolean'],
            'language' => ['required', Rule::in(['zh-TW', 'en'])],
        ];
    }

    /**
     * 自訂驗證錯誤訊息
     */
    public function messages(): array
    {
        return [
            'theme.required' => '請選擇主題。',
            'theme.in' => '主題選項無效。',
            'font_size.required' => '請選擇字體大小。',
            'font_size.in' => '字體大小選項無效。',
            'language.required' => '請選擇語言。',
            'language.in' => '語言選項無效。',
        ];
    }
}
