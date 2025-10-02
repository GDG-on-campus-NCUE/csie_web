<?php

namespace App\Http\Requests\Manage\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var User $target */
        $target = $this->route('user');

        return $this->user()?->can('update', $target) ?? false;
    }

    public function rules(): array
    {
        /** @var User $target */
        $target = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($target->id)],
            'locale' => ['nullable', 'string', 'max:10'],
            'role' => ['required', 'string', Rule::in(User::availableRoles())],
            'status' => ['required', 'string', Rule::in(User::allowedStatusInputs())],
            'spaces' => ['array'],
            'spaces.*' => ['integer', 'exists:spaces,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'spaces' => $this->coerceSpaces($this->input('spaces')),
        ]);
    }

    protected function coerceSpaces(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map('intval', $value)));
        }

        if (is_string($value)) {
            return array_values(array_filter(array_map('intval', explode(',', $value))));
        }

        return [];
    }
}
