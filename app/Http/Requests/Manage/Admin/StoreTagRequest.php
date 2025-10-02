<?php

namespace App\Http\Requests\Manage\Admin;

use App\Models\Tag;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Tag::class) ?? false;
    }

    /**
     * @return array<string, array<int, string|\Illuminate\Contracts\Validation\Rule> | string>
     */
    public function rules(): array
    {
        return [
            'context' => ['required', 'string', Rule::in(array_keys(Tag::CONTEXTS))],
            'name' => ['required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'max:32', 'regex:/^(#?[0-9a-fA-F]{3,8}|[a-zA-Z][\w\-:.\/]+)$/'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => $this->string('name')->trim()->toString(),
            'name_en' => $this->string('name_en')->trim()->toString() ?: null,
            'description' => $this->string('description')->trim()->toString() ?: null,
            'color' => $this->string('color')->trim()->toString() ?: null,
            'context' => $this->string('context')->trim()->toString(),
        ]);
    }
}
