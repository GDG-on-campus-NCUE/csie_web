<?php

namespace App\Http\Requests\Manage\Teacher;

use App\Models\Post;
use Illuminate\Validation\Rule;

class UpdatePostRequest extends StorePostRequest
{
    /**
     * 取得驗證規則。
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = parent::rules();

        $post = $this->route('post');
        $postId = $post instanceof Post ? $post->getKey() : $post;

        $rules['slug'] = ['nullable', 'string', 'max:255', Rule::unique('posts', 'slug')->ignore($postId)];
        $rules['attachments'] = ['nullable', 'array', 'max:10'];
        $rules['attachments.*'] = ['file', 'max:20480'];
        $rules['keep_attachment_ids'] = ['nullable', 'array'];
        $rules['keep_attachment_ids.*'] = ['integer', 'exists:attachments,id'];

        return $rules;
    }

    /**
     * 自訂驗證錯誤訊息。
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return parent::messages() + [
            'keep_attachment_ids.*.exists' => '部分附件不存在或已被移除，請重新整理頁面後再試。',
        ];
    }

    /**
     * 在驗證前整理輸入資料。
     */
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $keepIds = $this->input('keep_attachment_ids');
        if (! is_array($keepIds)) {
            $keepIds = [];
        }

        $normalized = collect($keepIds)
            ->map(fn ($value) => (int) $value)
            ->filter(fn (int $id) => $id > 0)
            ->unique()
            ->values()
            ->all();

        $this->merge([
            'keep_attachment_ids' => $normalized,
        ]);
    }
}
