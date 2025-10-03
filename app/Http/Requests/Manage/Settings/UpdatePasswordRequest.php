<?php

namespace App\Http\Requests\Manage\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

/**
 * 更新密碼請求驗證
 */
class UpdatePasswordRequest extends FormRequest
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
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }

    /**
     * 自訂驗證錯誤訊息
     */
    public function messages(): array
    {
        return [
            'current_password.required' => '請輸入目前的密碼。',
            'current_password.current_password' => '目前的密碼不正確。',
            'password.required' => '請輸入新密碼。',
            'password.confirmed' => '新密碼與確認密碼不相符。',
        ];
    }
}
