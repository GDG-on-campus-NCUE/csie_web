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
     * 請求驗證前的資料預處理，將角色陣列轉換為主要角色字串。
     */
    protected function prepareForValidation(): void
    {
        $roles = $this->input('roles');

        if (is_string($roles)) {
            $roles = [$roles];
        }

        if (is_array($roles)) {
            $normalizedRoles = collect($roles)
                ->filter(fn ($role) => is_string($role) && $role !== '')
                ->map(fn ($role) => strtolower($role))
                ->values();

            $this->merge(['roles' => $normalizedRoles->all()]);

            if ($normalizedRoles->isNotEmpty()) {
                $this->merge(['role' => $normalizedRoles->first()]);
            }
        }

        if (is_string($this->input('role'))) {
            $this->merge(['role' => strtolower($this->input('role'))]);
        }

        if (is_string($this->input('status'))) {
            $this->merge(['status' => strtolower($this->input('status'))]);
        }
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
            'roles' => ['sometimes', 'array', 'min:1'],
            'roles.*' => ['string', Rule::in(User::allowedRoleInputs())],
            'role' => ['required', 'string', Rule::in(User::allowedRoleInputs())],
            'status' => ['required', 'string', Rule::in(User::allowedStatusInputs())],
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
            'role' => '角色',
            'roles' => '角色',
            'roles.*' => '角色',
            'status' => '狀態',
            'password' => '密碼',
            'password_confirmation' => '密碼確認',
        ];
    }
}
