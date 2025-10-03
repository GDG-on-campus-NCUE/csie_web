<?php

namespace App\Http\Controllers\Manage\User;

use App\Http\Controllers\Controller;
use App\Models\SupportFaq;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupportFaqController extends Controller
{
    /**
     * 顯示 FAQ 列表
     */
    public function index(Request $request): Response
    {
        $query = SupportFaq::query()->published();

        // 分類篩選
        if ($category = $request->input('category')) {
            $query->byCategory($category);
        }

        // 搜尋
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                    ->orWhere('answer', 'like', "%{$search}%");
            });
        }

        $faqs = $query->ordered()->get();

        // 按分類分組
        $faqsByCategory = $faqs->groupBy('category');

        // 取得所有分類
        $categories = SupportFaq::query()
            ->published()
            ->distinct()
            ->pluck('category')
            ->toArray();

        return Inertia::render('manage/user/support/faqs/index', [
            'faqs' => $faqs,
            'faqsByCategory' => $faqsByCategory,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    /**
     * 顯示 FAQ 詳情
     */
    public function show(SupportFaq $faq): Response
    {
        // 增加瀏覽次數
        $faq->incrementViews();

        // 取得相關 FAQ（同分類，排除當前）
        $relatedFaqs = SupportFaq::query()
            ->published()
            ->byCategory($faq->category)
            ->where('id', '!=', $faq->id)
            ->ordered()
            ->limit(5)
            ->get();

        return Inertia::render('manage/user/support/faqs/show', [
            'faq' => $faq,
            'relatedFaqs' => $relatedFaqs,
        ]);
    }

    /**
     * 取得分類選項
     */
    private function getCategoryOptions(): array
    {
        return SupportFaq::query()
            ->published()
            ->distinct()
            ->pluck('category')
            ->map(fn ($category) => [
                'value' => $category,
                'label' => $this->translateCategory($category),
            ])
            ->toArray();
    }

    /**
     * 翻譯分類名稱
     */
    private function translateCategory(string $category): string
    {
        return match ($category) {
            'account' => '帳號相關',
            'technical' => '技術問題',
            'feature' => '功能說明',
            'billing' => '費用問題',
            'other' => '其他',
            default => $category,
        };
    }
}
