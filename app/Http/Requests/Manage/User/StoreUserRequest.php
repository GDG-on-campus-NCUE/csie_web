<?php

namespace App\Http\Requests\Manage\User;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', User::class) ?? false;
    }

    /**
     * 取得驗證規則。
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->withoutTrashed(),
            ],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', Rule::exists('roles', 'name')],
            'status' => ['required', Rule::in(['active', 'suspended'])],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required_with:password'],
            'email_verified' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * 自訂欄位名稱，方便錯誤訊息顯示。
     */
    public function attributes(): array
    {
        return [
            'name' => '姓名',
            'email' => '電子郵件',
            'roles' => '角色',
            'roles.*' => '角色',
            'status' => '狀態',
            'password' => '密碼',
            'password_confirmation' => '密碼確認',
        ];
    }
}
