import type { FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import type { AuthorOption, CategoryOption, FilterState, PostStatus, TranslatorFunction } from './post-types';
import { statusFallbackLabels } from './post-types';

// 篩選器拆成組件，讓父層僅需負責狀態管理與資料串接。
interface PostFilterFormProps {
    filterState: FilterState;
    categories: CategoryOption[];
    statusOptions: PostStatus[];
    authors: AuthorOption[];
    perPageOptions: number[];
    hasActiveFilters: boolean;
    onChange: (key: keyof FilterState, value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onReset: () => void;
    t: TranslatorFunction;
    fallbackLanguage: 'zh' | 'en';
}

export function PostFilterForm({
    filterState,
    categories,
    statusOptions,
    authors,
    perPageOptions,
    hasActiveFilters,
    onChange,
    onSubmit,
    onReset,
    t,
    fallbackLanguage,
}: PostFilterFormProps) {
    // 依語系提供對應預設文案，避免英文介面顯示中文字。
    const fallbackText = (zh: string, en: string) => (fallbackLanguage === 'zh' ? zh : en);

    return (
        <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Filter className="h-5 w-5" />
                    {t('posts.index.filters_title', fallbackText('篩選條件', 'Filters'))}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                    <div className="xl:col-span-2 space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="filter-search">
                            {t('posts.index.filters.keyword', fallbackText('關鍵字', 'Keyword'))}
                        </label>
                        <Input
                            id="filter-search"
                            value={filterState.search}
                            onChange={(event) => onChange('search', event.target.value)}
                            placeholder={t(
                                'posts.index.filters.keyword_placeholder',
                                fallbackText('搜尋標題或內容', 'Search title or content')
                            )}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="filter-category">
                            {t('posts.index.filters.category', fallbackText('分類', 'Category'))}
                        </label>
                        <Select
                            id="filter-category"
                            value={filterState.category}
                            onChange={(event) => onChange('category', event.target.value)}
                        >
                            <option value="">{t('posts.index.filters.all', fallbackText('全部', 'All'))}</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="filter-status">
                            {t('posts.index.filters.status', fallbackText('狀態', 'Status'))}
                        </label>
                        <Select
                            id="filter-status"
                            value={filterState.status}
                            onChange={(event) => onChange('status', event.target.value)}
                        >
                            <option value="">{t('posts.index.filters.all', fallbackText('全部', 'All'))}</option>
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {t(`posts.status.${status}`, statusFallbackLabels[status][fallbackLanguage])}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="filter-author">
                            {t('posts.index.filters.author', fallbackText('作者', 'Author'))}
                        </label>
                        <Select
                            id="filter-author"
                            value={filterState.author}
                            onChange={(event) => onChange('author', event.target.value)}
                        >
                            <option value="">{t('posts.index.filters.all', fallbackText('全部', 'All'))}</option>
                            {authors.map((author) => (
                                <option key={author.id} value={author.id}>
                                    {author.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="filter-date-from">
                            {t('posts.index.filters.date_from', fallbackText('起始日期', 'Start date'))}
                        </label>
                        <Input
                            id="filter-date-from"
                            type="date"
                            value={filterState.date_from}
                            onChange={(event) => onChange('date_from', event.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="filter-date-to">
                            {t('posts.index.filters.date_to', fallbackText('結束日期', 'End date'))}
                        </label>
                        <Input
                            id="filter-date-to"
                            type="date"
                            value={filterState.date_to}
                            onChange={(event) => onChange('date_to', event.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="filter-per-page">
                            {t('posts.index.filters.per_page', fallbackText('每頁數量', 'Per page'))}
                        </label>
                        <Select
                            id="filter-per-page"
                            value={filterState.per_page}
                            onChange={(event) => onChange('per_page', event.target.value)}
                        >
                            {perPageOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex items-end gap-2">
                        <Button type="submit" className="w-full rounded-full">
                            {t('posts.index.filters.apply', fallbackText('套用', 'Apply'))}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={!hasActiveFilters}
                            className="w-full rounded-full"
                            onClick={onReset}
                        >
                            {t('posts.index.filters.reset', fallbackText('重設', 'Reset'))}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
