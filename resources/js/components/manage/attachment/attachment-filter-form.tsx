import type { FormEvent } from 'react';
import { Filter } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

import type {
    AttachmentFilterState,
    SortOption,
    TranslatorFunction,
} from './attachment-types';

interface AttachmentFilterFormProps {
    filterState: AttachmentFilterState;
    typeOptions: string[];
    visibilityOptions: string[];
    attachedTypeOptions: string[];
    perPageOptions: number[];
    sortOptions: SortOption[];
    hasActiveFilters: boolean;
    onChange: (key: keyof AttachmentFilterState, value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onReset: () => void;
    t: TranslatorFunction;
    fallbackLanguage: 'zh' | 'en';
}

// 依據語系切換備援文案，避免翻譯缺漏時出現混雜語言。
const fallbackText = (language: 'zh' | 'en', zh: string, en: string) => (language === 'zh' ? zh : en);

export function AttachmentFilterForm({
    filterState,
    typeOptions,
    visibilityOptions,
    attachedTypeOptions,
    perPageOptions,
    sortOptions,
    hasActiveFilters,
    onChange,
    onSubmit,
    onReset,
    t,
    fallbackLanguage,
}: AttachmentFilterFormProps) {
    return (
        <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Filter className="h-5 w-5" />
                    {t('attachments.index.filters_title', fallbackText(fallbackLanguage, '篩選條件', 'Filters'))}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* 將篩選欄位整理成表單，讓父層專注於狀態與資料請求。 */}
                <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                    <div className="xl:col-span-2 space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="attachment-filter-search">
                            {t('attachments.index.filters.search', fallbackText(fallbackLanguage, '搜尋附件', 'Search attachments'))}
                        </label>
                        <Input
                            id="attachment-filter-search"
                            value={filterState.search}
                            onChange={(event) => onChange('search', event.target.value)}
                            placeholder={t(
                                'attachments.index.filters.search_placeholder',
                                fallbackText(fallbackLanguage, '輸入標題、檔名或 MIME', 'Enter title, filename or MIME'),
                            )}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="attachment-filter-type">
                            {t('attachments.index.filters.type', fallbackText(fallbackLanguage, '附件類型', 'Attachment type'))}
                        </label>
                        <Select
                            id="attachment-filter-type"
                            value={filterState.type}
                            onChange={(event) => onChange('type', event.target.value)}
                        >
                            <option value="">
                                {t('attachments.index.filters.all_types', fallbackText(fallbackLanguage, '全部類型', 'All types'))}
                            </option>
                            {typeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {t(`attachments.type.${option}`, option)}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="attachment-filter-visibility">
                            {t('attachments.index.filters.visibility', fallbackText(fallbackLanguage, '公開狀態', 'Visibility'))}
                        </label>
                        <Select
                            id="attachment-filter-visibility"
                            value={filterState.visibility}
                            onChange={(event) => onChange('visibility', event.target.value)}
                        >
                            <option value="">
                                {t(
                                    'attachments.index.filters.active_only',
                                    fallbackText(fallbackLanguage, '僅顯示現存', 'Active only'),
                                )}
                            </option>
                            {visibilityOptions.map((option) => (
                                <option key={option} value={option}>
                                    {t(`attachments.visibility.${option}`, fallbackText(fallbackLanguage, option, option))}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="attachment-filter-attached-type">
                            {t('attachments.index.filters.attachable', fallbackText(fallbackLanguage, '來源資料', 'Source type'))}
                        </label>
                        <Select
                            id="attachment-filter-attached-type"
                            value={filterState.attached_to_type}
                            onChange={(event) => onChange('attached_to_type', event.target.value)}
                        >
                            <option value="">
                                {t('attachments.index.filters.all_sources', fallbackText(fallbackLanguage, '全部來源', 'All sources'))}
                            </option>
                            {attachedTypeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option.split('\\').pop() ?? option}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="attachment-filter-attached-id">
                            {t('attachments.index.filters.source_id', fallbackText(fallbackLanguage, '來源 ID', 'Source ID'))}
                        </label>
                        <Input
                            id="attachment-filter-attached-id"
                            value={filterState.attached_to_id}
                            inputMode="numeric"
                            onChange={(event) => onChange('attached_to_id', event.target.value)}
                            placeholder={t(
                                'attachments.index.filters.source_id_placeholder',
                                fallbackText(fallbackLanguage, '輸入來源資料 ID', 'Enter source ID'),
                            )}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="attachment-filter-trashed">
                            {t('attachments.index.filters.trashed', fallbackText(fallbackLanguage, '刪除範圍', 'Trashed scope'))}
                        </label>
                        <Select
                            id="attachment-filter-trashed"
                            value={filterState.trashed}
                            onChange={(event) => onChange('trashed', event.target.value)}
                        >
                            <option value="">
                                {t('attachments.index.filters.active_only', fallbackText(fallbackLanguage, '僅顯示現存', 'Active only'))}
                            </option>
                            <option value="with">
                                {t('attachments.index.filters.include_deleted', fallbackText(fallbackLanguage, '含已刪除', 'Include deleted'))}
                            </option>
                            <option value="only">
                                {t('attachments.index.filters.deleted_only', fallbackText(fallbackLanguage, '僅已刪除', 'Deleted only'))}
                            </option>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="attachment-filter-sort">
                            {t('attachments.index.filters.sort', fallbackText(fallbackLanguage, '排序方式', 'Sort by'))}
                        </label>
                        <Select
                            id="attachment-filter-sort"
                            value={filterState.sort}
                            onChange={(event) => onChange('sort', event.target.value)}
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="attachment-filter-per-page">
                            {t('attachments.index.filters.per_page', fallbackText(fallbackLanguage, '每頁數量', 'Per page'))}
                        </label>
                        <Select
                            id="attachment-filter-per-page"
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
                            {t('attachments.index.filters.apply', fallbackText(fallbackLanguage, '套用', 'Apply'))}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full rounded-full"
                            disabled={!hasActiveFilters}
                            onClick={onReset}
                        >
                            {t('attachments.index.filters.reset', fallbackText(fallbackLanguage, '重設', 'Reset'))}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
