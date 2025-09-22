<?php

namespace App\Http\Requests\Manage\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeacherRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware/policies
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $teacherId = $this->route('teacher')->id ?? null;

        return [
            // User relationship - optional but must exist if provided
            'user_id' => ['nullable', 'integer', 'exists:users,id'],

            // Basic contact information
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('teachers', 'email')->ignore($teacherId)
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'office' => ['nullable', 'string', 'max:100'],
            'job_title' => ['nullable', 'string', 'max:100'],
            'photo_url' => ['nullable', 'url', 'max:500'],

            // Multilingual name fields (JSON format expected)
            'name' => ['required', 'array'],
            'name.zh-TW' => ['required', 'string', 'max:100'],
            'name.en' => ['required', 'string', 'max:100'],

            // Multilingual title fields (JSON format expected)
            'title' => ['required', 'array'],
            'title.zh-TW' => ['required', 'string', 'max:100'],
            'title.en' => ['required', 'string', 'max:100'],

            // Multilingual bio fields (JSON format expected)
            'bio' => ['nullable', 'array'],
            'bio.zh-TW' => ['nullable', 'string', 'max:5000'],
            'bio.en' => ['nullable', 'string', 'max:5000'],

            // Expertise arrays (JSON format expected)
            'expertise' => ['nullable', 'array'],
            'expertise.zh-TW' => ['nullable', 'array'],
            'expertise.zh-TW.*' => ['string', 'max:100'],
            'expertise.en' => ['nullable', 'array'],
            'expertise.en.*' => ['string', 'max:100'],

            // Education arrays (JSON format expected)
            'education' => ['nullable', 'array'],
            'education.zh-TW' => ['nullable', 'array'],
            'education.zh-TW.*' => ['string', 'max:200'],
            'education.en' => ['nullable', 'array'],
            'education.en.*' => ['string', 'max:200'],

            // Additional fields
            'sort_order' => ['integer', 'min:0'],
            'visible' => ['boolean'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'user_id' => __('manage.teacher.user'),
            'email' => __('manage.teacher.email'),
            'phone' => __('manage.teacher.phone'),
            'office' => __('manage.teacher.office'),
            'job_title' => __('manage.teacher.job_title'),
            'photo_url' => __('manage.teacher.photo'),
            'name.zh-TW' => __('manage.teacher.name_zh_tw'),
            'name.en' => __('manage.teacher.name_en'),
            'title.zh-TW' => __('manage.teacher.title_zh_tw'),
            'title.en' => __('manage.teacher.title_en'),
            'bio.zh-TW' => __('manage.teacher.bio_zh_tw'),
            'bio.en' => __('manage.teacher.bio_en'),
            'expertise.zh-TW.*' => __('manage.teacher.expertise_zh_tw'),
            'expertise.en.*' => __('manage.teacher.expertise_en'),
            'education.zh-TW.*' => __('manage.teacher.education_zh_tw'),
            'education.en.*' => __('manage.teacher.education_en'),
            'sort_order' => __('manage.teacher.sort_order'),
            'visible' => __('manage.teacher.visible'),
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure proper array structure for multilingual fields
        if ($this->has('name') && !is_array($this->name)) {
            $this->merge(['name' => []]);
        }

        if ($this->has('title') && !is_array($this->title)) {
            $this->merge(['title' => []]);
        }

        if ($this->has('bio') && !is_array($this->bio)) {
            $this->merge(['bio' => []]);
        }

        if ($this->has('expertise') && !is_array($this->expertise)) {
            $this->merge(['expertise' => []]);
        }

        if ($this->has('education') && !is_array($this->education)) {
            $this->merge(['education' => []]);
        }
    }
}
