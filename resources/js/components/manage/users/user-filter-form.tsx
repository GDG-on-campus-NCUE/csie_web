import type { FormEvent } from 'react';
import { Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

import type { OptionItem, TranslatorFunction, UserFilterState } from './user-types';

interface UserFilterFormProps {
    filterState: UserFilterState;
    roleOptions: OptionItem[];
    statusOptions: OptionItem[];
    sortOptions: OptionItem[];
    perPageOptions: number[];
    hasActiveFilters: boolean;
    onChange: (key: keyof UserFilterState, value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onReset: () => void;
    t: TranslatorFunction;
    fallbackLanguage: 'zh' | 'en';
}

export function UserFilterForm({
    filterState,
    roleOptions,
    statusOptions,
    sortOptions,
    perPageOptions,
    hasActiveFilters,
    onChange,
    onSubmit,
    onReset,
    t,
    fallbackLanguage,
}: UserFilterFormProps) {
    // 依語系提供預設字串，確保中英文介面都有合適提示。
    const fallbackText = (zh: string, en: string) => (fallbackLanguage === 'zh' ? zh : en);

    return (
        <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Filter className="h-5 w-5" />
                    {t('users.index.filters.title', fallbackText('篩選條件', 'Filters'))}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={onSubmit}
                    className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4 xl:gap-6"
                >
                    <div className="flex flex-col gap-2 lg:col-span-2 xl:col-span-2">
                        <Label htmlFor="filter-q" className="text-sm font-medium text-slate-700">
                            {t('users.index.filters.keyword', fallbackText('關鍵字', 'Keyword'))}
                        </Label>
                        <Input
                            id="filter-q"
                            value={filterState.q}
                            onChange={(event) => onChange('q', event.target.value)}
                            placeholder={t(
                                'users.index.filters.keyword_placeholder',
                                fallbackText('搜尋姓名或電子郵件', 'Search name or email'),
                            )}
                        />
                    </div>

                    <fieldset className="flex flex-col gap-3 lg:col-span-2 xl:col-span-2">
                        <legend className="text-sm font-medium text-slate-700">
                            {fallbackText('建立日期', 'Created date')}
                        </legend>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="filter-created-from" className="text-xs font-medium text-slate-500">
                                    {t('users.index.filters.created_from', fallbackText('建立起始日', 'Created from'))}
                                </Label>
                                <Input
                                    id="filter-created-from"
                                    type="date"
                                    value={filterState.created_from}
                                    onChange={(event) => onChange('created_from', event.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="filter-created-to" className="text-xs font-medium text-slate-500">
                                    {t('users.index.filters.created_to', fallbackText('建立結束日', 'Created to'))}
                                </Label>
                                <Input
                                    id="filter-created-to"
                                    type="date"
                                    value={filterState.created_to}
                                    onChange={(event) => onChange('created_to', event.target.value)}
                                />
                            </div>
                        </div>
                    </fieldset>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="filter-role" className="text-sm font-medium text-slate-700">
                            {t('users.index.filters.role', fallbackText('角色', 'Role'))}
                        </Label>
                        <Select
                            id="filter-role"
                            value={filterState.role}
                            onChange={(event) => onChange('role', event.target.value)}
                        >
                            <option value="">{t('users.index.filters.all', fallbackText('全部', 'All'))}</option>
                            {roleOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="filter-status" className="text-sm font-medium text-slate-700">
                            {t('users.index.filters.status', fallbackText('狀態', 'Status'))}
                        </Label>
                        <Select
                            id="filter-status"
                            value={filterState.status}
                            onChange={(event) => onChange('status', event.target.value)}
                        >
                            <option value="">{t('users.index.filters.all', fallbackText('全部', 'All'))}</option>
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="filter-sort" className="text-sm font-medium text-slate-700">
                            {t('users.index.filters.sort', fallbackText('排序', 'Sort by'))}
                        </Label>
                        <Select
                            id="filter-sort"
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

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="filter-per-page" className="text-sm font-medium text-slate-700">
                            {t('users.index.filters.per_page', fallbackText('每頁筆數', 'Per page'))}
                        </Label>
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

                    <div className="flex flex-col gap-2 lg:col-span-2 xl:col-span-4 xl:flex-row xl:items-end xl:justify-end">
                        <Button type="submit" className="w-full rounded-full xl:w-auto">
                            {t('users.index.filters.apply', fallbackText('套用', 'Apply'))}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full rounded-full xl:w-auto"
                            disabled={!hasActiveFilters}
                            onClick={onReset}
                        >
                            {t('users.index.filters.reset', fallbackText('重設', 'Reset'))}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
