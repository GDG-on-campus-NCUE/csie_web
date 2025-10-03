<?php

namespace App\Http\Requests\Manage\Teacher;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePostRequest extends FormRequest
{
    /**
     * 判斷使用者是否有權限提出此請求。
     */
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'teacher'], true);
    }

    /**
     * 取得驗證規則。
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('posts', 'slug')],
            'status' => ['required', Rule::in(['draft', 'scheduled', 'published', 'archived'])],
            'category_id' => ['required', 'exists:post_categories,id'],
            'space_id' => ['nullable', 'integer', 'exists:spaces,id'],
            'summary' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'target_audience' => ['nullable', 'string', 'max:255'],
            'course_start_at' => ['nullable', 'date'],
            'course_end_at' => ['nullable', 'date', 'after_or_equal:course_start_at'],
            'published_at' => ['nullable', 'date'],
            'tags' => ['nullable', 'string', 'max:500'],
            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*' => ['file', 'max:20480'], // 20 MB
        ];
    }

    /**
     * 自訂驗證錯誤訊息。
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => '請輸入公告標題。',
            'title.max' => '公告標題長度不得超過 255 個字元。',
            'slug.unique' => 'Slug 已被使用，請換一個識別名稱。',
            'status.in' => '公告狀態不在允許的選項內。',
            'category_id.required' => '請選擇課程分類。',
            'category_id.exists' => '選擇的課程分類不存在。',
            'content.required' => '請輸入公告內容。',
            'course_end_at.after_or_equal' => '課程結束時間須晚於開始時間。',
            'attachments.max' => '附件最多僅能上傳 10 個。',
            'attachments.*.file' => '附件必須為有效的檔案。',
            'attachments.*.max' => '單一附件檔案大小不可超過 20 MB。',
        ];
    }

    /**
     * 在驗證前整理輸入資料。
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'title' => $this->string('title')->trim()->toString(),
            'slug' => $this->string('slug')->trim()->toString() ?: null,
            'target_audience' => $this->string('target_audience')->trim()->toString() ?: null,
            'summary' => $this->string('summary')->toString() ?: null,
            'content' => $this->string('content')->toString(),
            'tags' => $this->normalizeTags($this->input('tags')),
            'course_start_at' => $this->normalizeDate($this->input('course_start_at')),
            'course_end_at' => $this->normalizeDate($this->input('course_end_at')),
            'published_at' => $this->normalizeDate($this->input('published_at')),
        ]);
    }

    /**
     * 將逗號分隔的標籤字串標準化。
     */
    private function normalizeTags(mixed $value): ?string
    {
        if (is_array($value)) {
            $value = implode(',', $value);
        }

        if (! is_string($value)) {
            return null;
        }

        $tags = collect(explode(',', $value))
            ->map(fn (string $tag) => trim($tag))
            ->filter()
            ->unique()
            ->values()
            ->all();

        if (empty($tags)) {
            return null;
        }

        return implode(',', $tags);
    }

    /**
     * 正規化日期字串。
     */
    private function normalizeDate(mixed $value): ?string
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->format('Y-m-d H:i:s');
        }

        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
