<?php

namespace App\Http\Requests\Manage\Admin;

use App\Models\Attachment;
use App\Models\Post;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        /**
         * 透過路由模型繫結取得公告，並確認使用者是否具備更新權限。
         */
        /** @var \App\Models\Post $post */
        $post = $this->route('post');

        return $post ? $this->user()?->can('update', $post) ?? false : false;
    }

    protected function prepareForValidation(): void
    {
        /**
         * 預先清理 slug 與時間欄位，避免空字串造成驗證誤判。
         */
        /** @var \App\Models\Post|null $post */
        $post = $this->route('post');
        $slug = $this->input('slug');
        $publishedAt = $this->input('published_at');
        $tags = $this->input('tags');

        $this->merge([
            'slug' => $slug === '' ? null : $slug,
            'published_at' => $publishedAt === '' ? null : $publishedAt,
            'post_id' => $post?->id,
            'tags' => $this->normalizeTags($tags),
        ]);
    }

    public function rules(): array
    {
    // 取得公告編號與 morph 別名，後續驗證僅接受統一別名格式。
    $postId = $this->input('post_id');

    /** @var \App\Models\Post|null $post */
    $post = $this->route('post');
    $morphAlias = $post?->getMorphClass() ?? (new Post())->getMorphClass();

        return [
            'title' => ['required', 'string', 'max:255'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('posts', 'slug')
                    ->whereNull('deleted_at')
                    ->ignore($postId),
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
            'attachments.keep' => ['nullable', 'array'],
            'attachments.keep.*' => [
                'integer',
                Rule::exists('attachments', 'id')->where(fn ($query) => $query
                    ->where('attached_to_type', $morphAlias)
                    ->whereNull('deleted_at')),
            ],
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
            /** @var \App\Models\Post|null $post */
            $post = $this->route('post');
            if (! $post) {
                return;
            }

            $keepIds = collect($this->input('attachments.keep', []))
                ->filter()
                ->map(fn ($id) => (int) $id)
                ->values()
                ->all();

            $keptCount = 0;
            if (! empty($keepIds)) {
                $keptCount = $post->attachments()
                    ->whereIn('id', $keepIds)
                    ->count();
            }

            $total = $keptCount + $this->countFileAttachments() + $this->countLinkAttachments();

            if ($total > 10) {
                $validator->errors()->add('attachments', __('manage.posts.form.validation.attachments_limit', ['max' => 10]));
            }
        });
    }

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
