<?php

namespace App\Http\Requests\Manage\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    /**
     * 判斷使用者是否有權限發出此請求。
     */
    public function authorize(): bool
    {
        return $this->user()->role === 'admin' || $this->user()->role === 'teacher';
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
            'title_en' => ['nullable', 'string', 'max:255'],
            'sponsor' => ['required', 'string', 'max:255'],
            'principal_investigator' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'total_budget' => ['nullable', 'integer', 'min:0'],
            'summary' => ['nullable', 'string', 'max:5000'],
            'funding_source' => ['nullable', 'string', 'max:255'],
            'amount' => ['nullable', 'integer', 'min:0'], // 別名，轉為 total_budget
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'space_id' => ['nullable', 'exists:spaces,id'],
            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*' => ['integer', 'exists:attachments,id'],
        ];
    }

    /**
     * 取得自訂的驗證訊息。
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => '計畫名稱為必填欄位。',
            'sponsor.required' => '執行單位為必填欄位。',
            'principal_investigator.required' => '主持人為必填欄位。',
            'start_date.required' => '開始日期為必填欄位。',
            'end_date.after_or_equal' => '結束日期必須在開始日期之後。',
            'total_budget.min' => '經費金額不能為負數。',
            'attachments.max' => '最多只能上傳 10 個附件。',
        ];
    }

    /**
     * 準備資料以進行驗證。
     */
    protected function prepareForValidation(): void
    {
        // 將 amount 轉為 total_budget（支援兩種欄位名）
        if ($this->has('amount') && ! $this->has('total_budget')) {
            $this->merge([
                'total_budget' => $this->input('amount'),
            ]);
        }
    }
}
