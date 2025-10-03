<?php

namespace App\Http\Requests\Manage\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * 更新個人資料請求驗證
 */
class UpdateProfileRequest extends FormRequest
{
    /**
     * 判斷使用者是否有權限提出此請求
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * 取得驗證規則
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'office' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'bio_en' => ['nullable', 'string', 'max:1000'],
            'expertise' => ['nullable', 'array'],
            'expertise.*' => ['string', 'max:255'],
            'education' => ['nullable', 'array'],
            'education.*' => ['string', 'max:500'],
            'profile_photo' => ['nullable', 'image', 'max:2048'], // 2MB
            'links' => ['nullable', 'array', 'max:10'],
            'links.*.type' => ['required', 'string', Rule::in(['website', 'github', 'linkedin', 'twitter', 'facebook', 'scholar', 'researchgate', 'orcid', 'other'])],
            'links.*.label' => ['nullable', 'string', 'max:100'],
            'links.*.url' => ['required', 'url', 'max:500'],
        ];
    }

    /**
     * 自訂驗證錯誤訊息
     */
    public function messages(): array
    {
        return [
            'name.required' => '請輸入姓名。',
            'name.max' => '姓名長度不得超過 255 個字元。',
            'phone.max' => '電話號碼長度不得超過 50 個字元。',
            'bio.max' => '個人簡介長度不得超過 1000 個字元。',
            'profile_photo.image' => '頭像必須是圖片檔案。',
            'profile_photo.max' => '頭像檔案大小不得超過 2MB。',
            'links.max' => '連結最多僅能新增 10 個。',
            'links.*.url.required' => '請輸入連結網址。',
            'links.*.url.url' => '請輸入有效的網址格式。',
        ];
    }

    /**
     * 在驗證前整理輸入資料
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => $this->string('name')->trim()->toString(),
            'name_en' => $this->string('name_en')->trim()->toString() ?: null,
            'title' => $this->string('title')->trim()->toString() ?: null,
            'title_en' => $this->string('title_en')->trim()->toString() ?: null,
            'phone' => $this->string('phone')->trim()->toString() ?: null,
            'office' => $this->string('office')->trim()->toString() ?: null,
            'bio' => $this->string('bio')->toString() ?: null,
            'bio_en' => $this->string('bio_en')->toString() ?: null,
        ]);
    }
}
