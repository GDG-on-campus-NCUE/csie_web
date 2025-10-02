<?php

namespace App\Http\Requests\Manage\Admin;

use App\Models\Post;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Post::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $slug = $this->input('slug');
        $publishedAt = $this->input('published_at');
        $tags = $this->input('tags');

        $this->merge([
            'slug' => $slug === '' ? null : $slug,
            'published_at' => $publishedAt === '' ? null : $publishedAt,
            'tags' => $this->normalizeTags($tags),
        ]);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('posts', 'slug')->whereNull('deleted_at'),
            ],
            'category_id' => ['required', 'integer', 'exists:post_categories,id'],
            'space_id' => ['nullable', 'integer', 'exists:spaces,id'],
            'excerpt' => ['nullable', 'string'],
            'excerpt_en' => ['nullable', 'string'],
            'summary' => ['nullable', 'string'],
            'summary_en' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'content_en' => ['nullable', 'string'],
            'status' => ['required', Rule::in(array_keys(Post::STATUS_MAP))],
            'visibility' => ['nullable', Rule::in(array_keys(Post::VISIBILITY_MAP))],
            'published_at' => ['nullable', 'date', 'required_if:status,scheduled'],
            'expire_at' => ['nullable', 'date', 'after:published_at'],
            'pinned' => ['nullable', 'boolean'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
            'attachments' => ['nullable', 'array'],
            'attachments.files' => ['nullable', 'array'],
            'attachments.files.*' => ['file', 'max:20480'],
            'attachments.links' => ['nullable', 'array'],
            'attachments.links.*.title' => ['required', 'string', 'max:255'],
            'attachments.links.*.url' => ['required', 'url', 'max:2048'],
            'featured_image' => ['nullable', 'image', 'max:5120'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $total = $this->countFileAttachments() + $this->countLinkAttachments();
            if ($total > 10) {
                $validator->errors()->add('attachments', __('manage.posts.form.validation.attachments_limit', ['max' => 10]));
            }
        });
    }

    /**
     * 將標籤輸入正規化為陣列。
     */
    private function normalizeTags(mixed $input): array
    {
        if (is_string($input)) {
            $items = explode(',', $input);
        } elseif (is_array($input) || $input instanceof \Traversable) {
            $items = (array) $input;
        } else {
            return [];
        }

        return collect($items)
            ->map(fn ($value) => trim((string) $value))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    private function countFileAttachments(): int
    {
        $files = $this->allFiles('attachments.files');

        return is_array($files) ? count(array_filter($files)) : 0;
    }

    private function countLinkAttachments(): int
    {
        return collect($this->input('attachments.links', []))
            ->filter(fn ($link) => filled(data_get($link, 'title')) && filled(data_get($link, 'url')))
            ->count();
    }
}
