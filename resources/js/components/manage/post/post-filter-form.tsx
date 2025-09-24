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
    return (
        <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Filter className="h-5 w-5" /> {t('posts.index.filters_title', '篩選條件')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                    <div className="xl:col-span-2 space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="filter-search">
                            {t('posts.index.filters.keyword', '關鍵字')}
                        </label>
                        <Input
                            id="filter-search"
                            value={filterState.search}
                            onChange={(event) => onChange('search', event.target.value)}
                            placeholder={t('posts.index.filters.keyword_placeholder', '搜尋標題或內容')}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="filter-category">
                            {t('posts.index.filters.category', '分類')}
                        </label>
                        <Select
                            id="filter-category"
                            value={filterState.category}
                            onChange={(event) => onChange('category', event.target.value)}
                        >
                            <option value="">{t('posts.index.filters.all', '全部')}</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="filter-status">
                            {t('posts.index.filters.status', '狀態')}
                        </label>
                        <Select
                            id="filter-status"
                            value={filterState.status}
                            onChange={(event) => onChange('status', event.target.value)}
                        >
                            <option value="">{t('posts.index.filters.all', '全部')}</option>
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {t(`posts.status.${status}`, statusFallbackLabels[status][fallbackLanguage])}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="filter-author">
                            {t('posts.index.filters.author', '作者')}
                        </label>
                        <Select
                            id="filter-author"
                            value={filterState.author}
                            onChange={(event) => onChange('author', event.target.value)}
                        >
                            <option value="">{t('posts.index.filters.all', '全部')}</option>
                            {authors.map((author) => (
                                <option key={author.id} value={author.id}>
                                    {author.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="filter-date-from">
                            {t('posts.index.filters.date_from', '起始日期')}
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
                            {t('posts.index.filters.date_to', '結束日期')}
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
                            {t('posts.index.filters.per_page', '每頁數量')}
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
                            {t('posts.index.filters.apply', '套用')}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={!hasActiveFilters}
                            className="w-full rounded-full"
                            onClick={onReset}
                        >
                            {t('posts.index.filters.reset', '重設')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
