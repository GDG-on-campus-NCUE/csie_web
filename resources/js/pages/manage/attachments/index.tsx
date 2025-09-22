import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    ArrowDownToLine,
    CheckSquare,
    FileText,
    Image as ImageIcon,
    LinkIcon,
    RotateCcw,
    Trash2,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AttachmentRecord {
    id: number;
    attached_to_type: string | null;
    attached_to_id: number | null;
    type: 'image' | 'document' | 'link';
    title: string | null;
    filename: string | null;
    disk: string | null;
    disk_path: string | null;
    file_url: string | null;
    external_url: string | null;
    mime_type: string | null;
    size: number | null;
    visibility: 'public' | 'private';
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    uploaded_by?: number | null;
    uploader?: { id: number; name: string; email: string } | null;
    download_url?: string | null;
    attachable?: Record<string, any> | null;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AttachmentsIndexProps {
    attachments: {
        data: AttachmentRecord[];
        meta?: PaginationMeta;
        current_page?: number;
        last_page?: number;
        per_page?: number;
        total?: number;
        links: PaginationLink[];
    };
    filters?: {
        search?: string;
        type?: string;
        attached_to_type?: string;
        attached_to_id?: string | number;
        visibility?: string;
        trashed?: string;
        sort?: string;
        per_page?: number | string;
    };
    typeOptions?: string[];
    attachedTypeOptions?: string[];
    visibilityOptions?: string[];
    perPageOptions?: number[];
    sortOptions?: Array<{ value: string; label: string }>;
}

type FilterState = {
    search: string;
    type: string;
    attached_to_type: string;
    attached_to_id: string;
    visibility: string;
    trashed: string;
    sort: string;
    per_page: string;
};

const DEFAULT_PAGINATION_META: PaginationMeta = {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
};

const TYPE_META: Record<AttachmentRecord['type'], { key: string; fallback: { zh: string; en: string }; icon: ComponentType<{ className?: string }> }> = {
    image: { key: 'attachments.type.image', fallback: { zh: '圖片', en: 'Image' }, icon: ImageIcon },
    document: { key: 'attachments.type.document', fallback: { zh: '文件', en: 'Document' }, icon: FileText },
    link: { key: 'attachments.type.link', fallback: { zh: '連結', en: 'Link' }, icon: LinkIcon },
};

const VISIBILITY_META: Record<'public' | 'private', { label: { zh: string; en: string }; variant: 'secondary' | 'outline' | 'default' }>
    = {
        public: { label: { zh: '公開', en: 'Public' }, variant: 'secondary' },
        private: { label: { zh: '私有', en: 'Private' }, variant: 'outline' },
    };

const formatBytes = (bytes: number | null) => {
    if (!bytes || bytes <= 0) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) {
        value /= 1024;
        index += 1;
    }
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
};

const sanitizeLabel = (label: string) =>
    label
        .replace(/<[^>]+>/g, '')
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&nbsp;/g, ' ');

export default function AttachmentsIndex({
    attachments,
    filters = {},
    typeOptions = ['image', 'document', 'link'],
    attachedTypeOptions = [],
    visibilityOptions = ['public', 'private'],
    perPageOptions = [],
    sortOptions = [],
}: AttachmentsIndexProps) {
    const { t, isZh, localeKey } = useTranslator('manage');
    const { delete: destroy, patch } = useForm();
    const bulkForm = useForm({ action: 'delete' as 'delete' | 'force', ids: [] as number[] });

    const attachmentsIndexUrl = '/manage/attachments';

    const attachmentsData = attachments?.data ?? [];
    const paginationMeta: PaginationMeta = {
        current_page: attachments?.meta?.current_page ?? attachments?.current_page ?? DEFAULT_PAGINATION_META.current_page,
        last_page: attachments?.meta?.last_page ?? attachments?.last_page ?? DEFAULT_PAGINATION_META.last_page,
        per_page: attachments?.meta?.per_page ?? attachments?.per_page ?? DEFAULT_PAGINATION_META.per_page,
        total: attachments?.meta?.total ?? attachments?.total ?? DEFAULT_PAGINATION_META.total,
    };
    const paginationLinks = attachments?.links ?? [];
    const resolvedPerPageOptions =
        perPageOptions.length > 0 ? perPageOptions : [15, 30, 50, 100, 200];
    const defaultSort = filters.sort ?? '-created_at';

    const [filterState, setFilterState] = useState<FilterState>({
        search: filters.search ?? '',
        type: filters.type ?? '',
        attached_to_type: filters.attached_to_type ?? '',
        attached_to_id: filters.attached_to_id ? String(filters.attached_to_id) : '',
        visibility: filters.visibility ?? '',
        trashed: filters.trashed ?? '',
        sort: filters.sort ?? defaultSort,
        per_page: String(filters.per_page ?? paginationMeta.per_page ?? DEFAULT_PAGINATION_META.per_page),
    });

    const [selected, setSelected] = useState<number[]>([]);

    useEffect(() => {
        setFilterState({
            search: filters.search ?? '',
            type: filters.type ?? '',
            attached_to_type: filters.attached_to_type ?? '',
            attached_to_id: filters.attached_to_id ? String(filters.attached_to_id) : '',
            visibility: filters.visibility ?? '',
            trashed: filters.trashed ?? '',
            sort: filters.sort ?? defaultSort,
            per_page: String(filters.per_page ?? paginationMeta.per_page ?? DEFAULT_PAGINATION_META.per_page),
        });
    }, [
        filters.search,
        filters.type,
        filters.attached_to_type,
        filters.attached_to_id,
        filters.visibility,
        filters.trashed,
        filters.sort,
        filters.per_page,
        paginationMeta.per_page,
        defaultSort,
    ]);

    useEffect(() => {
        const visibleIds = attachmentsData.map((attachment) => attachment.id);
        setSelected((previous) => previous.filter((id) => visibleIds.includes(id)));
    }, [attachmentsData]);

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilterState((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const buildFilterQuery = (overrides: Record<string, string | number> = {}) => {
        const query: Record<string, string | number> = {};

        for (const [key, value] of Object.entries(filterState)) {
            if (value !== '') {
                query[key] = value;
            }
        }

        for (const [key, value] of Object.entries(overrides)) {
            if (value !== '' && value !== undefined && value !== null) {
                query[key] = value;
            }
        }

        return query;
    };

    const applyFilters = (event?: FormEvent) => {
        event?.preventDefault();
        router.get(attachmentsIndexUrl, buildFilterQuery(), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const resetState: FilterState = {
            search: '',
            type: '',
            attached_to_type: '',
            attached_to_id: '',
            visibility: '',
            trashed: '',
            sort: defaultSort,
            per_page: String(paginationMeta.per_page ?? DEFAULT_PAGINATION_META.per_page),
        };
        setFilterState(resetState);
        router.get(
            attachmentsIndexUrl,
            { sort: defaultSort, per_page: resetState.per_page },
            {
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const hasActiveFilters = useMemo(() => {
        const { search, type, attached_to_type, attached_to_id, visibility, trashed } = filterState;
        return [search, type, attached_to_type, attached_to_id, visibility, trashed].some((value) => value !== '');
    }, [filterState]);

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelected(attachmentsData.map((attachment) => attachment.id));
        } else {
            setSelected([]);
        }
    };

    const toggleSelect = (attachmentId: number, checked: boolean) => {
        setSelected((previous) => {
            if (checked) {
                return Array.from(new Set([...previous, attachmentId]));
            }
            return previous.filter((id) => id !== attachmentId);
        });
    };

    const hasSelection = selected.length > 0;

    const handleSoftDelete = (attachment: AttachmentRecord) => {
        const name = attachment.title ?? attachment.filename ?? attachment.file_url ?? attachment.external_url ?? attachment.id;

        if (
            confirm(
                t(
                    'attachments.index.dialogs.delete_confirm',
                    isZh
                        ? `確定要移除附件「${name}」嗎？`
                        : `Delete attachment "${name}"?`,
                    { name },
                ),
            )
        ) {
            destroy(`${attachmentsIndexUrl}/${attachment.id}`, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const handleRestore = (attachment: AttachmentRecord) => {
        patch(`${attachmentsIndexUrl}/${attachment.id}/restore`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleForceDelete = (attachment: AttachmentRecord) => {
        if (
            confirm(
                t(
                    'attachments.index.dialogs.force_delete_confirm',
                    isZh ? '確定要永久刪除此附件？此動作無法復原。' : 'Permanently delete this attachment? This action cannot be undone.',
                ),
            )
        ) {
            destroy(`${attachmentsIndexUrl}/${attachment.id}/force`, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const handleBulk = (action: 'delete' | 'force') => {
        if (!hasSelection || bulkForm.processing) {
            return;
        }

        const message =
            action === 'delete'
                ? t(
                      'attachments.index.dialogs.bulk_delete_confirm',
                      isZh
                          ? `確定要移除選取的 ${selected.length} 個附件嗎？`
                          : `Delete ${selected.length} selected attachments?`,
                      { count: selected.length },
                  )
                : t(
                      'attachments.index.dialogs.bulk_force_confirm',
                      isZh
                          ? `確定要永久刪除選取的 ${selected.length} 個附件？`
                          : `Permanently delete ${selected.length} attachments?`,
                      { count: selected.length },
                  );

        if (!confirm(message)) {
            return;
        }

        bulkForm.setData({ action, ids: selected });
        bulkForm.post(`${attachmentsIndexUrl}/bulk`, {
            preserveScroll: true,
            onSuccess: () => setSelected([]),
        });
    };

    const formatTypeLabel = (type: AttachmentRecord['type']) => {
        const meta = TYPE_META[type];
        return t(meta.key, isZh ? meta.fallback.zh : meta.fallback.en);
    };

    const formatVisibility = (visibility: 'public' | 'private') => {
        const meta = VISIBILITY_META[visibility];
        return meta ? (isZh ? meta.label.zh : meta.label.en) : visibility;
    };

    const formatAttachableLabel = (attachment: AttachmentRecord) => {
        if (!attachment.attached_to_type) {
            return t('attachments.index.status.unassigned', isZh ? '未關聯' : 'Unassigned');
        }

        const baseType = attachment.attached_to_type.split('\\').pop() ?? attachment.attached_to_type;
        const identifier =
            attachment.attachable?.title ??
            attachment.attachable?.name ??
            attachment.attachable?.slug ??
            attachment.attached_to_id;

        if (attachment.attached_to_type.includes('Post')) {
            const title = attachment.attachable?.title ?? `#${attachment.attached_to_id ?? '?'}`;
            return t('attachments.index.status.post', `${isZh ? '公告' : 'Post'} · ${title}`, { title });
        }

        if (identifier) {
            return t(
                'attachments.index.status.generic_with_identifier',
                `${baseType} · ${identifier}`,
                {
                    type: baseType,
                    identifier,
                },
            );
        }

        return t(
            'attachments.index.status.generic_without_identifier',
            `${baseType} #${attachment.attached_to_id ?? '?'}`,
            {
                type: baseType,
                id: attachment.attached_to_id ?? '?',
            },
        );
    };

    const formatDateTime = (value: string) => new Date(value).toLocaleString(localeKey === 'zh-TW' ? 'zh-TW' : 'en-US');

    const resolvePaginationLabel = (label: string) => {
        if (/previous/i.test(label)) {
            const arrow = label.includes('«') ? '« ' : '';
            return `${arrow}${t('attachments.index.pagination.previous', isZh ? '上一頁' : 'Previous')}`;
        }

        if (/next/i.test(label)) {
            const arrow = label.includes('»') ? ' »' : '';
            return `${t('attachments.index.pagination.next', isZh ? '下一頁' : 'Next')}${arrow}`;
        }

        return label;
    };

    const breadcrumbs = [
        { title: t('layout.breadcrumbs.dashboard', isZh ? '管理首頁' : 'Management'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.attachments', isZh ? '附件管理' : 'Attachments'), href: attachmentsIndexUrl },
    ];

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title={t('attachments.index.title', isZh ? '附件管理' : 'Attachment management')} />

            <section className="space-y-6 px-4 py-8 sm:px-6 lg:px-0">
                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardContent className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-[#151f54]">
                                {t('attachments.index.title', isZh ? '附件管理' : 'Attachment management')}
                            </h1>
                            <p className="text-sm text-slate-600">
                                {t(
                                    'attachments.index.description',
                                    isZh
                                        ? '檢視與維護公告、頁面所使用的檔案與連結資源。'
                                        : 'Review and curate files and links referenced across the site.',
                                )}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Button
                                type="button"
                                variant="secondary"
                                className="w-full rounded-full border-[#151f54]/20 text-[#151f54] hover:bg-[#eef1ff] sm:w-auto"
                                disabled={!hasSelection || bulkForm.processing}
                                onClick={() => handleBulk('delete')}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('attachments.index.actions.bulk_delete', isZh ? '批次刪除' : 'Bulk delete')}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full rounded-full border-rose-200 text-rose-600 hover:bg-rose-50 sm:w-auto"
                                disabled={!hasSelection || bulkForm.processing}
                                onClick={() => handleBulk('force')}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('attachments.index.actions.bulk_force', isZh ? '批次永久刪除' : 'Bulk permanently delete')}
                            </Button>
                            <Button asChild variant="outline" className="w-full rounded-full border-[#151f54]/30 sm:w-auto">
                                <Link href="/manage/posts">
                                    {t('attachments.index.back_to_posts', isZh ? '回公告列表' : 'Back to posts')}
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold text-[#151f54]">
                            {t('attachments.index.filters_title', isZh ? '篩選條件' : 'Filters')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={applyFilters}
                            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6"
                        >
                            <div className="xl:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="attachment-search">
                                    {t('attachments.index.filters.search', isZh ? '搜尋附件' : 'Search attachments')}
                                </label>
                                <Input
                                    id="attachment-search"
                                    type="search"
                                    placeholder={t(
                                        'attachments.index.filters.search_placeholder',
                                        isZh ? '輸入標題、檔名或 MIME' : 'Title, file name, or mime type',
                                    )}
                                    value={filterState.search}
                                    onChange={(event) => handleFilterChange('search', event.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="attachment-type">
                                    {t('attachments.index.filters.type', isZh ? '附件類型' : 'Type')}
                                </label>
                                <Select
                                    id="attachment-type"
                                    value={filterState.type}
                                    onChange={(event) => handleFilterChange('type', event.target.value)}
                                >
                                    <option value="">{t('attachments.index.filters.all_types', isZh ? '全部類型' : 'All types')}</option>
                                    {typeOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {formatTypeLabel(option as AttachmentRecord['type'])}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="attachment-source-type">
                                    {t('attachments.index.filters.attachable', isZh ? '資料來源' : 'Attachable')}
                                </label>
                                <Select
                                    id="attachment-source-type"
                                    value={filterState.attached_to_type}
                                    onChange={(event) => handleFilterChange('attached_to_type', event.target.value)}
                                >
                                    <option value="">{t('attachments.index.filters.all_sources', isZh ? '全部來源' : 'All sources')}</option>
                                    {attachedTypeOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="attachment-source-id">
                                    {t('attachments.index.filters.source_id', isZh ? '來源 ID' : 'Source ID')}
                                </label>
                                <Input
                                    id="attachment-source-id"
                                    type="number"
                                    min={0}
                                    placeholder={t(
                                        'attachments.index.filters.source_id_placeholder',
                                        isZh ? '輸入來源資料 ID' : 'Enter source record ID',
                                    )}
                                    value={filterState.attached_to_id}
                                    onChange={(event) => handleFilterChange('attached_to_id', event.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="attachment-visibility">
                                    {t('attachments.index.filters.visibility', isZh ? '可見範圍' : 'Visibility')}
                                </label>
                                <Select
                                    id="attachment-visibility"
                                    value={filterState.visibility}
                                    onChange={(event) => handleFilterChange('visibility', event.target.value)}
                                >
                                    <option value="">{t('attachments.index.filters.visibility_all', isZh ? '全部' : 'All')}</option>
                                    {visibilityOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {formatVisibility(option as 'public' | 'private')}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="attachment-trashed">
                                    {t('attachments.index.filters.trashed', isZh ? '刪除範圍' : 'Trashed filter')}
                                </label>
                                <Select
                                    id="attachment-trashed"
                                    value={filterState.trashed}
                                    onChange={(event) => handleFilterChange('trashed', event.target.value)}
                                >
                                    <option value="">{t('attachments.index.filters.active_only', isZh ? '僅顯示現存' : 'Active only')}</option>
                                    <option value="with">{t('attachments.index.filters.include_deleted', isZh ? '含已刪除' : 'Include deleted')}</option>
                                    <option value="only">{t('attachments.index.filters.deleted_only', isZh ? '僅已刪除' : 'Only deleted')}</option>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="attachment-sort">
                                    {t('attachments.index.filters.sort', isZh ? '排序' : 'Sort')}
                                </label>
                                <Select
                                    id="attachment-sort"
                                    value={filterState.sort}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        handleFilterChange('sort', value);
                                        router.get(attachmentsIndexUrl, buildFilterQuery({ sort: value }), {
                                            preserveScroll: true,
                                            preserveState: true,
                                            replace: true,
                                        });
                                    }}
                                >
                                    {(sortOptions.length > 0 ? sortOptions : [
                                        { value: '-created_at', label: isZh ? '上傳時間（新到舊）' : 'Newest first' },
                                        { value: 'created_at', label: isZh ? '上傳時間（舊到新）' : 'Oldest first' },
                                    ]).map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="attachment-per-page">
                                    {t('attachments.index.filters.per_page', isZh ? '每頁數量' : 'Per page')}
                                </label>
                                <Select
                                    id="attachment-per-page"
                                    value={filterState.per_page}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        handleFilterChange('per_page', value);
                                        router.get(attachmentsIndexUrl, buildFilterQuery({ per_page: value }), {
                                            preserveScroll: true,
                                            preserveState: true,
                                            replace: true,
                                        });
                                    }}
                                >
                                    {resolvedPerPageOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="flex items-end gap-2 xl:col-span-6">
                                <Button type="submit" className="w-full bg-[#151f54] text-white hover:bg-[#1f2a6d] sm:w-auto">
                                    {t('attachments.index.filters.apply', isZh ? '套用' : 'Apply')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full sm:w-auto"
                                    disabled={!hasActiveFilters}
                                    onClick={resetFilters}
                                >
                                    {t('attachments.index.filters.reset', isZh ? '重設' : 'Reset')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardHeader className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold text-[#151f54]">
                                {t('attachments.index.table.title', isZh ? '附件列表' : 'Attachment list')}
                            </CardTitle>
                            <p className="text-sm text-slate-500">
                                {t(
                                    'attachments.index.table.records_total',
                                    isZh
                                        ? `共 ${paginationMeta.total} 筆資料`
                                        : `${paginationMeta.total} records in total`,
                                    { total: paginationMeta.total },
                                )}
                            </p>
                        </div>
                        {hasSelection && (
                            <div className="flex items-center gap-2 text-sm text-[#151f54]">
                                <CheckSquare className="h-4 w-4" />
                                {t(
                                    'attachments.index.table.selected_count',
                                    isZh ? `已選取 ${selected.length} 筆` : `${selected.length} selected`,
                                    { count: selected.length },
                                )}
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="overflow-hidden rounded-2xl border border-neutral-200/70">
                            <table className="min-w-full divide-y divide-neutral-200 bg-white text-sm">
                                <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                                    <tr>
                                        <th className="w-12 px-4 py-3">
                                            <Checkbox
                                                aria-label={t('attachments.index.table.columns.select_all', isZh ? '全選附件' : 'Select all')}
                                                checked={
                                                    selected.length === 0
                                                        ? false
                                                        : selected.length === attachmentsData.length
                                                        ? true
                                                        : 'indeterminate'
                                                }
                                                onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))}
                                            />
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            {t('attachments.index.table.columns.attachment', isZh ? '附件資訊' : 'Attachment')}
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            {t('attachments.index.table.columns.source', isZh ? '來源' : 'Source')}
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            {t('attachments.index.table.columns.size', isZh ? '大小' : 'Size')}
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            {t('attachments.index.table.columns.updated_at', isZh ? '更新時間' : 'Updated at')}
                                        </th>
                                        <th className="px-4 py-3 font-medium text-right">
                                            {t('attachments.index.table.columns.actions', isZh ? '操作' : 'Actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200">
                                    {attachmentsData.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-sm text-neutral-500">
                                                {t('attachments.index.table.empty', isZh ? '目前沒有符合條件的附件' : 'No attachments found for the current filters.')}
                                            </td>
                                        </tr>
                                    )}
                                    {attachmentsData.map((attachment) => {
                                        const Icon = TYPE_META[attachment.type]?.icon ?? FileText;
                                        const visibilityMeta = VISIBILITY_META[attachment.visibility];
                                        const displayName = attachment.title ?? attachment.filename ?? attachment.external_url ?? `#${attachment.id}`;

                                        return (
                                            <tr key={attachment.id} className={attachment.deleted_at ? 'bg-neutral-50/60 text-neutral-500' : ''}>
                                                <td className="px-4 py-4">
                                                    <Checkbox
                                                        aria-label={t('attachments.index.table.columns.select_row', isZh ? '選取附件' : 'Select attachment')}
                                                        checked={selected.includes(attachment.id)}
                                                        onCheckedChange={(checked) => toggleSelect(attachment.id, Boolean(checked))}
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-start gap-3">
                                                        <span className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f4ff] text-[#151f54]', attachment.deleted_at && 'opacity-70')}>
                                                            <Icon className="h-5 w-5" />
                                                        </span>
                                                        <div className="space-y-1">
                                                            <p className="font-medium text-neutral-800 line-clamp-2">{displayName}</p>
                                                            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                                                                <span>{attachment.mime_type ?? '-'}</span>
                                                                <span>·</span>
                                                                <Badge variant={visibilityMeta?.variant ?? 'secondary'} className="text-[11px]">
                                                                    {formatVisibility(attachment.visibility)}
                                                                </Badge>
                                                            </div>
                                                            {attachment.external_url && (
                                                                <a
                                                                    href={attachment.external_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex text-xs text-blue-600 hover:text-blue-700"
                                                                >
                                                                    {attachment.external_url}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-neutral-600">
                                                    <div className="space-y-1">
                                                        <div>{formatAttachableLabel(attachment)}</div>
                                                        {attachment.uploader && (
                                                            <div className="text-xs text-neutral-500">
                                                                {t('attachments.index.table.uploader', isZh ? `上傳者：${attachment.uploader.name}` : `Uploaded by ${attachment.uploader.name}`, {
                                                                    name: attachment.uploader.name,
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-neutral-600">{formatBytes(attachment.size)}</td>
                                                <td className="px-4 py-4 text-sm text-neutral-600">
                                                    <div className="space-y-1">
                                                        <div>{formatDateTime(attachment.updated_at)}</div>
                                                        {attachment.deleted_at && (
                                                            <div className="text-xs text-rose-500">
                                                                {t('attachments.index.table.deleted_at', isZh ? `已刪除：${formatDateTime(attachment.deleted_at)}` : `Deleted at ${formatDateTime(attachment.deleted_at)}`)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {attachment.type !== 'link' && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <a
                                                                        href={attachment.download_url ?? attachment.file_url ?? undefined}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center justify-center rounded-full border border-blue-100 bg-white p-2 text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
                                                                    >
                                                                        <ArrowDownToLine className="h-4 w-4" />
                                                                    </a>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {t('attachments.index.actions.download', isZh ? '下載附件' : 'Download attachment')}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                        {attachment.deleted_at ? (
                                                            <>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRestore(attachment)}
                                                                            className="inline-flex items-center justify-center rounded-full border border-blue-100 bg-white p-2 text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
                                                                        >
                                                                            <RotateCcw className="h-4 w-4" />
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {t('attachments.index.actions.restore', isZh ? '還原附件' : 'Restore attachment')}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleForceDelete(attachment)}
                                                                            className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white p-2 text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {t('attachments.index.actions.force_delete', isZh ? '永久刪除' : 'Permanently delete')}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </>
                                                        ) : (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSoftDelete(attachment)}
                                                                        className="inline-flex items-center justify-center rounded-full border border-rose-100 bg-white p-2 text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {t('attachments.index.actions.delete', isZh ? '刪除附件' : 'Delete attachment')}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {paginationLinks.length > 0 && (
                            <div className="flex flex-col gap-2 pt-2 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    {t(
                                        'attachments.index.pagination.summary',
                                        isZh
                                            ? `第 ${paginationMeta.current_page} / ${paginationMeta.last_page} 頁`
                                            : `Page ${paginationMeta.current_page} of ${paginationMeta.last_page}`,
                                        {
                                            current: paginationMeta.current_page,
                                            last: paginationMeta.last_page,
                                        },
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {paginationLinks.map((link, index) => {
                                        const rawLabel = sanitizeLabel(link.label);
                                        const label = resolvePaginationLabel(rawLabel);

                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={`${rawLabel}-${index}`}
                                                    className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-neutral-200 px-2 text-sm text-neutral-400"
                                                >
                                                    {label}
                                                </span>
                                            );
                                        }

                                        return (
                                            <button
                                                type="button"
                                                key={`${rawLabel}-${index}`}
                                                onClick={() => {
                                                    router.visit(link.url as string, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                        replace: true,
                                                    });
                                                }}
                                                className={cn(
                                                    'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm transition',
                                                    link.active
                                                        ? 'border-[#151f54]/20 bg-[#151f54] text-white'
                                                        : 'border-transparent bg-white text-neutral-600 hover:bg-[#f5f7ff]'
                                                )}
                                                aria-label={label}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>
        </ManageLayout>
    );
}
