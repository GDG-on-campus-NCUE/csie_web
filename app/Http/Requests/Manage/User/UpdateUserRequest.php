<?php

namespace App\Http\Requests\Manage\User;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->route('user');

        if ($user instanceof User) {
            return $this->user()?->can('update', $user) ?? false;
        }

        return false;
    }

    /**
     * 取得驗證規則。
     */
    public function rules(): array
    {
        /** @var User $target */
        $target = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($target->id)->withoutTrashed(),
            ],
            'role' => ['required', Rule::in(['admin', 'manager', 'teacher', 'user'])],
            'status' => ['required', Rule::in(['active', 'suspended'])],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['nullable'],
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
            'role' => '角色',
            'status' => '狀態',
            'password' => '密碼',
            'password_confirmation' => '密碼確認',
        ];
    }
}
