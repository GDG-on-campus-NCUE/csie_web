import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';

import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowUpDown,
    CheckCircle2,
    CloudUpload,
    Download,
    Eye,
    Filter,
    LayoutGrid,
    Link2,
    List as ListIcon,
    MoreHorizontal,
    Paperclip,
    RefreshCcw,
    Trash2,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import ManageToolbar from '@/components/manage/manage-toolbar';
import ResponsiveDataView from '@/components/manage/responsive-data-view';
import DataCard from '@/components/manage/data-card';
import AttachmentUploadModal from '@/components/manage/admin/attachment-upload-modal';
import TableEmpty from '@/components/manage/table-empty';
import ToastContainer from '@/components/ui/toast-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslator } from '@/hooks/use-translator';
import useToast from '@/hooks/use-toast';
import { apiClient, isManageApiError } from '@/lib/manage/api-client';
import { formatDateTime } from '@/lib/shared/format';
import { cn, formatBytes } from '@/lib/shared/utils';
import type {
    ManageAttachmentFilterOptions,
    ManageAttachmentFilterState,
    ManageAttachmentListItem,
    ManageAttachmentListResponse,
} from '@/types/manage';
import type { BreadcrumbItem, SharedData } from '@/types/shared';

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

type BulkActionType = 'download' | 'delete';

const VISIBILITY_BADGE: Record<string, string> = {
    public: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    private: 'border-rose-200 bg-rose-50 text-rose-700',
    internal: 'border-amber-200 bg-amber-50 text-amber-700',
};

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
    { value: 'created_at', label: 'filters.sort.created_at' },
    { value: 'title', label: 'filters.sort.title' },
    { value: 'size', label: 'filters.sort.size' },
];

const PER_PAGE_OPTIONS = ['10', '20', '50', '100'] as const;

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

function isImageType(mime: string | null | undefined) {
    return !!mime && mime.startsWith('image/');
}

function getAttachmentPreview(attachment: ManageAttachmentListItem) {
    if (isImageType(attachment.type)) {
        return attachment.file_url ?? attachment.external_url ?? undefined;
    }

    return undefined;
}

function AttachmentCard({
    attachment,
    locale,
    onSelect,
    selected,
    onOpen,
    canDelete,
    onDownload,
}: {
    attachment: ManageAttachmentListItem;
    locale: string;
    onSelect: (checked: boolean) => void;
    selected: boolean;
    onOpen: () => void;
    canDelete: boolean;
    onDownload: () => void;
}) {
    const { t: tAttachments } = useTranslator('manage.attachments');
    const preview = getAttachmentPreview(attachment);
    const downloadHref = attachment.download_url ?? attachment.external_url ?? attachment.file_url ?? '';

    const metadata = [
        {
            label: tAttachments('table.type', '類型與可見性'),
            value: (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">{attachment.type}</span>
                    <Badge
                        variant="outline"
                        className={cn(
                            'rounded-full border px-2 py-0.5 text-xs',
                            VISIBILITY_BADGE[attachment.visibility] ?? 'border-neutral-200 bg-neutral-100 text-neutral-600'
                        )}
                    >
                        {tAttachments(`visibility.${attachment.visibility}`, attachment.visibility)}
                    </Badge>
                </div>
            ),
        },
        {
            label: tAttachments('table.size', '檔案大小'),
            value: attachment.size ? formatBytes(attachment.size) : '—',
        },
        {
            label: tAttachments('table.created_at', '上傳時間'),
            value: formatDateTime(attachment.created_at ?? attachment.uploaded_at, locale) || '—',
        },
    ];

    return (
        <DataCard
            title={attachment.title ?? attachment.filename ?? tAttachments('table.untitled', '未命名附件')}
            description={attachment.description ?? undefined}
            image={preview}
            metadata={metadata}
            footer={
                attachment.uploader
                    ? tAttachments('table.uploader', '由 :name 上傳', { name: attachment.uploader.name })
                    : tAttachments('table.uploader_unknown', '上傳者未知')
            }
            actions={[
                <Button key="open" type="button" variant="outline" className="w-full justify-center gap-2" onClick={onOpen}>
                    <Eye className="h-4 w-4" />
                    {tAttachments('actions.preview', '檢視資訊')}
                </Button>,
                <Button
                    key="download"
                    type="button"
                    variant="outline"
                    className="w-full justify-center gap-2"
                    disabled={!downloadHref}
                    onClick={onDownload}
                >
                    <Download className="h-4 w-4" />
                    {tAttachments('table.download', '下載')}
                </Button>,
            ]}
            mobileActions={[
                <Button
                    key="select"
                    type="button"
                    variant={selected ? 'default' : 'outline'}
                    className="w-full justify-center gap-2"
                    onClick={() => onSelect(!selected)}
                >
                    <CheckCircle2 className="h-4 w-4" />
                    {selected
                        ? tAttachments('selection.added', '已加入批次操作')
                        : tAttachments('selection.add', '加入批次操作')}
                </Button>,
                canDelete ? (
                    <Button
                        key="delete"
                        type="button"
                        variant="destructive"
                        className="w-full justify-center gap-2"
                        onClick={() => onSelect(true)}
                    >
                        <Trash2 className="h-4 w-4" />
                        {tAttachments('bulk.delete', '批次刪除')}
                    </Button>
                ) : null,
            ]}
        >
            {attachment.tags && attachment.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                    {attachment.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-neutral-100 px-2 py-0.5">
                            #{tag}
                        </span>
                    ))}
                </div>
            ) : null}
            {attachment.space ? (
                <div className="text-xs text-neutral-500">
                    {tAttachments('table.space', '歸屬空間：:name', { name: attachment.space.name })}
                </div>
            ) : null}
        </DataCard>
    );
}

export default function ManageAdminAttachmentsIndex() {
    const page = usePage<ManageAdminAttachmentsPageProps>();
    const { attachments, filters, filterOptions, viewMode, abilities } = page.props;
    const locale = page.props.locale ?? 'zh-TW';

    const { t } = useTranslator('manage');
    const { t: tAttachments } = useTranslator('manage.attachments');
    const { toasts, showSuccess, showError, dismissToast } = useToast();

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
        per_page: String(filters.per_page ?? attachments.meta.per_page ?? Number(PER_PAGE_OPTIONS[0])),
        sort: filters.sort ?? 'created_at',
        direction: (filters.direction ?? 'desc') as 'asc' | 'desc',
        view: viewMode ?? 'list',
    }), [attachments.meta.per_page, filters.keyword, filters.type, filters.visibility, filters.space, filters.tag, filters.from, filters.to, filters.per_page, filters.sort, filters.direction, viewMode]);

    const [filterForm, setFilterForm] = useState<FilterFormState>(defaultFilterForm);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [pendingBulkAction, setPendingBulkAction] = useState<BulkActionType | null>(null);
    const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);
    const [detailAttachment, setDetailAttachment] = useState<ManageAttachmentListItem | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const keywordTimer = useRef<number | null>(null);

    useEffect(() => {
        setFilterForm(defaultFilterForm);
    }, [defaultFilterForm]);

    useEffect(() => {
        setSelectedIds([]);
    }, [attachments.data.map((item) => item.id).join('-')]);

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

    const handlePerPageChange = (value: number) => {
        const next = String(value);
        setFilterForm((prev) => ({ ...prev, per_page: next }));
        applyFilters({ per_page: next }, { replace: true });
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

    const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyFilters();
    };

    const handleResetFilters = () => {
        setFilterForm(defaultFilterForm);
        applyFilters(defaultFilterForm, { replace: true });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(attachments.data.map((item) => item.id));
        } else {
            setSelectedIds([]);
        }
    };

    const toggleSelection = (id: number, checked: boolean) => {
        setSelectedIds((prev) => {
            if (checked) {
                return [...new Set([...prev, id])];
            }
            return prev.filter((item) => item !== id);
        });
    };

    const openDetail = (attachment: ManageAttachmentListItem) => {
        setDetailAttachment(attachment);
        setDetailOpen(true);
    };

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

    const executeBulkDownload = () => {
        const selectedAttachments = attachments.data.filter((attachment) => selectedIds.includes(attachment.id));
        selectedAttachments.forEach((attachment) => {
            const href = attachment.download_url ?? attachment.external_url ?? attachment.file_url;
            if (href) {
                window.open(href, '_blank');
            }
        });
        showSuccess(tAttachments('bulk.download_success', '已開啟所有下載連結。'));
        setPendingBulkAction(null);
        setConfirmBulkOpen(false);
    };

    const toolbar = (
        <ManageToolbar
            wrap
            primary={[
                <div key="keyword" className="grid w-full gap-1 sm:w-64">
                    <label htmlFor="filter-keyword" className="text-xs font-medium text-neutral-600">
                        {tAttachments('filters.keyword_label', '搜尋附件')}
                    </label>
                    <Input
                        id="filter-keyword"
                        type="search"
                        value={filterForm.keyword}
                        onChange={handleKeywordChange}
                        placeholder={tAttachments('filters.keyword_placeholder', '搜尋附件名稱或檔名')}
                    />
                </div>,
                <div key="type" className="grid w-full gap-1 sm:w-44">
                    <label htmlFor="filter-type" className="text-xs font-medium text-neutral-600">
                        {tAttachments('filters.type_label', '附件類型')}
                    </label>
                    <Select id="filter-type" value={filterForm.type} onChange={handleTypeChange}>
                        <option value="">{tAttachments('filters.type_all', '全部類型')}</option>
                        {filterOptions.types.map((option) => (
                            <option key={String(option.value)} value={String(option.value)}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                </div>,
                <div key="visibility" className="grid w-full gap-1 sm:w-44">
                    <label htmlFor="filter-visibility" className="text-xs font-medium text-neutral-600">
                        {tAttachments('filters.visibility_label', '可見性')}
                    </label>
                    <Select id="filter-visibility" value={filterForm.visibility} onChange={handleVisibilityChange}>
                        <option value="">{tAttachments('filters.visibility_all', '全部可見性')}</option>
                        {filterOptions.visibilities.map((option) => (
                            <option key={String(option.value)} value={String(option.value)}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                </div>,
            ]}
            secondary={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                    {selectedIds.length > 0 ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" size="sm" variant="outline" className="gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {tAttachments('bulk.actions', '批次操作')} ({selectedIds.length})
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
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
                                    className="gap-2 text-rose-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {tAttachments('bulk.delete', '批次刪除')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}

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
                            type="button"
                            size="sm"
                            className="gap-2 bg-[#10B981] text-white hover:bg-[#059669]"
                            onClick={() => setUploadModalOpen(true)}
                        >
                            <CloudUpload className="h-4 w-4" />
                            {tAttachments('actions.upload', '上傳附件')}
                        </Button>
                    ) : null}
                </div>
            }
        >
            <form onSubmit={handleFilterSubmit} className="flex w-full flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                    <div className="grid gap-1">
                        <label htmlFor="filter-space" className="text-xs font-medium text-neutral-600">
                            {tAttachments('filters.space_label', '綁定空間')}
                        </label>
                        <Select id="filter-space" value={filterForm.space} onChange={handleSpaceChange} className="sm:w-48">
                            <option value="">{tAttachments('filters.space_all', '全部空間')}</option>
                            {filterOptions.spaces.map((option) => (
                                <option key={String(option.value)} value={String(option.value)}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="grid gap-1">
                        <label htmlFor="filter-tag" className="text-xs font-medium text-neutral-600">
                            {tAttachments('filters.tag_label', '標籤篩選')}
                        </label>
                        <Select id="filter-tag" value={filterForm.tag} onChange={handleTagChange} className="sm:w-48">
                            <option value="">{tAttachments('filters.tag_all', '全部標籤')}</option>
                            {filterOptions.tags.map((option) => (
                                <option key={String(option.value)} value={String(option.value)}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="grid gap-1">
                            <label htmlFor="filter-from" className="text-xs font-medium text-neutral-600">
                                {tAttachments('filters.from', '起始日期')}
                            </label>
                            <Input id="filter-from" type="date" value={filterForm.from} onChange={handleDateChange('from')} className="h-9 sm:w-40" />
                        </div>
                        <span className="mt-6 text-neutral-400">~</span>
                        <div className="grid gap-1">
                            <label htmlFor="filter-to" className="text-xs font-medium text-neutral-600">
                                {tAttachments('filters.to', '結束日期')}
                            </label>
                            <Input id="filter-to" type="date" value={filterForm.to} onChange={handleDateChange('to')} className="h-9 sm:w-40" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="grid gap-1 sm:w-48">
                        <label htmlFor="filter-sort" className="text-xs font-medium text-neutral-600">
                            {tAttachments('filters.sort_label', '排序方式')}
                        </label>
                        <Select id="filter-sort" value={filterForm.sort} onChange={handleSortChange}>
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {tAttachments(option.label, option.label)}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <Button type="button" size="sm" variant="outline" className="gap-2" onClick={handleDirectionToggle}>
                        <ArrowUpDown className="h-4 w-4" />
                        {filterForm.direction === 'asc'
                            ? tAttachments('filters.direction.asc', '昇冪')
                            : tAttachments('filters.direction.desc', '降冪')}
                    </Button>
                    <Button type="submit" size="sm" className="gap-2 bg-[#0F172A] text-white hover:bg-[#0B1220]">
                        <Filter className="h-4 w-4" />
                        {tAttachments('filters.apply', '套用條件')}
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={handleResetFilters}>
                        <RefreshCcw className="h-4 w-4" />
                        {tAttachments('filters.reset', '重設')}
                    </Button>
                </div>
            </form>
        </ManageToolbar>
    );

    const hasAttachments = attachments.data.length > 0;
    const headerCheckboxState = selectedIds.length > 0 && selectedIds.length === attachments.data.length;

    const mobileBulkActions = selectedIds.length > 0
        ? [
              <div
                  key="summary"
                  className="flex items-center justify-between rounded-lg border border-neutral-200/80 bg-neutral-50 px-3 py-2 text-sm text-neutral-600"
              >
                  <span className="font-medium text-neutral-700">
                      {tAttachments('selection.count', '已選擇 {count} 筆附件', { count: selectedIds.length })}
                  </span>
                  <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setSelectedIds([])}>
                      {tAttachments('selection.clear', '清除')}
                  </Button>
              </div>,
              <Button
                  key="mobile-download"
                  type="button"
                  className="w-full justify-center gap-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                  onClick={() => {
                      setPendingBulkAction('download');
                      setConfirmBulkOpen(true);
                  }}
              >
                  <Download className="h-4 w-4" />
                  {tAttachments('bulk.download', '批次下載')}
              </Button>,
              abilities.canDelete ? (
                  <Button
                      key="mobile-delete"
                      type="button"
                      variant="destructive"
                      className="w-full justify-center gap-2"
                      onClick={() => {
                          setPendingBulkAction('delete');
                          setConfirmBulkOpen(true);
                      }}
                  >
                      <Trash2 className="h-4 w-4" />
                      {tAttachments('bulk.delete', '批次刪除')}
                  </Button>
              ) : null,
          ].filter(Boolean)
        : undefined;

    const tableView = (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-neutral-200/70 bg-neutral-50/70">
                        <TableHead className="w-10">
                            <Checkbox
                                checked={headerCheckboxState}
                                onCheckedChange={(checked) => handleSelectAll(checked === true)}
                                aria-label={tAttachments('table.select_all', '全選')}
                            />
                        </TableHead>
                        <TableHead className="min-w-[220px] text-neutral-500">
                            {tAttachments('table.title', '附件資訊')}
                        </TableHead>
                        <TableHead className="min-w-[180px] text-neutral-500">
                            {tAttachments('table.type', '類型與可見性')}
                        </TableHead>
                        <TableHead className="min-w-[220px] text-neutral-500">
                            {tAttachments('table.attachable', '關聯資源')}
                        </TableHead>
                        <TableHead className="min-w-[120px] text-neutral-500">
                            {tAttachments('table.size', '檔案大小')}
                        </TableHead>
                        <TableHead className="w-28 text-right text-neutral-500" aria-label={tAttachments('table.actions', '操作')} />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {attachments.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="py-12">
                                <TableEmpty
                                    title={tAttachments('empty.title', '尚無附件')}
                                    description={tAttachments('empty.description', '還沒有任何可供管理的附件資源。')}
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        attachments.data.map((attachment) => {
                            const downloadHref = attachment.download_url ?? attachment.external_url ?? attachment.file_url ?? '';
                            const preview = getAttachmentPreview(attachment);
                            const isSelected = selectedIds.includes(attachment.id);

                            return (
                                <TableRow key={attachment.id} className={cn('border-b border-neutral-200/60', isSelected && 'bg-blue-50/40')}>
                                    <TableCell>
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={(checked) => toggleSelection(attachment.id, checked === true)}
                                            aria-label={tAttachments('table.select_row', '選擇附件')}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-start gap-3">
                                            {preview ? (
                                                <div className="h-16 w-20 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                                                    <img src={preview} alt={attachment.title ?? attachment.filename ?? ''} className="h-full w-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="flex h-16 w-20 items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 text-neutral-400">
                                                    <Paperclip className="h-6 w-6" />
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <div className="font-medium text-neutral-900">
                                                    {attachment.title ?? attachment.filename ?? tAttachments('table.untitled', '未命名附件')}
                                                </div>
                                                {attachment.description ? (
                                                    <div className="text-xs text-neutral-500">{attachment.description}</div>
                                                ) : null}
                                                <div className="flex flex-wrap gap-1 text-[11px] text-neutral-500">
                                                    {attachment.tags?.map((tag) => (
                                                        <span key={tag} className="rounded-full bg-neutral-100 px-2 py-0.5">#{tag}</span>
                                                    ))}
                                                </div>
                                                <div className="text-xs text-neutral-400">
                                                    {attachment.uploader
                                                        ? tAttachments('table.uploader', '由 :name 上傳', { name: attachment.uploader.name })
                                                        : tAttachments('table.uploader_unknown', '上傳者未知')}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <span className="text-sm text-neutral-600">{attachment.type}</span>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'w-fit rounded-full border px-2 py-0.5 text-xs',
                                                    VISIBILITY_BADGE[attachment.visibility] ?? 'border-neutral-200 bg-neutral-100 text-neutral-600'
                                                )}
                                            >
                                                {tAttachments(`visibility.${attachment.visibility}`, attachment.visibility)}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {attachment.attachable ? (
                                            <div className="space-y-1 text-sm text-neutral-600">
                                                <div className="font-medium text-neutral-800">{attachment.attachable.title ?? attachment.attachable.type}</div>
                                                {attachment.attachable.space ? (
                                                    <div className="text-xs text-neutral-500">
                                                        {tAttachments('table.space', '歸屬空間：:name', { name: attachment.attachable.space.name })}
                                                    </div>
                                                ) : null}
                                                <div className="flex items-center gap-1 text-xs text-neutral-400">
                                                    <Link2 className="h-3.5 w-3.5" />
                                                    <span className="capitalize">{attachment.attachable.type}</span>
                                                </div>
                                            </div>
                                        ) : attachment.space ? (
                                            <div className="rounded-lg bg-neutral-50/80 p-3 text-xs text-neutral-500">
                                                {tAttachments('table.space', '歸屬空間：:name', { name: attachment.space.name })}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg bg-neutral-50/80 p-3 text-xs text-neutral-400">
                                                {tAttachments('table.orphan', '尚未綁定資源')}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-neutral-600">
                                        {attachment.size ? formatBytes(attachment.size) : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-neutral-700">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44">
                                                <DropdownMenuItem className="gap-2" onSelect={() => openDetail(attachment)}>
                                                    <Eye className="h-4 w-4" />
                                                    {tAttachments('actions.preview', '檢視資訊')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className={cn('gap-2', downloadHref ? '' : 'pointer-events-none text-neutral-400')}
                                                    onSelect={() => {
                                                        if (downloadHref) {
                                                            window.open(downloadHref, '_blank');
                                                        }
                                                    }}
                                                >
                                                    <Download className="h-4 w-4" />
                                                    {tAttachments('table.download', '下載')}
                                                </DropdownMenuItem>
                                                {abilities.canDelete ? (
                                                    <DropdownMenuItem
                                                        className="gap-2 text-rose-600"
                                                        onSelect={() => {
                                                            setSelectedIds([attachment.id]);
                                                            setPendingBulkAction('delete');
                                                            setConfirmBulkOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        {tAttachments('bulk.delete_single', '刪除此附件')}
                                                    </DropdownMenuItem>
                                                ) : null}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );

    const cardView = (
        <div className="space-y-3">
            {hasAttachments
                ? attachments.data.map((attachment) => {
                      const isSelected = selectedIds.includes(attachment.id);
                      const downloadHref = attachment.download_url ?? attachment.external_url ?? attachment.file_url ?? '';

                      return (
                          <AttachmentCard
                              key={attachment.id}
                              attachment={attachment}
                              locale={locale}
                              selected={isSelected}
                              onSelect={(checked) => toggleSelection(attachment.id, checked)}
                              onOpen={() => openDetail(attachment)}
                              canDelete={abilities.canDelete}
                              onDownload={() => {
                                  if (downloadHref) {
                                      window.open(downloadHref, '_blank');
                                  }
                              }}
                          />
                      );
                  })
                : (
                      <div className="rounded-xl border border-dashed border-neutral-200 bg-white/80 p-6 text-center">
                          <TableEmpty
                              title={tAttachments('empty.title', '尚無附件')}
                              description={tAttachments('empty.description', '還沒有任何可供管理的附件資源。')}
                          />
                      </div>
                  )}
        </div>
    );

    const paginationMeta = {
        current_page: attachments.meta.current_page ?? 1,
        last_page: attachments.meta.last_page ?? 1,
        per_page: attachments.meta.per_page ?? Number(filterForm.per_page),
        total: attachments.meta.total ?? 0,
        from: attachments.meta.from ?? 0,
        to: attachments.meta.to ?? 0,
        links: attachments.links ?? [],
    };

    const confirmTitle = pendingBulkAction === 'download'
        ? tAttachments('bulk.confirm_download_title', '確認批次下載')
        : tAttachments('bulk.confirm_delete_title', '確認批次刪除');

    const confirmDescription = pendingBulkAction === 'download'
        ? tAttachments('bulk.confirm_download_description', '將開啟所有選取附件的下載連結，是否繼續？')
        : tAttachments('bulk.confirm_delete_description', '將永久刪除所有選取的附件，此動作無法還原，是否繼續？');

    return (
        <>
            <Head title={pageTitle} />
            <ToastContainer toasts={toasts} onDismiss={dismissToast} position="top-right" />
            <ManagePage
                title={pageTitle}
                description={tAttachments('description', '集中管理公告所使用的媒體與文件，支援批次操作與行動版卡片檢視。')}
                breadcrumbs={breadcrumbs}
                toolbar={toolbar}
            >
                <section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
                    <ResponsiveDataView
                        className="space-y-0"
                        mode={filterForm.view === 'grid' ? 'card' : 'auto'}
                        table={tableView}
                        card={cardView}
                        isEmpty={!hasAttachments}
                        emptyState={
                            <div className="p-8">
                                <TableEmpty
                                    title={tAttachments('empty.title', '尚無附件')}
                                    description={tAttachments('empty.description', '還沒有任何可供管理的附件資源。')}
                                />
                            </div>
                        }
                        stickyActions={mobileBulkActions}
                    />

                    <div className="border-t border-neutral-200/80 px-4 py-3">
                        <Pagination
                            meta={paginationMeta}
                            onPerPageChange={handlePerPageChange}
                            perPageOptions={PER_PAGE_OPTIONS.map((item) => Number(item))}
                        />
                    </div>
                </section>
            </ManagePage>

            <ConfirmDialog
                open={confirmBulkOpen}
                onOpenChange={setConfirmBulkOpen}
                title={confirmTitle}
                description={confirmDescription}
                onConfirm={() => {
                    if (pendingBulkAction === 'download') {
                        executeBulkDownload();
                    } else if (pendingBulkAction === 'delete') {
                        executeBulkDelete();
                    }
                }}
                variant={pendingBulkAction === 'delete' ? 'destructive' : 'default'}
            />

            <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
                <SheetContent className="w-full max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {detailAttachment?.title ?? detailAttachment?.filename ?? tAttachments('detail.title', '附件詳情')}
                        </SheetTitle>
                        <SheetDescription>
                            {tAttachments('detail.description', '檢視檔案中繼資料、關聯資源與存取資訊。')}
                        </SheetDescription>
                    </SheetHeader>

                    {detailAttachment ? (
                        <div className="mt-4 space-y-4 text-sm text-neutral-600">
                            {getAttachmentPreview(detailAttachment) ? (
                                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                                    <img
                                        src={getAttachmentPreview(detailAttachment)}
                                        alt={detailAttachment.title ?? detailAttachment.filename ?? ''}
                                        className="w-full object-cover"
                                    />
                                </div>
                            ) : null}

                            <div className="grid gap-2 rounded-lg border border-neutral-200/80 bg-neutral-50/80 p-3">
                                <div className="flex items-center gap-2 text-neutral-500">
                                    <Paperclip className="h-4 w-4" />
                                    <span>{detailAttachment.filename}</span>
                                </div>
                                <div>{tAttachments('detail.type', '檔案類型：:type', { type: detailAttachment.type })}</div>
                                <div>
                                    {tAttachments('detail.size', '檔案大小：:size', {
                                        size: detailAttachment.size ? formatBytes(detailAttachment.size) : '—',
                                    })}
                                </div>
                                <div>
                                    {tAttachments('detail.visibility', '可見性：:visibility', {
                                        visibility: tAttachments(`visibility.${detailAttachment.visibility}`, detailAttachment.visibility),
                                    })}
                                </div>
                                <div>
                                    {tAttachments('detail.uploaded_at', '上傳時間：:time', {
                                        time: formatDateTime(detailAttachment.created_at ?? detailAttachment.uploaded_at, locale) || '—',
                                    })}
                                </div>
                            </div>

                            {detailAttachment.attachable ? (
                                <div className="space-y-2 rounded-lg border border-neutral-200/80 bg-white/95 p-3">
                                    <h3 className="text-sm font-semibold text-neutral-800">
                                        {tAttachments('detail.attachable_title', '關聯資源')}
                                    </h3>
                                    <p className="text-sm text-neutral-600">{detailAttachment.attachable.title ?? detailAttachment.attachable.type}</p>
                                    {detailAttachment.attachable.space ? (
                                        <p className="text-xs text-neutral-500">
                                            {tAttachments('table.space', '歸屬空間：:name', { name: detailAttachment.attachable.space.name })}
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}

                            <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                                {detailAttachment.tags?.map((tag) => (
                                    <span key={tag} className="rounded-full bg-neutral-100 px-2 py-0.5">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex flex-col gap-2 text-xs text-neutral-500">
                                {detailAttachment.download_url ? (
                                    <Button type="button" variant="outline" className="w-full justify-center gap-2" asChild>
                                        <Link href={detailAttachment.download_url} target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4" />
                                            {tAttachments('detail.download', '下載原始檔案')}
                                        </Link>
                                    </Button>
                                ) : null}
                                {detailAttachment.external_url ? (
                                    <Button type="button" variant="outline" className="w-full justify-center gap-2" asChild>
                                        <Link href={detailAttachment.external_url} target="_blank" rel="noopener noreferrer">
                                            <Eye className="h-4 w-4" />
                                            {tAttachments('detail.view_external', '檢視外部連結')}
                                        </Link>
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    ) : null}
                </SheetContent>
            </Sheet>

            <AttachmentUploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
        </>
    );
}

ManageAdminAttachmentsIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;

