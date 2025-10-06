import { useEffect, useMemo, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import FilterPanel from '@/components/manage/filter-panel';
import ResponsiveDataView from '@/components/manage/responsive-data-view';
import DataCard from '@/components/manage/data-card';
import FormField from '@/components/manage/forms/form-field';
import TableEmpty from '@/components/manage/table-empty';
import ManageToolbar from '@/components/manage/manage-toolbar';
import StatusFilterTabs from '@/components/manage/status-filter-tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ToastContainer from '@/components/ui/toast-container';
import { useTranslator } from '@/hooks/use-translator';
import useToast from '@/hooks/use-toast';
import { formatDateTime } from '@/lib/shared/format';
import { apiClient, isManageApiError } from '@/lib/manage/api-client';
import { cn } from '@/lib/shared/utils';
import type { ManageTag, ManageTagAbilities, ManageTagFilterOptions, ManageTagFilterState, ManageTagListResponse } from '@/types/manage';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { useCallback } from 'react';
import { useRef } from 'react';
import {
    CalendarClock,
    CheckSquare,
    ClipboardList,
    Droplet,
    Edit3,
    Filter,
    FolderTree,
    GitMerge,
    Hash,
    MoreHorizontal,
    Plus,
    RefreshCcw,
    SplitSquareVertical,
} from 'lucide-react';

type ManageAdminTagsPageProps = SharedData & {
    tags: ManageTagListResponse;
    filters: ManageTagFilterState;
    filterOptions: ManageTagFilterOptions;
    abilities: ManageTagAbilities;
};

type FilterFormState = {
    keyword: string;
    status: string;
    context: string;
    per_page: string;
};

type FilterOverrides = Partial<FilterFormState> & { page?: number };

type TagFormValues = {
    context: string;
    name: string;
    name_en: string;
    description: string;
    color: string;
    is_active: boolean;
};

type TagFormErrors = Partial<Record<keyof TagFormValues, string>>;

type TagFormDialogMode = 'create' | 'edit';

interface TagFormDialogProps {
    mode: TagFormDialogMode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contexts: ManageTagFilterOptions['contexts'];
    initialValues: TagFormValues;
    disableContext?: boolean;
    onSubmit: (values: TagFormValues, helpers: { setErrors: (errors: TagFormErrors) => void }) => Promise<boolean>;
}

interface MergeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedTags: ManageTag[];
    onSubmit: (targetId: number) => Promise<boolean>;
}

interface SplitDialogProps {
    open: boolean;
    tag: ManageTag | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (names: string, keepOriginal: boolean) => Promise<boolean>;
}

const PER_PAGE_OPTIONS = ['10', '20', '50'] as const;

function ensureHexColor(value: string | null | undefined): string | undefined {
    if (!value) {
        return undefined;
    }

    if (value.startsWith('#')) {
        return value;
    }

    return undefined;
}

export default function ManageAdminTagsIndex() {
    const page = usePage<ManageAdminTagsPageProps>();
    const { tags, filters, filterOptions, abilities } = page.props;
    const locale = page.props.locale ?? 'zh-TW';
    const pagination = tags.meta;

    const { t } = useTranslator('manage');
    const { t: tTags } = useTranslator('manage.tags');
    const { toasts, showSuccess, showError, showWarning, dismissToast } = useToast();

    const tagIdSignature = useMemo(() => tags.data.map(tag => tag.id).join('-'), [tags.data]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.admin.tags', '標籤管理'),
            href: '/manage/admin/tags',
        },
    ];

    const pageTitle = t('sidebar.admin.tags', '標籤管理');

    const defaultFilterForm = useMemo<FilterFormState>(() => ({
        keyword: filters.keyword ?? '',
        status: filters.status ?? '',
        context: filters.context ?? '',
        per_page: filters.per_page ? String(filters.per_page) : PER_PAGE_OPTIONS[0],
    }), [filters.keyword, filters.status, filters.context, filters.per_page]);

    const [filterForm, setFilterForm] = useState<FilterFormState>(defaultFilterForm);
    const [lastKeyword, setLastKeyword] = useState(defaultFilterForm.keyword);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [editTag, setEditTag] = useState<ManageTag | null>(null);
    const [mergeOpen, setMergeOpen] = useState(false);
    const [splitTag, setSplitTag] = useState<ManageTag | null>(null);
    const keywordTimer = useRef<number | null>(null);

    useEffect(() => {
        setFilterForm(defaultFilterForm);
        setLastKeyword(defaultFilterForm.keyword);
    }, [defaultFilterForm]);

    useEffect(() => {
        setSelectedIds([]);
    }, [tags.meta.current_page, tagIdSignature]);

    const handleFilterChange = (field: keyof FilterFormState, value: string) => {
        setFilterForm(prev => ({ ...prev, [field]: value }));
    };

    const applyFilters = useCallback((overrides: FilterOverrides = {}, options: { replace?: boolean } = {}) => {
        const payload: Record<string, string | number | null> = {
            keyword: (overrides.keyword ?? filterForm.keyword) || null,
            status: (overrides.status ?? filterForm.status) || null,
            context: (overrides.context ?? filterForm.context) || null,
            per_page: overrides.per_page ? Number(overrides.per_page) : Number(filterForm.per_page) || null,
        };

        if (typeof overrides.page === 'number') {
            payload.page = overrides.page;
        }

        router.get('/manage/admin/tags', payload, {
            preserveScroll: true,
            preserveState: true,
            replace: options.replace ?? false,
        });
    }, [filterForm.context, filterForm.keyword, filterForm.per_page, filterForm.status]);

    useEffect(() => {
        if (filterForm.keyword === lastKeyword) {
            return;
        }

        if (keywordTimer.current) {
            window.clearTimeout(keywordTimer.current);
        }

        keywordTimer.current = window.setTimeout(() => {
            applyFilters({ keyword: filterForm.keyword }, { replace: true });
            setLastKeyword(filterForm.keyword);
        }, 400);

        return () => {
            if (keywordTimer.current) {
                window.clearTimeout(keywordTimer.current);
            }
        };
    }, [applyFilters, filterForm.keyword, lastKeyword]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(tags.data.map(tag => tag.id));
        } else {
            setSelectedIds([]);
        }
    };

    const toggleSelected = (tagId: number, checked: boolean) => {
        setSelectedIds(prev => {
            if (checked) {
                return prev.includes(tagId) ? prev : [...prev, tagId];
            }
            return prev.filter(id => id !== tagId);
        });
    };

    const headerCheckboxState: boolean | 'indeterminate' = selectedIds.length === 0
        ? false
        : selectedIds.length === tags.data.length
            ? true
            : 'indeterminate';

    const selectedTags = useMemo(() => tags.data.filter(tag => selectedIds.includes(tag.id)), [selectedIds, tags.data]);

    const openEditDialog = (tag: ManageTag) => {
        setEditTag(tag);
    };

    const toggleActivation = async (tag: ManageTag) => {
        if (!abilities.canUpdate) {
            return;
        }

        try {
            await apiClient.put(`/admin/tags/${tag.id}`, {
                name: tag.name,
                name_en: tag.name_en ?? '',
                description: tag.description ?? '',
                color: tag.color ?? '',
                is_active: !tag.is_active,
            });
            showSuccess(tag.is_active ? tTags('toast.disabled', '已停用標籤') : tTags('toast.enabled', '已啟用標籤'));
            router.reload({ only: ['tags'] });
        } catch (error) {
            if (isManageApiError(error)) {
                showError(tTags('toast.update_failed', '更新狀態失敗'), error.message);
            }
        }
    };

    const handleCreate: TagFormDialogProps['onSubmit'] = async (values, { setErrors }) => {
        try {
            await apiClient.post('/admin/tags', {
                context: values.context,
                name: values.name,
                name_en: values.name_en || null,
                description: values.description || null,
                color: values.color || null,
                is_active: values.is_active,
            });
            showSuccess(tTags('toast.created', '標籤已建立'));
            router.reload({ only: ['tags', 'filterOptions'] });
            return true;
        } catch (error) {
            if (isManageApiError(error)) {
                const fieldErrors: TagFormErrors = {};
                for (const [field, messages] of Object.entries(error.errors ?? {})) {
                    fieldErrors[field as keyof TagFormValues] = messages[0] ?? error.message;
                }
                setErrors(fieldErrors);
                showError(tTags('toast.create_failed', '新增失敗'), error.message);
            } else {
                showError(tTags('toast.create_failed', '新增失敗'), tTags('toast.retry', '請稍後再試。'));
            }
            return false;
        }
    };

    const handleUpdate: TagFormDialogProps['onSubmit'] = async (values, { setErrors }) => {
        if (!editTag) {
            return false;
        }

        try {
            await apiClient.put(`/admin/tags/${editTag.id}`, {
                name: values.name,
                name_en: values.name_en || null,
                description: values.description || null,
                color: values.color || null,
                is_active: values.is_active,
            });
            showSuccess(tTags('toast.updated', '標籤已更新'));
            setEditTag(null);
            router.reload({ only: ['tags'] });
            return true;
        } catch (error) {
            if (isManageApiError(error)) {
                const fieldErrors: TagFormErrors = {};
                for (const [field, messages] of Object.entries(error.errors ?? {})) {
                    fieldErrors[field as keyof TagFormValues] = messages[0] ?? error.message;
                }
                setErrors(fieldErrors);
                showError('更新失敗', error.message);
            } else {
                showError('更新失敗', '請稍後再試。');
            }
            return false;
        }
    };

    const handleMerge = async (targetId: number) => {
        if (selectedIds.length < 2) {
            showWarning(tTags('toast.select_minimum', '請先選擇至少兩個標籤'));
            return false;
        }

        try {
            await apiClient.post('/admin/tags/merge', {
                target_id: targetId,
                source_ids: selectedIds,
            });
            showSuccess(tTags('toast.merged', '標籤合併完成'));
            setSelectedIds([]);
            router.reload({ only: ['tags'] });
            return true;
        } catch (error) {
            if (isManageApiError(error)) {
                showError(tTags('toast.merge_failed', '合併失敗'), error.message);
            } else {
                showError(tTags('toast.merge_failed', '合併失敗'), tTags('toast.retry', '請稍後再試。'));
            }
            return false;
        }
    };

    const handleSplit = async (names: string, keepOriginal: boolean) => {
        if (!splitTag) {
            return false;
        }

        if (!names.trim()) {
            showWarning(tTags('toast.split_required', '請輸入至少一個新標籤名稱'));
            return false;
        }

        try {
            await apiClient.post('/admin/tags/split', {
                tag_id: splitTag.id,
                names,
                keep_original: keepOriginal,
            });
            showSuccess(tTags('toast.split_created', '已建立新標籤'));
            setSplitTag(null);
            router.reload({ only: ['tags'] });
            return true;
        } catch (error) {
            if (isManageApiError(error)) {
                showError('拆分失敗', error.message);
            } else {
                showError('拆分失敗', '請稍後再試。');
            }
            return false;
        }
    };

    const handleContextChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        handleFilterChange('context', value);
        applyFilters({ context: value, page: 1 });
    };

    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        handleFilterChange('status', value);
        applyFilters({ status: value, page: 1 });
    };

    const handlePerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        handleFilterChange('per_page', value);
        applyFilters({ per_page: value, page: 1 });
    };

    const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
        handleFilterChange('keyword', event.target.value);
    };

    const handleStatusFilterChange = (value: string) => {
        handleFilterChange('status', value);
        applyFilters({ status: value, page: 1 });
    };

    const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyFilters({ keyword: filterForm.keyword, page: 1 });
        setLastKeyword(filterForm.keyword);
    };

    const handleResetFilters = () => {
        const resetState: FilterFormState = {
            keyword: '',
            status: '',
            context: '',
            per_page: PER_PAGE_OPTIONS[0],
        };
        setFilterForm(resetState);
        setLastKeyword('');
        applyFilters({ ...resetState, page: 1 }, { replace: true });
    };

    // 狀態篩選選項
    const statusFilterOptions = useMemo(() => {
        return filterOptions.statuses.map(option => ({
            value: String(option.value),
            label: option.label,
            count: option.count,
            icon: option.icon as React.ComponentType<{ className?: string }> | undefined,
        }));
    }, [filterOptions.statuses]);

    // 篩選器面板
    const filterPanel = (
        <FilterPanel
            title={tTags('filters.title', '互動式篩選')}
            collapsible={true}
            defaultOpen={true}
            onApply={() => applyFilters({ keyword: filterForm.keyword, page: 1 })}
            onReset={handleResetFilters}
            applyLabel={tTags('filters.apply', '套用')}
            resetLabel={tTags('filters.reset', '重設')}
        >
            <div className="grid grid-cols-12 gap-3">
                {/* 關鍵字搜尋 */}
                <div className="col-span-12 md:col-span-6 space-y-2">
                    <label className="text-sm font-medium text-neutral-700">
                        {tTags('filters.keyword_label', '搜尋標籤')}
                    </label>
                    <Input
                        type="search"
                        value={filterForm.keyword}
                        onChange={handleKeywordChange}
                        placeholder={tTags('filters.keyword_placeholder', '搜尋標籤名稱或代碼')}
                        aria-label={tTags('filters.keyword_label', '搜尋標籤')}
                    />
                </div>

                {/* 模組篩選 */}
                <div className="col-span-12 md:col-span-4 space-y-2">
                    <label className="text-sm font-medium text-neutral-700">
                        {tTags('filters.context_label', '模組篩選')}
                    </label>
                    <Select
                        value={filterForm.context}
                        onChange={handleContextChange}
                        aria-label={tTags('filters.context_label', '模組篩選')}
                    >
                        <option value="">{tTags('filters.context_all', '全部模組')}</option>
                        {filterOptions.contexts.map(option => (
                            <option key={String(option.value)} value={String(option.value)}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* 每頁筆數 */}
                <div className="col-span-12 md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-neutral-700">
                        {tTags('filters.per_page_label', '每頁筆數')}
                    </label>
                    <Select
                        value={filterForm.per_page}
                        onChange={handlePerPageChange}
                        aria-label={tTags('filters.per_page_label', '每頁筆數')}
                    >
                        {PER_PAGE_OPTIONS.map(option => (
                            <option key={option} value={option}>
                                {tTags('filters.per_page_option', ':count 筆/頁', { count: Number(option) })}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>
        </FilterPanel>
    );

    // 整合的工具列：包含狀態篩選和操作按鈕
    const toolbar = (
        <ManageToolbar
            primary={
                <>
                    {/* 狀態篩選標籤 */}
                    <StatusFilterTabs
                        options={statusFilterOptions}
                        value={filterForm.status}
                        onChange={handleStatusFilterChange}
                    />
                </>
            }
            secondary={
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    {/* 批次操作 */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={selectedIds.length < 2 || !abilities.canUpdate}
                                className={cn(
                                    'h-10 gap-2 border-neutral-300 bg-white text-neutral-700 shadow-sm hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700',
                                    selectedIds.length > 0 && 'border-primary-300 bg-primary-50 text-primary-700'
                                )}
                            >
                                <Filter className="h-4 w-4" />
                                {tTags('bulk.menu', '批次操作')}
                                {selectedIds.length > 0 && (
                                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                        {selectedIds.length}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onSelect={() => setMergeOpen(true)} className="gap-2">
                                <GitMerge className="h-4 w-4" />
                                {tTags('bulk.merge', '合併標籤')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 新增標籤按鈕 */}
                    {abilities.canCreate && (
                        <Button
                            size="sm"
                            variant="default"
                            className="h-10 gap-2 bg-primary-600 px-4 shadow-sm hover:bg-primary-700"
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            {tTags('actions.create', '新增標籤')}
                        </Button>
                    )}
                </div>
            }
        />
    );

    const hasTags = tags.data.length > 0;
    const colorFormatter = new Intl.NumberFormat(locale);
    const paginationLinks = tags.links ?? { first: null, last: null, prev: null, next: null };
    const paginationSummary = tTags('table.pagination_summary', '顯示第 :from – :to 筆，共 :total 筆', {
        from: pagination.from ?? 0,
        to: pagination.to ?? 0,
        total: pagination.total ?? 0,
    });
    const mobileBulkActions = selectedIds.length > 0
        ? (
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-lg border border-neutral-200/80 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                    <span className="font-medium text-neutral-700">
                        {tTags('bulk.selected', '已選擇 :count 筆', { count: selectedIds.length })}
                    </span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 text-xs text-neutral-500 hover:text-neutral-700"
                        onClick={() => setSelectedIds([])}
                    >
                        {tTags('bulk.clear', '清除')}
                    </Button>
                </div>
                <Button
                    type="button"
                    className="h-11 w-full gap-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                    disabled={selectedIds.length < 2 || !abilities.canUpdate}
                    onClick={() => setMergeOpen(true)}
                >
                    <GitMerge className="h-4 w-4" />
                    {tTags('bulk.merge', '合併標籤')}
                </Button>
            </div>
        )
        : null;

    return (
        <>
            <Head title={pageTitle} />
            <ToastContainer toasts={toasts} onDismiss={dismissToast} position="top-right" />
            <ManagePage
                title={pageTitle}
                description={tTags('description', '集中管理公告、附件與空間所使用的標籤，支援合併與拆分等維運操作。')}
                breadcrumbs={breadcrumbs}
            >
                {/* 篩選器面板 */}
                {filterPanel}

                {/* 整合的工具列：狀態篩選 + 操作按鈕 */}
                {toolbar}
                <section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
                    <ResponsiveDataView
                        className="space-y-0"
                        table={() => (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-neutral-200/70 bg-neutral-50/80">
                                            <TableHead className="w-12 text-neutral-400">
                                                <Checkbox
                                                    checked={headerCheckboxState}
                                                    aria-label={tTags('table.select_all', '選取全部標籤')}
                                                    onCheckedChange={(checked) => handleSelectAll(checked === true)}
                                                />
                                            </TableHead>
                                            <TableHead className="min-w-[240px] text-neutral-500">{tTags('table.name', '標籤名稱')}</TableHead>
                                            <TableHead className="hidden min-w-[180px] text-neutral-500 xl:table-cell">{tTags('table.name_en', '英文名稱')}</TableHead>
                                            <TableHead className="hidden min-w-[160px] text-neutral-500 lg:table-cell">{tTags('table.context', '模組')}</TableHead>
                                            <TableHead className="min-w-[140px] text-right text-neutral-500">{tTags('table.usage_count', '使用次數')}</TableHead>
                                            <TableHead className="hidden min-w-[180px] text-neutral-500 lg:table-cell">{tTags('table.last_used', '最後使用')}</TableHead>
                                            <TableHead className="min-w-[120px] text-neutral-500">{tTags('table.status', '狀態')}</TableHead>
                                            <TableHead className="w-14" aria-label={tTags('table.actions', '操作')} />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tags.data.map((tag) => {
                                            const isSelected = selectedIds.includes(tag.id);
                                            const lastUsed = formatDateTime(tag.last_used_at, locale);

                                            return (
                                                <TableRow
                                                    key={tag.id}
                                                    className={cn(
                                                        'border-b border-neutral-200/60 transition-colors hover:bg-neutral-50/70',
                                                        isSelected && 'bg-blue-50/40'
                                                    )}
                                                >
                                                    <TableCell className="align-top">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            aria-label={tTags('table.select_tag', '選取標籤 :name', { name: tag.name })}
                                                            onCheckedChange={(checked) => toggleSelected(tag.id, checked === true)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-start gap-3">
                                                            <TagColorSwatch value={tag.color} />
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-medium text-neutral-900">{tag.name}</span>
                                                                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                                                                    {tag.slug ? (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="inline-flex items-center gap-1 rounded-full border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-600"
                                                                        >
                                                                            <Hash className="h-3 w-3" />
                                                                            #{tag.slug}
                                                                        </Badge>
                                                                    ) : null}
                                                                    {tag.name_en ? <span>{tag.name_en}</span> : null}
                                                                </div>
                                                                {tag.description ? (
                                                                    <p className="text-xs text-neutral-500">{tag.description}</p>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden align-top text-sm text-neutral-600 xl:table-cell">{tag.name_en || '—'}</TableCell>
                                                    <TableCell className="hidden align-top text-sm text-neutral-600 lg:table-cell">{tag.context_label}</TableCell>
                                                    <TableCell className="align-top text-right font-medium text-neutral-700">
                                                        {colorFormatter.format(tag.usage_count ?? 0)}
                                                    </TableCell>
                                                    <TableCell className="hidden align-top text-sm text-neutral-600 lg:table-cell">
                                                        {lastUsed || tTags('table.last_used_empty', '尚未使用')}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium',
                                                                tag.is_active
                                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                    : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                                                            )}
                                                        >
                                                            <Droplet className="h-3.5 w-3.5" />
                                                            {tag.is_active ? tTags('status.active', '啟用中') : tTags('status.inactive', '已停用')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="align-top text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-neutral-700">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-44">
                                                                {abilities.canUpdate ? (
                                                                    <DropdownMenuItem onSelect={() => openEditDialog(tag)} className="gap-2">
                                                                        <Edit3 className="h-4 w-4" />
                                                                        {tTags('actions.edit', '編輯')}
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                <DropdownMenuItem onSelect={() => setSplitTag(tag)} className="gap-2">
                                                                    <SplitSquareVertical className="h-4 w-4" />
                                                                    {tTags('actions.split', '拆分')}
                                                                </DropdownMenuItem>
                                                                {abilities.canUpdate ? (
                                                                    <DropdownMenuItem onSelect={() => toggleActivation(tag)} className="gap-2">
                                                                        <RefreshCcw className="h-4 w-4" />
                                                                        {tag.is_active ? tTags('actions.deactivate', '停用') : tTags('actions.activate', '啟用')}
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        card={() => (
                            <div className="space-y-3">
                                {tags.data.map((tag) => {
                                    const isSelected = selectedIds.includes(tag.id);
                                    const lastUsed = formatDateTime(tag.last_used_at, locale);

                                    const metadata = [
                                        {
                                            label: tTags('table.usage_count', '使用次數'),
                                            value: colorFormatter.format(tag.usage_count ?? 0),
                                            icon: <ClipboardList className="h-3.5 w-3.5 text-neutral-400" />,
                                        },
                                        {
                                            label: tTags('table.context', '模組'),
                                            value: tag.context_label,
                                            icon: <FolderTree className="h-3.5 w-3.5 text-neutral-400" />,
                                        },
                                        {
                                            label: tTags('table.last_used', '最後使用'),
                                            value: lastUsed || tTags('table.last_used_empty', '尚未使用'),
                                            icon: <CalendarClock className="h-3.5 w-3.5 text-neutral-400" />,
                                        },
                                    ];

                                    const cardMobileActions = (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between rounded-lg border border-neutral-200/80 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                                                <span>
                                                    {isSelected
                                                        ? tTags('bulk.selected_single', '已加入合併清單')
                                                        : tTags('bulk.select_prompt', '加入合併清單')}
                                                </span>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={(checked) => toggleSelected(tag.id, checked === true)}
                                                    aria-label={tTags('table.select_tag', '選取標籤 :name', { name: tag.name })}
                                                />
                                            </div>
                                            {abilities.canUpdate ? (
                                                <Button
                                                    type="button"
                                                    className="w-full justify-center gap-2 bg-[#3B82F6] text-white hover:bg-[#2563EB]"
                                                    onClick={() => openEditDialog(tag)}
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                    {tTags('actions.edit', '編輯')}
                                                </Button>
                                            ) : null}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-center gap-2"
                                                onClick={() => setSplitTag(tag)}
                                            >
                                                <SplitSquareVertical className="h-4 w-4" />
                                                {tTags('actions.split', '拆分')}
                                            </Button>
                                            {abilities.canUpdate ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full justify-center gap-2"
                                                    onClick={() => toggleActivation(tag)}
                                                >
                                                    <RefreshCcw className="h-4 w-4" />
                                                    {tag.is_active ? tTags('actions.deactivate', '停用') : tTags('actions.activate', '啟用')}
                                                </Button>
                                            ) : null}
                                        </div>
                                    );

                                    return (
                                        <DataCard
                                            key={tag.id}
                                            title={tag.name}
                                            description={tag.description ?? undefined}
                                            status={{
                                                label: tag.is_active ? tTags('status.active', '啟用中') : tTags('status.inactive', '已停用'),
                                                tone: tag.is_active ? 'success' : 'neutral',
                                                icon: <Droplet className="h-3.5 w-3.5" />,
                                            }}
                                            metadata={metadata}
                                            mobileActions={cardMobileActions}
                                            className={cn(isSelected && 'border-blue-200 shadow-md ring-2 ring-blue-200/60')}
                                        >
                                            <div className="flex flex-col gap-2 text-sm text-neutral-600">
                                                <div className="inline-flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
                                                    <TagColorSwatch value={tag.color} size="md" />
                                                    <span className="font-medium text-neutral-700">{tag.color || tTags('form.color_preview_empty', '尚未設定色碼')}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {tag.slug ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="inline-flex items-center gap-1 rounded-full border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-600"
                                                        >
                                                            <Hash className="h-3 w-3" />
                                                            #{tag.slug}
                                                        </Badge>
                                                    ) : null}
                                                    {tag.name_en ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="inline-flex items-center gap-1 rounded-full border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-600"
                                                        >
                                                            {tag.name_en}
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </DataCard>
                                    );
                                })}
                            </div>
                        )}
                        isEmpty={!hasTags}
                        emptyState={
                            <TableEmpty
                                title={tTags('empty.title', '目前沒有符合條件的標籤')}
                                description={tTags('empty.description', '您可以調整篩選條件，或建立新的標籤來分類後台資料。')}
                                action={
                                    abilities.canCreate
                                        ? (
                                            <Button size="sm" className="gap-1" onClick={() => setCreateOpen(true)}>
                                                <Plus className="h-4 w-4" /> {tTags('empty.action', '新增標籤')}
                                            </Button>
                                        )
                                        : undefined
                                }
                            />
                        }
                        stickyActions={mobileBulkActions}
                    />

                    {hasTags ? (
                        <footer className="flex flex-col gap-3 border-t border-neutral-200/70 bg-neutral-50/70 px-4 py-3 text-sm text-neutral-600 md:flex-row md:items-center md:justify-between">
                            <span>{paginationSummary}</span>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                <Button
                                    variant="default"
                                    size="sm"
                                    disabled={!paginationLinks.prev}
                                    className="h-10 gap-2 bg-[#3B82F6] px-4 text-white hover:bg-[#2563EB] disabled:bg-neutral-200 disabled:text-neutral-500"
                                    asChild
                                >
                                    <Link href={paginationLinks.prev ?? '#'} preserveScroll preserveState>
                                        {tTags('pagination.prev', '上一頁')}
                                    </Link>
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    disabled={!paginationLinks.next}
                                    className="h-10 gap-2 bg-[#3B82F6] px-4 text-white hover:bg-[#2563EB] disabled:bg-neutral-200 disabled:text-neutral-500"
                                    asChild
                                >
                                    <Link href={paginationLinks.next ?? '#'} preserveScroll preserveState>
                                        {tTags('pagination.next', '下一頁')}
                                    </Link>
                                </Button>
                            </div>
                        </footer>
                    ) : null}
                </section>
            </ManagePage>

            <TagFormDialog
                mode="create"
                open={createOpen}
                onOpenChange={setCreateOpen}
                contexts={filterOptions.contexts}
                onSubmit={handleCreate}
                initialValues={{
                    context: filterForm.context || (filterOptions.contexts[0]?.value ? String(filterOptions.contexts[0]?.value) : ''),
                    name: '',
                    name_en: '',
                    description: '',
                    color: '',
                    is_active: true,
                }}
            />

            <TagFormDialog
                mode="edit"
                open={!!editTag}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditTag(null);
                    }
                }}
                contexts={filterOptions.contexts}
                disableContext
                onSubmit={handleUpdate}
                initialValues={editTag ? {
                    context: editTag.context,
                    name: editTag.name,
                    name_en: editTag.name_en ?? '',
                    description: editTag.description ?? '',
                    color: editTag.color ?? '',
                    is_active: editTag.is_active,
                } : {
                    context: '',
                    name: '',
                    name_en: '',
                    description: '',
                    color: '',
                    is_active: true,
                }}
            />

            <MergeDialog
                open={mergeOpen}
                onOpenChange={setMergeOpen}
                selectedTags={selectedTags}
                onSubmit={handleMerge}
            />

            <SplitDialog
                open={!!splitTag}
                onOpenChange={(open) => {
                    if (!open) {
                        setSplitTag(null);
                    }
                }}
                tag={splitTag}
                onSubmit={handleSplit}
            />
        </>
    );
}

ManageAdminTagsIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;

type TagColorSwatchProps = {
    value: string | null | undefined;
    size?: 'sm' | 'md';
    className?: string;
};

const TAG_COLOR_SWATCH_SIZE: Record<'sm' | 'md', string> = {
    sm: 'h-3.5 w-3.5',
    md: 'h-6 w-6',
};

function TagColorSwatch({ value, size = 'sm', className }: TagColorSwatchProps) {
    const hexColor = ensureHexColor(value);
    const hasValue = Boolean(value);

    const style = hexColor
        ? { backgroundColor: hexColor }
        : hasValue
            ? {
                  backgroundImage:
                      'linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 50%, #e5e7eb 50%, #e5e7eb 75%, transparent 75%, transparent)',
                  backgroundSize: '6px 6px',
              }
            : { backgroundColor: '#f5f5f5' };

    return (
        <span
            className={cn(
                'inline-flex flex-none items-center justify-center rounded-full border border-neutral-300/80 shadow-sm',
                TAG_COLOR_SWATCH_SIZE[size],
                className
            )}
            style={style}
        />
    );
}

interface TagColorPreviewProps {
    value: string;
    message: string;
    placeholder?: string;
}

function TagColorPreview({ value, message, placeholder }: TagColorPreviewProps) {
    const hasValue = value.trim().length > 0;

    return (
        <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-sm">
            <TagColorSwatch value={value} size="md" />
            <div className="flex flex-col text-xs text-neutral-500">
                <span className="font-medium text-neutral-700">{hasValue ? value : placeholder ?? '—'}</span>
                <span>{message}</span>
            </div>
        </div>
    );
}

function TagFormDialog({ mode, open, onOpenChange, contexts, initialValues, disableContext, onSubmit }: TagFormDialogProps) {
    const { t: tTags } = useTranslator('manage.tags');
    const [values, setValues] = useState<TagFormValues>(initialValues);
    const [errors, setErrors] = useState<TagFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setValues(initialValues);
            setErrors({});
        }
    }, [open, initialValues]);

    const handleChange = (field: keyof TagFormValues, value: string | boolean) => {
        setValues(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const success = await onSubmit(values, { setErrors });
        setIsSubmitting(false);
        if (success) {
            onOpenChange(false);
        }
    };

    const trimmedColor = values.color.trim();
    const hexPreview = ensureHexColor(trimmedColor);
    const colorPreviewMessage = hexPreview
        ? tTags('form.color_preview_hex', '已套用 HEX 色碼預覽，儲存後將以此顏色顯示。')
        : trimmedColor
            ? tTags('form.color_preview_tailwind', '預覽僅支援 HEX 色碼，Tailwind 顏色會在儲存後套用。')
            : tTags('form.color_preview_hint', '輸入 HEX 或 Tailwind 顏色類別即可預覽。');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <DialogHeader className="gap-1 text-left">
                        <DialogTitle>
                            {mode === 'create' ? tTags('dialog.create_title', '新增標籤') : tTags('dialog.edit_title', '編輯標籤')}
                        </DialogTitle>
                        <DialogDescription className="text-neutral-600">
                            {mode === 'create'
                                ? tTags('dialog.create_description', '設定標籤的中英文名稱與顏色，建立後可用於公告、附件與空間等模組。')
                                : tTags('dialog.edit_description', '更新標籤資訊並調整狀態，變更後會即時套用至所有關聯資料。')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <FormField
                            label={tTags('form.context', '套用模組')}
                            required
                            error={errors.context}
                            direction="horizontal"
                            className="bg-neutral-50/60"
                        >
                            <Select
                                value={values.context}
                                onChange={(event) => handleChange('context', event.target.value)}
                                disabled={disableContext || mode === 'edit'}
                            >
                                <option value="">{tTags('form.context_placeholder', '請選擇模組')}</option>
                                {contexts.map(option => (
                                    <option key={String(option.value)} value={String(option.value)}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField
                            label={tTags('form.name', '標籤名稱')}
                            required
                            error={errors.name}
                            direction="horizontal"
                            className="bg-neutral-50/60"
                        >
                            <Input
                                value={values.name}
                                onChange={(event) => handleChange('name', event.target.value)}
                                placeholder={tTags('form.name_placeholder', '例如：招生資訊')}
                            />
                        </FormField>

                        <FormField
                            label={tTags('form.name_en', '英文名稱')}
                            error={errors.name_en}
                            direction="horizontal"
                            className="bg-neutral-50/60"
                        >
                            <Input
                                value={values.name_en}
                                onChange={(event) => handleChange('name_en', event.target.value)}
                                placeholder={tTags('form.name_en_placeholder', '例如：Admission')}
                            />
                        </FormField>

                        <FormField
                            label={tTags('form.description', '描述')}
                            error={errors.description}
                            direction="horizontal"
                            className="bg-neutral-50/60"
                        >
                            <Input
                                value={values.description}
                                onChange={(event) => handleChange('description', event.target.value)}
                                placeholder={tTags('form.description_placeholder', '補充說明，可留空')}
                            />
                        </FormField>

                        <FormField
                            label={tTags('form.color', '顏色')}
                            description={tTags('form.color_hint', '支援 HEX 色碼或 Tailwind 顏色類別')}
                            error={errors.color}
                            direction="horizontal"
                            className="bg-neutral-50/60"
                        >
                            <div className="flex flex-col gap-2">
                                <Input
                                    value={values.color}
                                    onChange={(event) => handleChange('color', event.target.value)}
                                    placeholder={tTags('form.color_placeholder', '#16a34a 或 text-emerald-600')}
                                />
                                <TagColorPreview
                                    value={trimmedColor}
                                    message={colorPreviewMessage}
                                    placeholder={tTags('form.color_preview_empty', '尚未輸入色碼')}
                                />
                            </div>
                        </FormField>

                        <FormField
                            label={tTags('form.status', '狀態')}
                            error={errors.is_active}
                            direction="horizontal"
                            className="bg-neutral-50/60"
                        >
                            <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                                <Checkbox
                                    checked={values.is_active}
                                    onCheckedChange={(checked) => handleChange('is_active', checked === true)}
                                />
                                {tTags('form.is_active', '啟用標籤')}
                            </label>
                        </FormField>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            {tTags('form.cancel', '取消')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting || (!values.context && mode === 'create')}>
                            {isSubmitting
                                ? tTags('form.submitting', '處理中…')
                                : mode === 'create'
                                    ? tTags('form.create', '建立')
                                    : tTags('form.save', '儲存變更')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function MergeDialog({ open, onOpenChange, selectedTags, onSubmit }: MergeDialogProps) {
    const { t: tTags } = useTranslator('manage.tags');
    const [targetId, setTargetId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setTargetId(selectedTags[0]?.id ?? null);
        }
    }, [open, selectedTags]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!targetId) {
            return;
        }
        setIsSubmitting(true);
        const success = await onSubmit(targetId);
        setIsSubmitting(false);
        if (success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <DialogHeader className="gap-1 text-left">
                        <DialogTitle>{tTags('merge.title', '合併標籤')}</DialogTitle>
                        <DialogDescription className="text-neutral-600">
                            {tTags('merge.description', '選取要保留的標籤，其餘標籤的關聯資料將轉移至保留標籤，並自動停用。')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                            <span className="font-medium text-neutral-800">
                                {tTags('merge.selected', '已選擇 :count 個標籤', { count: selectedTags.length })}
                            </span>
                            <ul className="space-y-1.5">
                                {selectedTags.map(tag => (
                                    <li
                                        key={tag.id}
                                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm"
                                    >
                                        <span className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                                            <TagColorSwatch value={tag.color} />
                                            {tag.name}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                            {tag.context_label}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <FormField
                            label={tTags('merge.keep_label', '保留標籤')}
                            required
                            direction="horizontal"
                            className="bg-neutral-50/60"
                        >
                            <Select
                                value={targetId ? String(targetId) : ''}
                                onChange={(event) => setTargetId(Number(event.target.value))}
                            >
                                {selectedTags.map(tag => (
                                    <option key={tag.id} value={tag.id}>
                                        {tag.name}
                                    </option>
                                ))}
                            </Select>
                        </FormField>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            {tTags('merge.cancel', '取消')}
                        </Button>
                        <Button type="submit" disabled={!targetId || isSubmitting} className="gap-1">
                            <ClipboardList className="h-4 w-4" />
                            {isSubmitting ? tTags('merge.submitting', '合併中…') : tTags('merge.confirm', '確認合併')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function SplitDialog({ open, onOpenChange, tag, onSubmit }: SplitDialogProps) {
    const { t: tTags } = useTranslator('manage.tags');
    const [names, setNames] = useState('');
    const [keepOriginal, setKeepOriginal] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setNames('');
            setKeepOriginal(true);
        }
    }, [open, tag?.id]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const success = await onSubmit(names, keepOriginal);
        setIsSubmitting(false);
        if (success) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <DialogHeader className="gap-1 text-left">
                        <DialogTitle>{tTags('split.title', '拆分標籤')}</DialogTitle>
                        <DialogDescription className="text-neutral-600">
                            {tTags('split.description', '以逗號或換行輸入多個新標籤名稱，可快速建立細分類別。')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                            <span className="font-medium text-neutral-800">{tTags('split.source_label', '原標籤')}</span>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                                    <TagColorSwatch value={tag?.color} />
                                    {tag?.name ?? '—'}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                    {tag?.context_label}
                                </Badge>
                            </div>
                        </div>

                        <FormField
                            label={tTags('split.new_names_label', '新標籤名稱')}
                            required
                            direction="horizontal"
                            description={tTags('split.new_names_hint', '使用逗號或換行分隔，例如：國際交流,就業資訊,活動花絮')}
                            className="bg-neutral-50/60"
                        >
                            <textarea
                                value={names}
                                onChange={(event) => setNames(event.target.value)}
                                className="min-h-[160px] w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                            />
                        </FormField>

                        <FormField direction="horizontal" className="bg-neutral-50/60">
                            <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                                <Checkbox checked={keepOriginal} onCheckedChange={(checked) => setKeepOriginal(checked === true)} />
                                {tTags('split.keep_original', '保留原標籤（不會自動停用）')}
                            </label>
                        </FormField>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            {tTags('split.cancel', '取消')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !names.trim()} className="gap-1">
                            <SplitSquareVertical className="h-4 w-4" />
                            {isSubmitting ? tTags('split.submitting', '建立中…') : tTags('split.confirm', '建立新標籤')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
