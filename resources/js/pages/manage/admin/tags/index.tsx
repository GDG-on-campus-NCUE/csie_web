import { useEffect, useMemo, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ToastContainer from '@/components/ui/toast-container';
import FormField from '@/components/manage/forms/form-field';
import TableEmpty from '@/components/manage/table-empty';
import { useTranslator } from '@/hooks/use-translator';
import useToast from '@/hooks/use-toast';
import { formatDateTime } from '@/lib/shared/format';
import { apiClient, isManageApiError } from '@/lib/manage/api-client';
import { cn } from '@/lib/shared/utils';
import type { ManageTag, ManageTagAbilities, ManageTagFilterOptions, ManageTagFilterState, ManageTagListResponse } from '@/types/manage';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import { Head, router, usePage } from '@inertiajs/react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { useCallback } from 'react';
import { useRef } from 'react';
import { CheckSquare, ClipboardList, Edit3, Filter, GitMerge, MoreHorizontal, Plus, RefreshCcw, SplitSquareVertical } from 'lucide-react';

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

    const applyFilters = useCallback((overrides: Partial<FilterFormState> = {}, options: { replace?: boolean } = {}) => {
        const payload: Record<string, string | number | null> = {
            keyword: (overrides.keyword ?? filterForm.keyword) || null,
            status: (overrides.status ?? filterForm.status) || null,
            context: (overrides.context ?? filterForm.context) || null,
            per_page: overrides.per_page ? Number(overrides.per_page) : Number(filterForm.per_page) || null,
        };

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
        applyFilters({ context: value });
    };

    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        handleFilterChange('status', value);
        applyFilters({ status: value });
    };

    const handlePerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        handleFilterChange('per_page', value);
        applyFilters({ per_page: value });
    };

    const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
        handleFilterChange('keyword', event.target.value);
    };

    const handleResetFilters = () => {
        setFilterForm({
            keyword: '',
            status: '',
            context: '',
            per_page: PER_PAGE_OPTIONS[0],
        });
        setLastKeyword('');
        applyFilters({ keyword: '', status: '', context: '', per_page: PER_PAGE_OPTIONS[0] }, { replace: true });
    };

    const toolbar = (
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form className="flex flex-wrap items-center gap-2" onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}>
                <div className="flex items-center gap-2">
                    <Input
                        type="search"
                        value={filterForm.keyword}
                        onChange={handleKeywordChange}
                        placeholder={tTags('filters.keyword_placeholder', '搜尋標籤名稱或代碼')}
                        className="w-56"
                        aria-label={tTags('filters.keyword_label', '搜尋標籤')}
                    />
                    <Button type="button" size="sm" className="gap-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white border-transparent" onClick={() => applyFilters({ keyword: filterForm.keyword })}>
                        <Filter className="h-4 w-4" />
                        {tTags('filters.apply', '套用')}
                    </Button>
                </div>
                <Select value={filterForm.context} onChange={handleContextChange} className="w-40" aria-label={tTags('filters.context_label', '模組篩選')}>
                    <option value="">{tTags('filters.context_all', '全部模組')}</option>
                    {filterOptions.contexts.map(option => (
                        <option key={String(option.value)} value={String(option.value)}>
                            {option.label}
                        </option>
                    ))}
                </Select>
                <Select value={filterForm.status} onChange={handleStatusChange} className="w-36" aria-label={tTags('filters.status_label', '狀態篩選')}>
                    <option value="">{tTags('filters.status_all', '全部狀態')}</option>
                    {filterOptions.statuses.map(option => (
                        <option key={String(option.value)} value={String(option.value)}>
                            {option.label}
                        </option>
                    ))}
                </Select>
                <Select value={filterForm.per_page} onChange={handlePerPageChange} className="w-28" aria-label={tTags('filters.per_page_label', '每頁筆數')}>
                    {PER_PAGE_OPTIONS.map(option => (
                        <option key={option} value={option}>
                            {tTags('filters.per_page_option', ':count 筆/頁', { count: Number(option) })}
                        </option>
                    ))}
                </Select>
                <Button type="button" size="sm" variant="ghost" className="text-neutral-500" onClick={handleResetFilters}>
                    {tTags('filters.reset', '重設')}
                </Button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
                {selectedIds.length > 0 ? (
                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                        <CheckSquare className="h-3.5 w-3.5 text-primary-500" />
                        {tTags('bulk.selected', '已選擇 :count 筆', { count: selectedIds.length })}
                    </span>
                ) : null}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={selectedIds.length < 2 || !abilities.canUpdate}
                    onClick={() => setMergeOpen(true)}
                >
                    <GitMerge className="h-4 w-4" />
                    {tTags('bulk.merge', '合併')}
                </Button>
                {abilities.canCreate ? (
                    <Button type="button" size="sm" className="gap-1 bg-[#10B981] hover:bg-[#059669] text-white border-transparent" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4" />
                        {tTags('actions.create', '新增標籤')}
                    </Button>
                ) : null}
            </div>
        </div>
    );

    const hasTags = tags.data.length > 0;
    const colorFormatter = new Intl.NumberFormat(locale);

    return (
        <>
            <Head title={pageTitle} />
            <ToastContainer toasts={toasts} onDismiss={dismissToast} position="top-right" />
            <ManagePage
                title={pageTitle}
                description={tTags('description', '集中管理公告、附件與空間所使用的標籤，支援合併與拆分等維運操作。')}
                breadcrumbs={breadcrumbs}
                toolbar={toolbar}
            >
                <section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-neutral-200/70">
                                    <TableHead className="w-12 text-neutral-500">
                                        <Checkbox
                                            checked={headerCheckboxState}
                                            aria-label={tTags('table.select_all', '選取全部')}
                                            onCheckedChange={(checked) => handleSelectAll(checked === true)}
                                        />
                                    </TableHead>
                                    <TableHead className="min-w-[220px] text-neutral-500">{tTags('table.name', '標籤名稱')}</TableHead>
                                    <TableHead className="hidden min-w-[160px] text-neutral-500 lg:table-cell">{tTags('table.name_en', '英文名稱')}</TableHead>
                                    <TableHead className="hidden min-w-[140px] text-neutral-500 lg:table-cell">{tTags('table.context', '模組')}</TableHead>
                                    <TableHead className="min-w-[120px] text-right text-neutral-500">{tTags('table.usage_count', '使用次數')}</TableHead>
                                    <TableHead className="hidden min-w-[160px] text-neutral-500 lg:table-cell">{tTags('table.last_used', '最後使用')}</TableHead>
                                    <TableHead className="min-w-[100px] text-neutral-500">{tTags('table.status', '狀態')}</TableHead>
                                    <TableHead className="w-14" aria-label={tTags('table.actions', '操作')} />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hasTags ? (
                                    tags.data.map((tag) => {
                                        const isSelected = selectedIds.includes(tag.id);
                                        const hexColor = ensureHexColor(tag.color);

                                        return (
                                            <TableRow key={tag.id} className="border-neutral-200/60 hover:bg-neutral-50/70">
                                                <TableCell>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        aria-label={tTags('table.select_tag', '選取標籤 :name', { name: tag.name })}
                                                        onCheckedChange={(checked) => toggleSelected(tag.id, checked === true)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 font-medium text-neutral-800">
                                                            <span
                                                                className="h-3 w-3 rounded-full border-2 border-neutral-300/80 shadow-sm"
                                                                style={hexColor ? { backgroundColor: hexColor } : { backgroundImage: 'linear-gradient(45deg, #d4d4d4 25%, transparent 25%, transparent 50%, #d4d4d4 50%, #d4d4d4 75%, transparent 75%, transparent)' }}
                                                            />
                                                            {tag.name}
                                                        </div>
                                                        {tag.slug ? (
                                                            <span className="text-xs text-neutral-500">#{tag.slug}</span>
                                                        ) : null}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden text-sm text-neutral-600 lg:table-cell">{tag.name_en || '—'}</TableCell>
                                                <TableCell className="hidden text-sm text-neutral-600 lg:table-cell">{tag.context_label}</TableCell>
                                                <TableCell className="text-right font-medium text-neutral-700">
                                                    {colorFormatter.format(tag.usage_count ?? 0)}
                                                </TableCell>
                                                <TableCell className="hidden text-sm text-neutral-600 lg:table-cell">{formatDateTime(tag.last_used_at, locale)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={tag.is_active ? 'default' : 'outline'} className={cn('rounded-full px-3 py-1 text-xs', tag.is_active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'text-neutral-500')}>
                                                        {tag.is_active ? tTags('status.active', '啟用中') : tTags('status.inactive', '已停用')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {abilities.canUpdate ? (
                                                                <DropdownMenuItem onSelect={() => openEditDialog(tag)}>
                                                                    <Edit3 className="mr-2 h-4 w-4" /> {tTags('actions.edit', '編輯')}
                                                                </DropdownMenuItem>
                                                            ) : null}
                                                            <DropdownMenuItem onSelect={() => setSplitTag(tag)}>
                                                                <SplitSquareVertical className="mr-2 h-4 w-4" /> {tTags('actions.split', '拆分')}
                                                            </DropdownMenuItem>
                                                            {abilities.canUpdate ? (
                                                                <DropdownMenuItem onSelect={() => toggleActivation(tag)}>
                                                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                                                    {tag.is_active ? tTags('actions.deactivate', '停用') : tTags('actions.activate', '啟用')}
                                                                </DropdownMenuItem>
                                                            ) : null}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-10">
                                            <TableEmpty
                                                title={tTags('empty.title', '目前沒有符合條件的標籤')}
                                                description={tTags('empty.description', '您可以調整篩選條件，或建立新的標籤來分類後台資料。')}
                                                action={abilities.canCreate ? (
                                                    <Button size="sm" className="gap-1" onClick={() => setCreateOpen(true)}>
                                                        <Plus className="h-4 w-4" /> {tTags('empty.action', '新增標籤')}
                                                    </Button>
                                                ) : undefined}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {hasTags ? (
                        <div className="flex flex-col gap-3 border-t border-neutral-200/70 bg-neutral-50/70 px-4 py-3 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                顯示第 {pagination.from ?? 0} – {pagination.to ?? 0} 筆，共 {pagination.total} 筆
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!tags.links?.prev}
                                    onClick={() => tags.links?.prev && router.get(tags.links.prev, {}, { preserveScroll: true, preserveState: true })}
                                >
                                    上一頁
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!tags.links?.next}
                                    onClick={() => tags.links?.next && router.get(tags.links.next, {}, { preserveScroll: true, preserveState: true })}
                                >
                                    下一頁
                                </Button>
                            </div>
                        </div>
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? tTags('dialog.create_title', '新增標籤') : tTags('dialog.edit_title', '編輯標籤')}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? tTags('dialog.create_description', '設定標籤的中英文名稱與顏色，建立後可用於公告、附件與空間等模組。')
                            : tTags('dialog.edit_description', '更新標籤資訊並調整狀態，變更後會即時套用至所有關聯資料。')}
                    </DialogDescription>
                </DialogHeader>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <FormField label={tTags('form.context', '套用模組')} required error={errors.context} direction="horizontal">
                        <Select
                            value={values.context}
                            onChange={(event) => handleChange('context', event.target.value)}
                            disabled={disableContext || mode === 'edit'}
                        >
                            <option value="">請選擇</option>
                            {contexts.map(option => (
                                <option key={String(option.value)} value={String(option.value)}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label={tTags('form.name', '標籤名稱')} required error={errors.name} direction="horizontal">
                        <Input value={values.name} onChange={(event) => handleChange('name', event.target.value)} placeholder="例如：招生資訊" />
                    </FormField>

                    <FormField label={tTags('form.name_en', '英文名稱')} error={errors.name_en} direction="horizontal">
                        <Input value={values.name_en} onChange={(event) => handleChange('name_en', event.target.value)} placeholder="例如：Admission" />
                    </FormField>

                    <FormField label={tTags('form.description', '描述')} error={errors.description} direction="horizontal">
                        <Input value={values.description} onChange={(event) => handleChange('description', event.target.value)} placeholder="補充說明，可留空" />
                    </FormField>

                    <FormField label={tTags('form.color', '顏色')} description={tTags('form.color_hint', '支援 HEX 色碼或 Tailwind 顏色類別')} error={errors.color} direction="horizontal">
                        <Input value={values.color} onChange={(event) => handleChange('color', event.target.value)} placeholder="#16a34a 或 text-emerald-600" />
                    </FormField>

                    <FormField label={tTags('form.status', '狀態')} error={errors.is_active} direction="horizontal">
                        <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                            <Checkbox
                                checked={values.is_active}
                                onCheckedChange={(checked) => handleChange('is_active', checked === true)}
                            />
                            {tTags('form.is_active', '啟用標籤')}
                        </label>
                    </FormField>

                    <div className="flex flex-col-reverse items-center gap-2 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            {tTags('form.cancel', '取消')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting || (!values.context && mode === 'create')}>
                            {isSubmitting ? tTags('form.submitting', '處理中…') : mode === 'create' ? tTags('form.create', '建立') : tTags('form.save', '儲存變更')}
                        </Button>
                    </div>
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
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{tTags('merge.title', '合併標籤')}</DialogTitle>
                    <DialogDescription>
                        {tTags('merge.description', '選取要保留的標籤，其餘標籤的關聯資料將轉移至保留標籤，並自動停用。')}
                    </DialogDescription>
                </DialogHeader>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">
                        <span className="font-medium text-neutral-800">{tTags('merge.selected', '已選擇 :count 個標籤', { count: selectedTags.length })}</span>
                        <ul className="mt-2 space-y-1">
                            {selectedTags.map(tag => (
                                <li key={tag.id} className="flex items-center justify-between rounded-md bg-white/70 px-3 py-2">
                                    <span>{tag.name}</span>
                                    <Badge variant="outline" className="text-xs">{tag.context_label}</Badge>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <FormField label={tTags('merge.keep_label', '保留標籤')} required direction="horizontal">
                        <Select value={targetId ? String(targetId) : ''} onChange={(event) => setTargetId(Number(event.target.value))}>
                            {selectedTags.map(tag => (
                                <option key={tag.id} value={tag.id}>
                                    {tag.name}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <div className="flex flex-col-reverse items-center gap-2 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            {tTags('merge.cancel', '取消')}
                        </Button>
                        <Button type="submit" disabled={!targetId || isSubmitting} className="gap-1">
                            <ClipboardList className="h-4 w-4" />
                            {isSubmitting ? tTags('merge.submitting', '合併中…') : tTags('merge.confirm', '確認合併')}
                        </Button>
                    </div>
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
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{tTags('split.title', '拆分標籤')}</DialogTitle>
                    <DialogDescription>
                        {tTags('split.description', '以逗號或換行輸入多個新標籤名稱，可快速建立細分類別。')}
                    </DialogDescription>
                </DialogHeader>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                        <span className="font-medium text-neutral-800">{tTags('split.source_label', '原標籤')}</span>
                        <div className="mt-2 flex items-center justify-between">
                            <span>{tag?.name ?? '—'}</span>
                            <Badge variant="outline" className="text-xs">{tag?.context_label}</Badge>
                        </div>
                    </div>

                    <FormField label={tTags('split.new_names_label', '新標籤名稱')} required direction="horizontal" description={tTags('split.new_names_hint', '使用逗號或換行分隔，例如：國際交流,就業資訊,活動花絮')}>
                        <textarea
                            value={names}
                            onChange={(event) => setNames(event.target.value)}
                            className="min-h-[160px] w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                        />
                    </FormField>

                    <FormField direction="horizontal">
                        <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                            <Checkbox checked={keepOriginal} onCheckedChange={(checked) => setKeepOriginal(checked === true)} />
                            {tTags('split.keep_original', '保留原標籤（不會自動停用）')}
                        </label>
                    </FormField>

                    <div className="flex flex-col-reverse items-center gap-2 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            {tTags('split.cancel', '取消')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !names.trim()} className="gap-1">
                            <SplitSquareVertical className="h-4 w-4" />
                            {isSubmitting ? tTags('split.submitting', '建立中…') : tTags('split.confirm', '建立新標籤')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
