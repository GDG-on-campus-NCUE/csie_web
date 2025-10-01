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
     * 請求驗證前的資料預處理，確保角色與狀態格式一致。
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
            'roles' => ['sometimes', 'array', 'min:1'],
            'roles.*' => ['string', Rule::in(User::allowedRoleInputs())],
            'role' => ['required', 'string', Rule::in(User::allowedRoleInputs())],
            'status' => ['required', 'string', Rule::in(User::allowedStatusInputs())],
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
            'roles' => '角色',
            'roles.*' => '角色',
            'status' => '狀態',
            'password' => '密碼',
            'password_confirmation' => '密碼確認',
        ];
    }
}
