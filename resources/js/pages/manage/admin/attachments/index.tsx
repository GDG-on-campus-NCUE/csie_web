import { FormEvent, useEffect, useMemo, useState } from 'react';
import { type ComponentType } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { useTranslator } from '@/hooks/use-translator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    ArrowDownToLine,
    FileText,
    Image as ImageIcon,
    LinkIcon,
    RotateCcw,
    Trash2,
} from 'lucide-react';

interface AttachmentRecord {
    id: number;
    type: 'image' | 'document' | 'link';
    title: string | null;
    filename: string | null;
    disk_path: string | null;
    external_url: string | null;
    mime_type: string | null;
    size: number | null;
    visibility: 'public' | 'authorized' | 'private';
    attached_to_type: string | null;
    attached_to_id: number | null;
    download_url: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    attachable?: {
        type: string | null;
        id: number | null;
        label: string | null;
    } | null;
    uploader?: {
        id: number;
        name: string;
        email: string;
    } | null;
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

interface Option {
    value: string;
    label: string;
}

interface AttachmentsIndexProps {
    attachments: {
        data: AttachmentRecord[];
        meta?: PaginationMeta;
        links?: PaginationLink[];
        current_page?: number;
        last_page?: number;
        per_page?: number;
        total?: number;
    };
    filters?: Partial<Record<'q' | 'type' | 'visibility' | 'attached_to_type' | 'attached_to_id' | 'uploaded_by' | 'created_from' | 'created_to' | 'trashed' | 'per_page', string | number>>;
    typeOptions?: string[];
    visibilityOptions?: string[];
    attachableTypeOptions?: string[];
    perPageOptions?: number[];
}

type FilterState = {
    q: string;
    type: string;
    visibility: string;
    attached_to_type: string;
    attached_to_id: string;
    uploaded_by: string;
    created_from: string;
    created_to: string;
    trashed: string;
    per_page: string;
};

const DEFAULT_META: PaginationMeta = {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
};

const TYPE_META: Record<AttachmentRecord['type'], { key: string; fallback: { zh: string; en: string }; icon: ComponentType<{ className?: string }> }> = {
    image: { key: 'attachments.type.image', fallback: { zh: '圖片', en: 'Image' }, icon: ImageIcon },
    document: { key: 'attachments.type.document', fallback: { zh: '文件', en: 'Document' }, icon: FileText },
    link: { key: 'attachments.type.link', fallback: { zh: '連結', en: 'Link' }, icon: LinkIcon },
};

const VISIBILITY_LABEL: Record<AttachmentRecord['visibility'], { zh: string; en: string; tone: 'default' | 'warning' | 'danger' }> = {
    public: { zh: '公開', en: 'Public', tone: 'default' },
    authorized: { zh: '需登入', en: 'Authorized', tone: 'warning' },
    private: { zh: '限定', en: 'Private', tone: 'danger' },
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
    visibilityOptions = ['public', 'authorized', 'private'],
    attachableTypeOptions = [],
    perPageOptions = [],
}: AttachmentsIndexProps) {
    const { t, isZh, localeKey } = useTranslator('manage');
    const { delete: destroy, patch } = useForm({});

    const attachmentsIndexUrl = '/manage/admin/attachments';

    const paginationMeta: PaginationMeta = {
        current_page: attachments.meta?.current_page ?? attachments.current_page ?? DEFAULT_META.current_page,
        last_page: attachments.meta?.last_page ?? attachments.last_page ?? DEFAULT_META.last_page,
        per_page: attachments.meta?.per_page ?? attachments.per_page ?? DEFAULT_META.per_page,
        total: attachments.meta?.total ?? attachments.total ?? DEFAULT_META.total,
    };
    const paginationLinks = attachments.links ?? [];
    const resolvedPerPageOptions = perPageOptions.length > 0 ? perPageOptions : [10, 20, 50];

    const [filterState, setFilterState] = useState<FilterState>({
        q: (filters.q as string) ?? '',
        type: (filters.type as string) ?? '',
        visibility: (filters.visibility as string) ?? '',
        attached_to_type: (filters.attached_to_type as string) ?? '',
        attached_to_id: filters.attached_to_id ? String(filters.attached_to_id) : '',
        uploaded_by: filters.uploaded_by ? String(filters.uploaded_by) : '',
        created_from: (filters.created_from as string) ?? '',
        created_to: (filters.created_to as string) ?? '',
        trashed: (filters.trashed as string) ?? '',
        per_page: String(filters.per_page ?? paginationMeta.per_page ?? DEFAULT_META.per_page),
    });

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        setFilterState({
            q: (filters.q as string) ?? '',
            type: (filters.type as string) ?? '',
            visibility: (filters.visibility as string) ?? '',
            attached_to_type: (filters.attached_to_type as string) ?? '',
            attached_to_id: filters.attached_to_id ? String(filters.attached_to_id) : '',
            uploaded_by: filters.uploaded_by ? String(filters.uploaded_by) : '',
            created_from: (filters.created_from as string) ?? '',
            created_to: (filters.created_to as string) ?? '',
            trashed: (filters.trashed as string) ?? '',
            per_page: String(filters.per_page ?? paginationMeta.per_page ?? DEFAULT_META.per_page),
        });
    }, [
        filters.q,
        filters.type,
        filters.visibility,
        filters.attached_to_type,
        filters.attached_to_id,
        filters.uploaded_by,
        filters.created_from,
        filters.created_to,
        filters.trashed,
        filters.per_page,
        paginationMeta.per_page,
    ]);

    useEffect(() => {
        setSelectedIds([]);
    }, [attachments.data?.map((item) => item.id).join(',')]);

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilterState((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const buildFilterQuery = (overrides: Partial<FilterState> = {}) => {
        const query: Record<string, string> = {};

        for (const [key, value] of Object.entries({ ...filterState, ...overrides })) {
            if (value !== '') {
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
        const defaults: FilterState = {
            q: '',
            type: '',
            visibility: '',
            attached_to_type: '',
            attached_to_id: '',
            uploaded_by: '',
            created_from: '',
            created_to: '',
            trashed: '',
            per_page: String(paginationMeta.per_page ?? DEFAULT_META.per_page),
        };
        setFilterState(defaults);
        router.get(attachmentsIndexUrl, { per_page: defaults.per_page }, {
            preserveScroll: true,
            replace: true,
        });
    };

    const hasActiveFilters = useMemo(() => {
        const { q, type, visibility, attached_to_type, attached_to_id, uploaded_by, created_from, created_to, trashed } = filterState;
        return [q, type, visibility, attached_to_type, attached_to_id, uploaded_by, created_from, created_to, trashed].some((value) => value !== '');
    }, [filterState]);

    const attachmentsData = attachments.data ?? [];

    const toggleSelection = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === attachmentsData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(attachmentsData.map((item) => item.id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) {
            return;
        }

        if (
            confirm(
                t(
                    'attachments.index.dialogs.bulk_delete_confirm',
                    isZh ? `確定要刪除選取的 ${selectedIds.length} 筆附件？` : `Delete ${selectedIds.length} selected attachments?`,
                    { count: selectedIds.length },
                ),
            )
        ) {
            destroy(`${attachmentsIndexUrl}/bulk`, {
                data: { ids: selectedIds },
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const handleSoftDelete = (attachment: AttachmentRecord) => {
        const name = attachment.title ?? attachment.filename ?? `#${attachment.id}`;

        if (
            confirm(
                t(
                    'attachments.index.dialogs.delete_confirm',
                    isZh ? `確定要移除附件「${name}」嗎？` : `Delete attachment "${name}"?`,
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

    const formatTypeLabel = (type: AttachmentRecord['type']) => {
        const meta = TYPE_META[type];
        return t(meta.key, isZh ? meta.fallback.zh : meta.fallback.en);
    };

    const formatAttachableLabel = (attachment: AttachmentRecord) => {
        if (!attachment.attachable) {
            return t('attachments.index.status.unassigned', isZh ? '未關聯' : 'Unassigned');
        }

        if (attachment.attachable.label) {
            return attachment.attachable.label;
        }

        if (attachment.attachable.type) {
            const baseType = attachment.attachable.type;
            return `${baseType}${attachment.attachable.id ? ` #${attachment.attachable.id}` : ''}`;
        }

        return t('attachments.index.status.generic_without_identifier', isZh ? '未知來源' : 'Unknown source');
    };

    const formatVisibility = (visibility: AttachmentRecord['visibility']) => {
        const meta = VISIBILITY_LABEL[visibility];
        return isZh ? meta.zh : meta.en;
    };

    const visibilityBadgeClass = (visibility: AttachmentRecord['visibility']) => {
        const tone = VISIBILITY_LABEL[visibility].tone;
        if (tone === 'danger') return 'bg-rose-100 text-rose-600';
        if (tone === 'warning') return 'bg-amber-100 text-amber-700';
        return 'bg-slate-100 text-slate-600';
    };

    const formatDateTime = (value: string) => new Date(value).toLocaleString(localeKey === 'zh-TW' ? 'zh-TW' : 'en-US');

    const breadcrumbs = [
        { title: t('layout.breadcrumbs.dashboard', isZh ? '管理首頁' : 'Management'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.attachments', isZh ? '附件管理' : 'Attachments'), href: attachmentsIndexUrl },
    ];

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
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
                        <Button asChild variant="outline" className="rounded-full border-[#151f54]/30">
                            <Link href="/manage/posts">
                                {t('attachments.index.back_to_posts', isZh ? '回公告列表' : 'Back to posts')}
                            </Link>
                        </Button>
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
                            className="grid grid-cols-1 gap-4 xl:grid-cols-6"
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
                                    value={filterState.q}
                                    onChange={(event) => handleFilterChange('q', event.target.value)}
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
                                            {formatVisibility(option as AttachmentRecord['visibility'])}
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
                                    {attachableTypeOptions.map((option) => (
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
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="attachment-uploader">
                                    {t('attachments.index.filters.uploaded_by', isZh ? '上傳者 ID' : 'Uploader ID')}
                                </label>
                                <Input
                                    id="attachment-uploader"
                                    type="number"
                                    min={0}
                                    placeholder={t('attachments.index.filters.uploaded_by_placeholder', isZh ? '輸入使用者 ID' : 'Enter user ID')}
                                    value={filterState.uploaded_by}
                                    onChange={(event) => handleFilterChange('uploaded_by', event.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="attachment-created-from">
                                    {t('attachments.index.filters.created_from', isZh ? '起始日期' : 'Created from')}
                                </label>
                                <Input
                                    id="attachment-created-from"
                                    type="date"
                                    value={filterState.created_from}
                                    onChange={(event) => handleFilterChange('created_from', event.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="attachment-created-to">
                                    {t('attachments.index.filters.created_to', isZh ? '結束日期' : 'Created to')}
                                </label>
                                <Input
                                    id="attachment-created-to"
                                    type="date"
                                    value={filterState.created_to}
                                    onChange={(event) => handleFilterChange('created_to', event.target.value)}
                                />
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
                                    <option value="only">{t('attachments.index.filters.deleted_only', isZh ? '僅已刪除' : 'Deleted only')}</option>
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
                                    isZh ? `共 ${paginationMeta.total} 筆資料` : `${paginationMeta.total} records in total`,
                                    { total: paginationMeta.total },
                                )}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={selectedIds.length === 0}
                            onClick={handleBulkDelete}
                        >
                            {t('attachments.index.actions.bulk_delete', isZh ? `刪除選取 (${selectedIds.length})` : `Delete selected (${selectedIds.length})`)}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="overflow-hidden rounded-2xl border border-neutral-200/70">
                            <table className="min-w-full divide-y divide-neutral-200 bg-white text-sm">
                                <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                                    <tr>
                                        <th className="px-4 py-3">
                                            <Checkbox
                                                checked={selectedIds.length > 0 && selectedIds.length === attachmentsData.length}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="px-6 py-3 font-medium">
                                            {t('attachments.index.table.columns.attachment', isZh ? '附件資訊' : 'Attachment')}
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            {t('attachments.index.table.columns.source', isZh ? '來源' : 'Source')}
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            {t('attachments.index.table.columns.visibility', isZh ? '可見範圍' : 'Visibility')}
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            {t('attachments.index.table.columns.uploader', isZh ? '上傳者' : 'Uploader')}
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
                                <tbody className="divide-y divide-neutral-100 text-sm text-neutral-700">
                                    {attachmentsData.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-neutral-500">
                                                {t('attachments.index.table.empty', isZh ? '目前沒有符合條件的附件。' : 'No attachments match the current filters.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        attachmentsData.map((attachment) => {
                                            const isDeleted = Boolean(attachment.deleted_at);
                                            const TypeIcon = TYPE_META[attachment.type].icon;
                                            const visibilityClass = visibilityBadgeClass(attachment.visibility);

                                            return (
                                                <tr key={attachment.id} className={cn(isDeleted && 'bg-rose-50/40 text-neutral-500')}>
                                                    <td className="px-4 py-4 align-top">
                                                        <Checkbox
                                                            checked={selectedIds.includes(attachment.id)}
                                                            onCheckedChange={() => toggleSelection(attachment.id)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#151f54]/10 text-[#151f54]">
                                                                    <TypeIcon className="h-4 w-4" />
                                                                </span>
                                                                <div className="min-w-0">
                                                                    <p className="truncate font-semibold text-neutral-900">
                                                                        {attachment.title ?? attachment.filename ?? `#${attachment.id}`}
                                                                    </p>
                                                                    <p className="truncate text-xs text-neutral-500">
                                                                        {attachment.mime_type ?? attachment.external_url ?? '—'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {isDeleted && (
                                                                <span className="inline-flex items-center self-start rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-600">
                                                                    {t('attachments.index.badges.deleted', isZh ? '已刪除' : 'Deleted')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 align-top text-neutral-600">
                                                        {formatAttachableLabel(attachment)}
                                                    </td>
                                                    <td className="px-4 py-4 align-top">
                                                        <Badge className={visibilityClass}>{formatVisibility(attachment.visibility)}</Badge>
                                                    </td>
                                                    <td className="px-4 py-4 align-top">
                                                        {attachment.uploader ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-neutral-800">{attachment.uploader.name}</span>
                                                                <span className="text-xs text-neutral-500">ID #{attachment.uploader.id}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-neutral-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 align-top text-neutral-600">{formatBytes(attachment.size)}</td>
                                                    <td className="px-4 py-4 align-top text-neutral-600">{formatDateTime(attachment.updated_at)}</td>
                                                    <td className="px-4 py-4 align-top">
                                                        <div className="flex justify-end gap-2">
                                                            {attachment.download_url && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <a
                                                                            href={attachment.download_url}
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
                                                            {isDeleted ? (
                                                                <>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRestore(attachment)}
                                                                                className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white p-2 text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-50"
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
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {paginationLinks.length > 0 && (
                            <div className="flex items-center justify-between pt-2 text-sm text-neutral-500">
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
                                <div className="flex items-center gap-2">
                                    {paginationLinks.map((link, index) => {
                                        const rawLabel = sanitizeLabel(link.label);
                                        const label = rawLabel;

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

