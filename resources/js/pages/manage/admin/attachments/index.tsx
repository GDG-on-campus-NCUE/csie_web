import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import AttachmentUploadModal from '@/components/manage/admin/attachment-upload-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TableEmpty from '@/components/manage/table-empty';
import ToastContainer from '@/components/ui/toast-container';
import { useTranslator } from '@/hooks/use-translator';
import useToast from '@/hooks/use-toast';
import { apiClient, isManageApiError } from '@/lib/manage/api-client';
import { cn, formatBytes } from '@/lib/shared/utils';
import type {
    ManageAttachmentFilterOptions,
    ManageAttachmentFilterState,
    ManageAttachmentListItem,
    ManageAttachmentListResponse,
} from '@/types/manage';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { ArrowUpDown, CheckCircle2, CloudUpload, Download, Eye, Filter, LayoutGrid, List as ListIcon, RefreshCcw, Trash2 } from 'lucide-react';

interface ManageAdminAttachmentsPageProps extends SharedData {
    attachments: ManageAttachmentListResponse;
    filters: ManageAttachmentFilterState;
    filterOptions: ManageAttachmentFilterOptions;
    viewMode: 'list' | 'grid';
    abilities: {
        canUpload: boolean;
        canDelete: boolean;
    };
}

interface FilterFormState {
    keyword: string;
    type: string;
    visibility: string;
    space: string;
    tag: string;
    from: string;
    to: string;
    per_page: string;
    sort: string;
    direction: 'asc' | 'desc';
    view: 'list' | 'grid';
}

const visibilityVariantMap: Record<string, 'default' | 'secondary' | 'outline'> = {
    public: 'secondary',
    private: 'outline',
};

const sortOptions: Array<{ value: string; label: string }> = [
    { value: 'created_at', label: '最新上傳' },
    { value: 'title', label: '名稱排序' },
    { value: 'size', label: '檔案大小' },
];

function buildPayload(state: FilterFormState) {
    return {
        keyword: state.keyword || null,
        type: state.type || null,
        visibility: state.visibility || null,
        space: state.space ? Number(state.space) : null,
        tag: state.tag || null,
        from: state.from || null,
        to: state.to || null,
        per_page: state.per_page ? Number(state.per_page) : null,
        sort: state.sort || null,
        direction: state.direction || null,
        view: state.view || null,
    };
}

function formatFileSize(size: number | null | undefined) {
    if (!size || size <= 0) {
        return '—';
    }

    return formatBytes(size);
}

export default function ManageAdminAttachmentsIndex() {
    const page = usePage<ManageAdminAttachmentsPageProps>();
    const { attachments, filters, filterOptions, viewMode, abilities } = page.props;
    const { t } = useTranslator('manage');
    const { t: tAttachments } = useTranslator('manage.attachments');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.admin.attachments', '附件資源'),
            href: '/manage/admin/attachments',
        },
    ];

    const pageTitle = t('sidebar.admin.attachments', '附件資源');

    const defaultFilterForm = useMemo<FilterFormState>(() => ({
        keyword: filters.keyword ?? '',
        type: filters.type ?? '',
        visibility: filters.visibility ?? '',
        space: filters.space ? String(filters.space) : '',
        tag: filters.tag ?? '',
        from: filters.from ?? '',
        to: filters.to ?? '',
        per_page: String(filters.per_page ?? attachments.meta.per_page ?? 15),
        sort: filters.sort ?? 'created_at',
        direction: (filters.direction ?? 'desc') as 'asc' | 'desc',
        view: viewMode ?? 'list',
    }), [attachments.meta.per_page, filters.keyword, filters.type, filters.visibility, filters.space, filters.tag, filters.from, filters.to, filters.per_page, filters.sort, filters.direction, viewMode]);

    const [filterForm, setFilterForm] = useState<FilterFormState>(defaultFilterForm);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [pendingBulkAction, setPendingBulkAction] = useState<'download' | 'delete' | null>(null);
    const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);
    const [detailAttachment, setDetailAttachment] = useState<ManageAttachmentListItem | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const keywordTimer = useRef<number | null>(null);

    const { toasts, showSuccess, showError, dismissToast } = useToast();

    useEffect(() => {
        setFilterForm(defaultFilterForm);
    }, [defaultFilterForm]);

    useEffect(() => {
        setSelectedIds([]);
    }, [attachments.data.map(att => att.id).join('-')]);

    const applyFilters = useCallback(
        (overrides: Partial<FilterFormState> = {}, options: { replace?: boolean } = {}) => {
            const nextState: FilterFormState = { ...filterForm, ...overrides } as FilterFormState;

            router.get('/manage/admin/attachments', buildPayload(nextState), {
                preserveScroll: true,
                preserveState: true,
                replace: options.replace ?? false,
            });
        },
        [filterForm]
    );

    useEffect(() => {
        if (filterForm.keyword === (filters.keyword ?? '')) {
            return;
        }

        if (keywordTimer.current) {
            window.clearTimeout(keywordTimer.current);
        }

        keywordTimer.current = window.setTimeout(() => {
            applyFilters({ keyword: filterForm.keyword }, { replace: true });
        }, 400);

        return () => {
            if (keywordTimer.current) {
                window.clearTimeout(keywordTimer.current);
            }
        };
    }, [filterForm.keyword, filters.keyword, applyFilters]);

    const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFilterForm((prev) => ({ ...prev, keyword: event.target.value }));
    };

    const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyFilters();
    };

    const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setFilterForm((prev) => ({ ...prev, type: value }));
        applyFilters({ type: value });
    };

    const handleVisibilityChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setFilterForm((prev) => ({ ...prev, visibility: value }));
        applyFilters({ visibility: value });
    };

    const handleSpaceChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setFilterForm((prev) => ({ ...prev, space: value }));
        applyFilters({ space: value });
    };

    const handleTagChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setFilterForm((prev) => ({ ...prev, tag: value }));
        applyFilters({ tag: value });
    };

    const handleDateChange = (field: 'from' | 'to') => (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setFilterForm((prev) => ({ ...prev, [field]: value }));
        applyFilters({ [field]: value } as Partial<FilterFormState>);
    };

    const handlePerPageChange = (value: string) => {
        setFilterForm((prev) => ({ ...prev, per_page: value }));
        applyFilters({ per_page: value }, { replace: true });
    };

    const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setFilterForm((prev) => ({ ...prev, sort: value }));
        applyFilters({ sort: value }, { replace: true });
    };

    const handleDirectionToggle = () => {
        const next = filterForm.direction === 'asc' ? 'desc' : 'asc';
        setFilterForm((prev) => ({ ...prev, direction: next }));
        applyFilters({ direction: next }, { replace: true });
    };

    const handleViewChange = (mode: 'list' | 'grid') => {
        if (mode === filterForm.view) {
            return;
        }
        setFilterForm((prev) => ({ ...prev, view: mode }));
        applyFilters({ view: mode }, { replace: true });
    };

    const handleResetFilters = () => {
        setFilterForm(defaultFilterForm);
        applyFilters(defaultFilterForm, { replace: true });
    };

    /**
     * 處理全選/取消全選附件。
     */
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(attachments.data.map(att => att.id));
        } else {
            setSelectedIds([]);
        }
    };

    /**
     * 處理單一附件的選取狀態。
     */
    const handleRowSelect = (id: number, checked: boolean) => {
        setSelectedIds(prev => {
            if (checked) {
                return [...new Set([...prev, id])];
            }
            return prev.filter(item => item !== id);
        });
    };

    /**
     * 批次刪除附件：呼叫後端 API 並重新載入列表。
     */
    const executeBulkDelete = async () => {
        try {
            const response = await apiClient.post<{ message?: string }>('/admin/attachments/bulk-delete', {
                attachment_ids: selectedIds,
            });
            showSuccess(response.data.message ?? tAttachments('bulk.delete_success', '已批次刪除附件。'));
            router.reload({ only: ['attachments'] });
        } catch (error) {
            if (isManageApiError(error)) {
                showError(error.message);
            } else {
                showError(tAttachments('bulk.delete_error', '批次刪除失敗。'));
            }
        } finally {
            setPendingBulkAction(null);
            setConfirmBulkOpen(false);
        }
    };

    /**
     * 批次下載附件：逐一開啟下載連結（瀏覽器會處理多檔下載）。
     */
    const executeBulkDownload = () => {
        const selectedAttachments = attachments.data.filter(att => selectedIds.includes(att.id));
        selectedAttachments.forEach((att) => {
            const href = att.download_url ?? att.external_url ?? att.file_url;
            if (href) {
                window.open(href, '_blank');
            }
        });
        showSuccess(tAttachments('bulk.download_success', '已開啟所有下載連結。'));
        setPendingBulkAction(null);
        setConfirmBulkOpen(false);
    };

    /**
     * 開啟附件詳細資訊抽屜。
     */
    const openDetail = (attachment: ManageAttachmentListItem) => {
        setDetailAttachment(attachment);
        setDetailOpen(true);
    };

    const toolbar = (
        <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <form className="flex flex-wrap items-center gap-2" onSubmit={handleFilterSubmit}>
                <div className="flex items-center gap-2">
                    <Input
                        type="search"
                        value={filterForm.keyword}
                        onChange={handleKeywordChange}
                        placeholder={tAttachments('filters.keyword_placeholder', '搜尋附件名稱或檔名')}
                        className="w-56"
                        aria-label={tAttachments('filters.keyword_label', '搜尋附件')}
                    />
                    <Button type="submit" size="sm" className="gap-1">
                        <Filter className="h-4 w-4" />
                        {tAttachments('filters.apply', '套用')}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" className="text-neutral-500" onClick={handleResetFilters}>
                        <RefreshCcw className="h-4 w-4" />
                        {tAttachments('filters.reset', '重設')}
                    </Button>
                </div>
                <Select value={filterForm.type} onChange={handleTypeChange} className="w-40" aria-label={tAttachments('filters.type_label', '附件類型')}>
                    <option value="">{tAttachments('filters.type_all', '全部類型')}</option>
                    {filterOptions.types.map((option) => (
                        <option key={String(option.value)} value={String(option.value)}>
                            {option.label}
                        </option>
                    ))}
                </Select>
                <Select
                    value={filterForm.visibility}
                    onChange={handleVisibilityChange}
                    className="w-36"
                    aria-label={tAttachments('filters.visibility_label', '可見性篩選')}
                >
                    <option value="">{tAttachments('filters.visibility_all', '全部可見性')}</option>
                    {filterOptions.visibilities.map((option) => (
                        <option key={String(option.value)} value={String(option.value)}>
                            {option.label}
                        </option>
                    ))}
                </Select>
                <Select value={filterForm.space} onChange={handleSpaceChange} className="w-40" aria-label={tAttachments('filters.space_label', '綁定空間')}>
                    <option value="">{tAttachments('filters.space_all', '全部空間')}</option>
                    {filterOptions.spaces.map((option) => (
                        <option key={String(option.value)} value={String(option.value)}>
                            {option.label}
                        </option>
                    ))}
                </Select>
                <Select value={filterForm.tag} onChange={handleTagChange} className="w-44" aria-label={tAttachments('filters.tag_label', '標籤篩選')}>
                    <option value="">{tAttachments('filters.tag_all', '全部標籤')}</option>
                    {filterOptions.tags.map((option) => (
                        <option key={String(option.value)} value={String(option.value)}>
                            {option.label}
                        </option>
                    ))}
                </Select>
                <div className="flex items-center gap-2">
                    <label className="text-xs text-neutral-500" htmlFor="filter-from">
                        {tAttachments('filters.from', '起始日期')}
                    </label>
                    <Input
                        id="filter-from"
                        type="date"
                        value={filterForm.from}
                        onChange={handleDateChange('from')}
                        className="h-9 w-36"
                    />
                    <span className="text-neutral-400">~</span>
                    <Input
                        type="date"
                        value={filterForm.to}
                        onChange={handleDateChange('to')}
                        className="h-9 w-36"
                    />
                </div>
            </form>

            <div className="flex flex-wrap items-center gap-2">
                {/* 批次操作選單：提供下載與刪除功能 */}
                {selectedIds.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                {tAttachments('bulk.actions', '批次操作')} ({selectedIds.length})
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel>{tAttachments('bulk.title', '選擇批次動作')}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={() => {
                                    setPendingBulkAction('download');
                                    setConfirmBulkOpen(true);
                                }}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                {tAttachments('bulk.download', '批次下載')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={!abilities.canDelete}
                                onSelect={() => {
                                    setPendingBulkAction('delete');
                                    setConfirmBulkOpen(true);
                                }}
                                className="gap-2 text-red-600"
                            >
                                <Trash2 className="h-4 w-4" />
                                {tAttachments('bulk.delete', '批次刪除')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                <Select value={filterForm.sort} onChange={handleSortChange} className="w-40" aria-label={tAttachments('filters.sort_label', '排序方式')}>
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {tAttachments(`filters.sort.${option.value}`, option.label)}
                        </option>
                    ))}
                </Select>
                <Button type="button" variant="outline" size="sm" onClick={handleDirectionToggle} className="gap-1">
                    <ArrowUpDown className="h-4 w-4" />
                    {filterForm.direction === 'asc'
                        ? tAttachments('filters.direction.asc', '昇冪')
                        : tAttachments('filters.direction.desc', '降冪')}
                </Button>
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant={filterForm.view === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleViewChange('list')}
                        aria-label={tAttachments('view.list', '列表模式')}
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={filterForm.view === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleViewChange('grid')}
                        aria-label={tAttachments('view.grid', '卡片模式')}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
                {abilities.canUpload ? (
                    <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => setUploadModalOpen(true)}
                    >
                        <CloudUpload className="h-4 w-4" />
                        {tAttachments('actions.upload', '上傳附件')}
                    </Button>
                ) : null}
            </div>
        </div>
    );

    const renderListView = (items: ManageAttachmentListItem[]) => {
        if (items.length === 0) {
            return <TableEmpty title={tAttachments('empty.title', '尚無附件')} description={tAttachments('empty.description', '還沒有任何可供管理的附件資源。')} />;
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow className="border-neutral-200/80">
                        <TableHead className="w-10">
                            <Checkbox
                                checked={selectedIds.length > 0 && selectedIds.length === items.length}
                                onCheckedChange={checked => handleSelectAll(Boolean(checked))}
                                aria-label={tAttachments('table.select_all', '全選')}
                            />
                        </TableHead>
                        <TableHead className="w-[34%] text-neutral-500">{tAttachments('table.title', '附件')}</TableHead>
                        <TableHead className="w-[16%] text-neutral-500">{tAttachments('table.type', '類型與可見性')}</TableHead>
                        <TableHead className="w-[22%] text-neutral-500">{tAttachments('table.attachable', '所屬資源')}</TableHead>
                        <TableHead className="w-[12%] text-neutral-500">{tAttachments('table.size', '檔案大小')}</TableHead>
                        <TableHead className="w-[8%] text-right text-neutral-500">{tAttachments('table.actions', '操作')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((attachment) => {
                        const downloadHref = attachment.download_url ?? attachment.external_url ?? attachment.file_url ?? '';

                        return (
                            <TableRow key={attachment.id} className="border-neutral-200/60">
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.includes(attachment.id)}
                                        onCheckedChange={checked => handleRowSelect(attachment.id, Boolean(checked))}
                                        aria-label={tAttachments('table.select_row', '選擇附件')}
                                    />
                                </TableCell>
                                <TableCell className="space-y-1">
                                    <div className="font-medium text-neutral-800">{attachment.title ?? attachment.filename ?? tAttachments('table.untitled', '未命名附件')}</div>
                                    <div className="text-xs text-neutral-500">
                                        {attachment.filename ?? tAttachments('table.no_filename', '無檔名')}
                                    </div>
                                    <div className="text-xs text-neutral-400">
                                        {tAttachments('table.uploaded_at', '上傳於 :date', {
                                            date: attachment.created_at
                                                ? new Date(attachment.created_at).toLocaleString(page.props.locale ?? 'zh-TW')
                                                : '—',
                                        })}
                                    </div>
                                    {/* 顯示附件描述內容，協助管理員快速辨識用途 */}
                                    {attachment.description ? (
                                        <p className="text-xs text-neutral-500">{attachment.description}</p>
                                    ) : null}
                                    {/* 標籤列出時改用膠囊標示，突顯分類資訊 */}
                                    {attachment.tags && attachment.tags.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {attachment.tags.map((tag) => (
                                                <Badge key={tag} variant="outline" className="text-[10px] capitalize text-neutral-500">
                                                    #{tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : null}
                                    {attachment.uploader ? (
                                        <div className="text-xs text-neutral-400">
                                            {tAttachments('table.uploader', '由 :name 上傳', { name: attachment.uploader.name })}
                                        </div>
                                    ) : null}
                                </TableCell>
                                <TableCell className="space-y-2">
                                    <Badge variant="outline" className="capitalize text-neutral-600">
                                        {tAttachments(`types.${attachment.type}`, attachment.type)}
                                    </Badge>
                                    <Badge variant={visibilityVariantMap[attachment.visibility] ?? 'outline'} className="capitalize">
                                        {tAttachments(`visibility.${attachment.visibility}`, attachment.visibility)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="space-y-1 text-sm text-neutral-600">
                                    {attachment.attachable ? (
                                        <div>
                                            <div className="font-medium text-neutral-700">{attachment.attachable.title ?? tAttachments('table.unknown_attachable', '未知來源')}</div>
                                            {attachment.attachable.space ? (
                                                <div className="text-xs text-neutral-500">
                                                    {tAttachments('table.space', '空間：:name', { name: attachment.attachable.space.name })}
                                                </div>
                                            ) : null}
                                            <div className="text-xs text-neutral-400 capitalize">
                                                {tAttachments(`table.attachable_type.${attachment.attachable.type}`, attachment.attachable.type)}
                                            </div>
                                        </div>
                                    ) : attachment.space ? (
                                        <div>
                                            <div className="font-medium text-neutral-700">{tAttachments('table.space', '空間：:name', { name: attachment.space.name })}</div>
                                            <div className="text-xs text-neutral-400">{tAttachments('table.orphan', '尚未綁定資源')}</div>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-neutral-400">{tAttachments('table.orphan', '尚未綁定資源')}</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm text-neutral-600">{formatFileSize(attachment.size)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openDetail(attachment)}
                                            className="gap-1"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1"
                                            asChild={!!downloadHref}
                                            disabled={!downloadHref}
                                        >
                                            {downloadHref ? (
                                                <Link href={downloadHref} target={attachment.external_url ? '_blank' : undefined} rel={attachment.external_url ? 'noopener noreferrer' : undefined}>
                                                    <Download className="h-4 w-4" />
                                                </Link>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-neutral-400">
                                                    <Download className="h-4 w-4" />
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        );
    };

    const renderGridView = (items: ManageAttachmentListItem[]) => {
        if (items.length === 0) {
            return (
                <div className="rounded-xl border border-dashed border-neutral-200/80 bg-white/80 px-6 py-12 text-center text-sm text-neutral-500">
                    {tAttachments('empty.description', '還沒有任何可供管理的附件資源。')}
                </div>
            );
        }

        return (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((attachment) => {
                    const downloadHref = attachment.download_url ?? attachment.external_url ?? attachment.file_url ?? '';

                    return (
                        <Card key={attachment.id} className="border border-neutral-200/80">
                            <CardHeader className="space-y-2">
                                <CardTitle className="flex items-start justify-between gap-2 text-base font-semibold text-neutral-800">
                                    <span>{attachment.title ?? attachment.filename ?? tAttachments('table.untitled', '未命名附件')}</span>
                                    <Badge variant={visibilityVariantMap[attachment.visibility] ?? 'outline'} className="capitalize">
                                        {tAttachments(`visibility.${attachment.visibility}`, attachment.visibility)}
                                    </Badge>
                                </CardTitle>
                                <div className="text-xs text-neutral-500">
                                    {attachment.filename ?? tAttachments('table.no_filename', '無檔名')}
                                </div>
                                <div className="text-xs text-neutral-400">
                                    {tAttachments('table.uploaded_at', '上傳於 :date', {
                                        date: attachment.created_at
                                            ? new Date(attachment.created_at).toLocaleString(page.props.locale ?? 'zh-TW')
                                            : '—',
                                    })}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-neutral-600">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="capitalize text-neutral-600">
                                        {tAttachments(`types.${attachment.type}`, attachment.type)}
                                    </Badge>
                                    <span className="text-xs text-neutral-400">{formatFileSize(attachment.size)}</span>
                                </div>
                                {/* 描述文字以段落顯示，提供更多上下文 */}
                                {attachment.description ? (
                                    <p className="text-xs text-neutral-500">{attachment.description}</p>
                                ) : null}
                                {/* 在卡片模式同樣顯示標籤資料 */}
                                {attachment.tags && attachment.tags.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {attachment.tags.map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-[10px] capitalize text-neutral-500">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : null}
                                {attachment.attachable ? (
                                    <div className="space-y-1 rounded-lg bg-neutral-50/70 p-3 text-xs">
                                        <div className="font-medium text-neutral-700">
                                            {tAttachments('grid.attachable_title', '綁定資源')}
                                        </div>
                                        <div className="text-neutral-600">{attachment.attachable.title ?? tAttachments('table.unknown_attachable', '未知來源')}</div>
                                        {attachment.attachable.space ? (
                                            <div className="text-neutral-500">
                                                {tAttachments('table.space', '空間：:name', { name: attachment.attachable.space.name })}
                                            </div>
                                        ) : null}
                                        <div className="text-neutral-400 capitalize">
                                            {tAttachments(`table.attachable_type.${attachment.attachable.type}`, attachment.attachable.type)}
                                        </div>
                                    </div>
                                ) : attachment.space ? (
                                    <div className="space-y-1 rounded-lg bg-neutral-50/70 p-3 text-xs">
                                        <div className="font-medium text-neutral-700">{tAttachments('table.space', '空間：:name', { name: attachment.space.name })}</div>
                                        <div className="text-neutral-500">{tAttachments('table.orphan', '尚未綁定資源')}</div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg bg-neutral-50/70 p-3 text-xs text-neutral-400">
                                        {tAttachments('table.orphan', '尚未綁定資源')}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex items-center justify-between">
                                <div className="text-xs text-neutral-400">
                                    {attachment.uploader
                                        ? tAttachments('table.uploader', '由 :name 上傳', { name: attachment.uploader.name })
                                        : tAttachments('table.uploader_unknown', '上傳者未知')}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                    asChild={!!downloadHref}
                                    disabled={!downloadHref}
                                >
                                    {downloadHref ? (
                                        <Link href={downloadHref} target={attachment.external_url ? '_blank' : undefined} rel={attachment.external_url ? 'noopener noreferrer' : undefined}>
                                            <Download className="h-4 w-4" />
                                            {tAttachments('table.download', '下載')}
                                        </Link>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-neutral-400">
                                            <Download className="h-4 w-4" />
                                            {tAttachments('table.download', '下載')}
                                        </span>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        );
    };

    const meta = attachments.meta;

    return (
        <>
            <Head title={pageTitle} />
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            <ManagePage
                title={pageTitle}
                description={t('attachments.description', '管理公告使用的文件與媒體資源。')}
                breadcrumbs={breadcrumbs}
                toolbar={toolbar}
            >
                <section className="rounded-xl border border-neutral-200/80 bg-white/95 p-4 shadow-sm">
                    {/* 顯示選擇狀態統計資訊 */}
                    {selectedIds.length > 0 && (
                        <div className="mb-3 rounded-lg bg-blue-50/70 p-3 text-sm text-blue-700">
                            {tAttachments('selection.count', '已選擇 {count} 筆附件', { count: selectedIds.length })}
                        </div>
                    )}

                    {filterForm.view === 'grid'
                        ? renderGridView(attachments.data)
                        : renderListView(attachments.data)}
                    <Pagination
                        meta={{
                            current_page: meta.current_page,
                            from: meta.from ?? 0,
                            to: meta.to ?? 0,
                            total: meta.total,
                            last_page: meta.last_page,
                            per_page: meta.per_page,
                            links: meta.links ?? [],
                        }}
                        onPerPageChange={(value) => handlePerPageChange(String(value))}
                        className="mt-4"
                    />
                </section>
            </ManagePage>

            {/* 批次操作確認對話框 */}
            <ConfirmDialog
                open={confirmBulkOpen}
                onOpenChange={setConfirmBulkOpen}
                title={
                    pendingBulkAction === 'download'
                        ? tAttachments('bulk.confirm_download_title', '確認批次下載')
                        : tAttachments('bulk.confirm_delete_title', '確認批次刪除')
                }
                description={
                    pendingBulkAction === 'download'
                        ? tAttachments('bulk.confirm_download_description', '將開啟所有選取附件的下載連結，是否繼續？')
                        : tAttachments('bulk.confirm_delete_description', '將永久刪除所有選取的附件，此動作無法還原，是否繼續？')
                }
                onConfirm={() => {
                    if (pendingBulkAction === 'download') {
                        executeBulkDownload();
                    } else if (pendingBulkAction === 'delete') {
                        executeBulkDelete();
                    }
                }}
                variant={pendingBulkAction === 'delete' ? 'destructive' : 'default'}
            />

            {/* 附件詳細資訊抽屜：顯示完整 metadata 與引用紀錄 */}
            <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>
                            {detailAttachment?.title ?? detailAttachment?.filename ?? tAttachments('detail.title', '附件詳情')}
                        </SheetTitle>
                        <SheetDescription>
                            {tAttachments('detail.description', '檢視附件的完整資訊與引用紀錄。')}
                        </SheetDescription>
                    </SheetHeader>

                    {detailAttachment && (
                        <div className="grid gap-6 px-4 pb-8 pt-6">
                            {/* 基本資訊區塊 */}
                            <div className="rounded-lg border border-neutral-200/70 p-4">
                                <h3 className="mb-3 text-sm font-semibold text-neutral-700">
                                    {tAttachments('detail.sections.basic', '基本資訊')}
                                </h3>
                                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                                    <div>
                                        <dt className="text-neutral-400">{tAttachments('detail.fields.filename', '檔案名稱')}</dt>
                                        <dd className="text-neutral-700">{detailAttachment.filename ?? '—'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400">{tAttachments('detail.fields.size', '檔案大小')}</dt>
                                        <dd className="text-neutral-700">{formatFileSize(detailAttachment.size)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400">{tAttachments('detail.fields.type', '類型')}</dt>
                                        <dd className="text-neutral-700 capitalize">{detailAttachment.type}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400">{tAttachments('detail.fields.visibility', '可見性')}</dt>
                                        <dd>
                                            <Badge variant={visibilityVariantMap[detailAttachment.visibility] ?? 'outline'} className="capitalize">
                                                {detailAttachment.visibility}
                                            </Badge>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400">{tAttachments('detail.fields.created_at', '建立時間')}</dt>
                                        <dd className="text-neutral-700">
                                            {detailAttachment.created_at
                                                ? new Date(detailAttachment.created_at).toLocaleString(page.props.locale ?? 'zh-TW')
                                                : '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-neutral-400">{tAttachments('detail.fields.uploader', '上傳者')}</dt>
                                        <dd className="text-neutral-700">
                                            {detailAttachment.uploader?.name ?? tAttachments('detail.uploader_unknown', '未知')}
                                        </dd>
                                    </div>
                                </dl>

                                {detailAttachment.description && (
                                    <div className="mt-4">
                                        <dt className="text-neutral-400">{tAttachments('detail.fields.description', '描述')}</dt>
                                        <dd className="mt-1 text-sm text-neutral-700">{detailAttachment.description}</dd>
                                    </div>
                                )}
                            </div>

                            {/* 標籤資訊 */}
                            {detailAttachment.tags && detailAttachment.tags.length > 0 && (
                                <div className="rounded-lg border border-neutral-200/70 p-4">
                                    <h3 className="mb-3 text-sm font-semibold text-neutral-700">
                                        {tAttachments('detail.sections.tags', '標籤')}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {detailAttachment.tags.map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-xs capitalize">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 引用資源資訊 */}
                            <div className="rounded-lg border border-neutral-200/70 p-4">
                                <h3 className="mb-3 text-sm font-semibold text-neutral-700">
                                    {tAttachments('detail.sections.usage', '引用紀錄')}
                                </h3>
                                {detailAttachment.attachable ? (
                                    <div className="space-y-2 rounded-lg bg-neutral-50/70 p-3 text-sm">
                                        <div className="font-medium text-neutral-700">
                                            {detailAttachment.attachable.title ?? tAttachments('detail.unknown_resource', '未知資源')}
                                        </div>
                                        <div className="text-xs text-neutral-500 capitalize">
                                            {tAttachments(`table.attachable_type.${detailAttachment.attachable.type}`, detailAttachment.attachable.type)}
                                        </div>
                                        {detailAttachment.attachable.space && (
                                            <div className="text-xs text-neutral-600">
                                                {tAttachments('table.space', '空間：:name', { name: detailAttachment.attachable.space.name })}
                                            </div>
                                        )}
                                    </div>
                                ) : detailAttachment.space ? (
                                    <div className="space-y-2 rounded-lg bg-neutral-50/70 p-3 text-sm">
                                        <div className="font-medium text-neutral-700">
                                            {tAttachments('table.space', '空間：:name', { name: detailAttachment.space.name })}
                                        </div>
                                        <div className="text-xs text-neutral-500">{tAttachments('table.orphan', '尚未綁定資源')}</div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-neutral-500">
                                        {tAttachments('detail.no_usage', '此附件尚未被任何資源引用。')}
                                    </p>
                                )}
                            </div>

                            {/* 操作按鈕 */}
                            <div className="flex items-center justify-end gap-3 border-t border-neutral-200/70 pt-4">
                                {detailAttachment.download_url ?? detailAttachment.external_url ?? detailAttachment.file_url ? (
                                    <Button
                                        variant="outline"
                                        asChild
                                        className="gap-2"
                                    >
                                        <Link
                                            href={detailAttachment.download_url ?? detailAttachment.external_url ?? detailAttachment.file_url ?? ''}
                                            target={detailAttachment.external_url ? '_blank' : undefined}
                                            rel={detailAttachment.external_url ? 'noopener noreferrer' : undefined}
                                        >
                                            <Download className="h-4 w-4" />
                                            {tAttachments('detail.actions.download', '下載')}
                                        </Link>
                                    </Button>
                                ) : null}
                                <Button variant="ghost" onClick={() => setDetailOpen(false)}>
                                    {tAttachments('detail.actions.close', '關閉')}
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* 上傳附件對話框 */}
            <AttachmentUploadModal
                open={uploadModalOpen}
                onOpenChange={setUploadModalOpen}
                onUploadComplete={() => {
                    router.reload({ only: ['attachments'] });
                }}
                filterOptions={filterOptions}
                onError={showError}
                onSuccess={showSuccess}
            />
        </>
    );
}

ManageAdminAttachmentsIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
