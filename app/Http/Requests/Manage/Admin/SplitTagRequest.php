<?php

namespace App\Http\Requests\Manage\Admin;

use App\Models\Tag;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Collection;

class SplitTagRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tag = $this->route('tag');

        if ($tag instanceof Tag) {
            return $this->user()?->can('update', $tag) ?? false;
        }

        $tagId = (int) $this->input('tag_id');
        $found = Tag::query()->find($tagId);

        return $found ? ($this->user()?->can('update', $found) ?? false) : false;
    }

    /**
     * @return array<string, array<int, string|\Illuminate\Contracts\Validation\Rule> | string>
     */
    public function rules(): array
    {
        return [
            'tag_id' => ['required', 'integer', 'exists:tags,id'],
            'names' => ['required', 'string'],
            'keep_original' => ['sometimes', 'boolean'],
            'color' => ['nullable', 'string', 'max:32', 'regex:/^(#?[0-9a-fA-F]{3,8}|[a-zA-Z][\w\-:.\/]+)$/'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'tag_id' => $this->integer('tag_id'),
            'names' => $this->string('names')->trim()->toString(),
            'color' => $this->string('color')->trim()->toString() ?: null,
            'keep_original' => $this->boolean('keep_original'),
        ]);
    }

    /**
     * @return array<int, string>
     */
    public function parsedNames(): array
    {
        $raw = $this->string('names')->toString();

        return Collection::make(preg_split('/[,\n]/u', $raw) ?: [])
            ->map(fn ($value) => trim((string) $value))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }
}
