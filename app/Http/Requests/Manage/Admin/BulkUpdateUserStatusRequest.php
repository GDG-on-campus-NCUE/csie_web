<?php

namespace App\Http\Requests\Manage\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkUpdateUserStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['integer', 'distinct', 'exists:users,id'],
            'status' => ['required', 'string', Rule::in(User::allowedStatusInputs())],
        ];
    }
}
