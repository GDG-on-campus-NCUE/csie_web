import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TableEmpty from '@/components/manage/table-empty';
import { useTranslator } from '@/hooks/use-translator';
import { formatBytes } from '@/lib/shared/utils';
import type {
    ManageAttachmentFilterOptions,
    ManageAttachmentFilterState,
    ManageAttachmentListItem,
    ManageAttachmentListResponse,
} from '@/types/manage';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { ArrowUpDown, CloudUpload, Download, Filter, LayoutGrid, List as ListIcon, RefreshCcw } from 'lucide-react';

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
    const keywordTimer = useRef<number | null>(null);

    useEffect(() => {
        setFilterForm(defaultFilterForm);
    }, [defaultFilterForm]);

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
                    <Button size="sm" className="gap-2">
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
                        <TableHead className="w-[36%] text-neutral-500">{tAttachments('table.title', '附件')}</TableHead>
                        <TableHead className="w-[18%] text-neutral-500">{tAttachments('table.type', '類型與可見性')}</TableHead>
                        <TableHead className="w-[24%] text-neutral-500">{tAttachments('table.attachable', '所屬資源')}</TableHead>
                        <TableHead className="w-[14%] text-neutral-500">{tAttachments('table.size', '檔案大小')}</TableHead>
                        <TableHead className="w-[8%] text-right text-neutral-500">{tAttachments('table.actions', '操作')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((attachment) => {
                        const downloadHref = attachment.download_url ?? attachment.external_url ?? attachment.file_url ?? '';

                        return (
                            <TableRow key={attachment.id} className="border-neutral-200/60">
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
            <ManagePage
                title={pageTitle}
                description={t('attachments.description', '管理公告使用的文件與媒體資源。')}
                breadcrumbs={breadcrumbs}
                toolbar={toolbar}
            >
                <section className="rounded-xl border border-neutral-200/80 bg-white/95 p-4 shadow-sm">
                    {filterForm.view === 'grid'
                        ? renderGridView(attachments.data)
                        : renderListView(attachments.data)}
                    <Pagination
                        meta={meta}
                        onPerPageChange={(value) => handlePerPageChange(String(value))}
                        className="mt-4"
                    />
                </section>
            </ManagePage>
        </>
    );
}

ManageAdminAttachmentsIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
