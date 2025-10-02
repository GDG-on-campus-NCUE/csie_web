<?php

namespace App\Http\Requests\Manage\Admin;

use App\Models\Tag;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MergeTagsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', Tag::class) ?? false;
    }

    /**
     * @return array<string, array<int, string|\Illuminate\Contracts\Validation\Rule> | string>
     */
    public function rules(): array
    {
        return [
            'target_id' => ['required', 'integer', Rule::exists('tags', 'id')],
            'source_ids' => ['required', 'array', 'min:1'],
            'source_ids.*' => ['integer', Rule::exists('tags', 'id')],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $targetId = (int) $this->input('target_id');
            $sourceIds = collect($this->input('source_ids', []))
                ->map(fn ($value) => (int) $value)
                ->unique()
                ->reject(fn (int $id) => $id === $targetId)
                ->values();

            $target = Tag::query()->find($targetId);
            $sources = $sourceIds->isEmpty()
                ? collect()
                : Tag::query()->whereIn('id', $sourceIds)->get();

            if ($target === null) {
                $validator->errors()->add('target_id', __('選取的保留標籤不存在。'));

                return;
            }

            if ($sources->isEmpty()) {
                $validator->errors()->add('source_ids', __('至少需選擇一個要合併的標籤。'));

                return;
            }

            $mismatched = $sources->first(fn (Tag $tag) => $tag->context !== $target->context);

            if ($mismatched) {
                $validator->errors()->add('source_ids', __('僅能合併相同模組的標籤。'));

                return;
            }

            $this->merge([
                'source_ids' => $sourceIds->all(),
                'target_tag' => $target,
                'source_tags' => $sources,
            ]);
        });
    }
}
