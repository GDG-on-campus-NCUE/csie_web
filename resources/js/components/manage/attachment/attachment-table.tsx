import {
    Badge,
} from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, ExternalLink, RotateCcw, Trash2, XCircle, FileText, Paperclip, User2, HardDrive, CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react';
import type {
    AttachmentItem,
    PaginationLink,
    PaginationMeta,
    TranslatorFunction,
} from './attachment-types';

interface AttachmentTableProps {
    attachments: AttachmentItem[];
    selectedIds: number[];
    onToggleSelectAll: (checked: boolean) => void;
    onToggleSelection: (attachmentId: number) => void;
    onDelete: (attachment: AttachmentItem) => void;
    onRestore: (attachment: AttachmentItem) => void;
    onForceDelete: (attachment: AttachmentItem) => void;
    onBulkAction: (action: 'delete' | 'force') => void;
    bulkProcessing: boolean;
    pagination: PaginationMeta;
    paginationLinks: PaginationLink[];
    changePage: (page: number) => void;
    iconActionClass: string;
    t: TranslatorFunction;
    fallbackLanguage: 'zh' | 'en';
    localeForDate: 'zh-TW' | 'en';
}

const typeLabels: Record<string, { zh: string; en: string }> = {
    image: { zh: '圖片', en: 'Image' },
    document: { zh: '文件', en: 'Document' },
    link: { zh: '連結', en: 'Link' },
};

const visibilityLabels: Record<string, { zh: string; en: string }> = {
    public: { zh: '公開', en: 'Public' },
    private: { zh: '私人', en: 'Private' },
};

// 將檔案大小轉換為易讀格式，提升列表可讀性。
const formatBytes = (bytes: number | null): string => {
    if (!bytes || bytes <= 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }

    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

// 格式化時間字串，容錯處理異常值。
const formatDateTime = (value: string | null, locale: 'zh-TW' | 'en'): string | null => {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const localeCode = locale === 'zh-TW' ? 'zh-TW' : 'en-US';
    return date.toLocaleString(localeCode, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

const fallbackText = (language: 'zh' | 'en', zh: string, en: string) => (language === 'zh' ? zh : en);

// 將完整類別名稱轉為精簡標籤，例如 App\\Models\\Post -> Post。
const resolveAttachedTypeLabel = (type: string | null | undefined) => {
    if (!type) {
        return null;
    }
    return type.split('\\').pop() ?? type;
};

const buildSourceLabel = (
    attachment: AttachmentItem,
    t: TranslatorFunction,
    fallbackLanguage: 'zh' | 'en',
): string => {
    const typeLabel = resolveAttachedTypeLabel(attachment.attached_to_type);

    if (!typeLabel) {
        return t(
            'attachments.index.status.unassigned',
            fallbackText(fallbackLanguage, '未關聯', 'Unassigned'),
        );
    }

    if (attachment.attached_to_id !== null) {
        return t(
            'attachments.index.status.generic_with_identifier',
            fallbackText(fallbackLanguage, `${typeLabel} · ${attachment.attached_to_id}`, `${typeLabel} · ${attachment.attached_to_id}`),
            {
                type: typeLabel,
                identifier: attachment.attached_to_id,
            },
        );
    }

    return t(
        'attachments.index.status.generic_without_identifier',
        fallbackText(fallbackLanguage, `${typeLabel} #:id`, `${typeLabel} #:id`),
        {
            type: typeLabel,
            id: attachment.id,
        },
    );
};

const buildAttachmentTitle = (
    attachment: AttachmentItem,
    t: TranslatorFunction,
    fallbackLanguage: 'zh' | 'en',
): string => {
    if (attachment.title && attachment.title.trim() !== '') {
        return attachment.title;
    }

    if (attachment.filename && attachment.filename.trim() !== '') {
        return attachment.filename;
    }

    return t(
        'attachments.index.table.meta.type',
        fallbackText(fallbackLanguage, '附件', 'Attachment'),
    );
};

export function AttachmentTable({
    attachments,
    selectedIds,
    onToggleSelectAll,
    onToggleSelection,
    onDelete,
    onRestore,
    onForceDelete,
    onBulkAction,
    bulkProcessing,
    pagination,
    paginationLinks,
    changePage,
    iconActionClass,
    t,
    fallbackLanguage,
    localeForDate,
}: AttachmentTableProps) {
    const selectedCount = selectedIds.length;
    const allSelected = attachments.length > 0 && selectedCount === attachments.length;
    const fallback = (zh: string, en: string) => fallbackText(fallbackLanguage, zh, en);

    return (
        <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-col gap-4 border-b border-slate-100 pb-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                        {t('attachments.index.table.title', fallback('附件列表', 'Attachments'))}
                    </CardTitle>
                    <p className="text-sm text-slate-600">
                        {t('attachments.index.table.records_total', fallback('共 :total 筆資料', 'Total :total records'), {
                            total: pagination.total,
                        })}
                    </p>
                </div>

                {attachments.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={selectedCount === 0 || bulkProcessing}
                            onClick={() => onBulkAction('delete')}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('attachments.index.actions.delete', fallback('刪除附件', 'Move to recycle bin'))}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={selectedCount === 0 || bulkProcessing}
                            onClick={() => onBulkAction('force')}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            {t('attachments.index.actions.force_delete', fallback('永久刪除', 'Permanently delete'))}
                        </Button>
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="hidden xl:block">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-3">
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={(value) => onToggleSelectAll(Boolean(value))}
                                        aria-label={t('attachments.index.table.select_all', fallback('選取全部', 'Select all'))}
                                    />
                                </th>
                                <th className="px-4 py-3 w-[28%]">
                                    {t('attachments.index.table.columns.attachment', fallback('附件資訊', 'Attachment'))}
                                </th>
                                <th className="px-4 py-3">
                                    {t('attachments.index.table.columns.source', fallback('來源', 'Source'))}
                                </th>
                                <th className="px-4 py-3">
                                    {t('attachments.index.table.columns.size', fallback('大小', 'Size'))}
                                </th>
                                <th className="px-4 py-3">
                                    {t('attachments.index.table.columns.updated_at', fallback('更新時間', 'Updated at'))}
                                </th>
                                <th className="px-4 py-3 text-right">
                                    {t('attachments.index.table.columns.actions', fallback('操作', 'Actions'))}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                            {attachments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                                        {t('attachments.index.table.empty', fallback('目前尚無符合條件的附件。', 'No attachments match the filters.'))}
                                    </td>
                                </tr>
                            ) : (
                                attachments.map((attachment) => {
                                    const isSelected = selectedIds.includes(attachment.id);
                                    const typeLabel = typeLabels[attachment.type]?.[fallbackLanguage] ?? attachment.type;
                                    const visibilityLabel = attachment.visibility
                                        ? visibilityLabels[attachment.visibility]?.[fallbackLanguage] ?? attachment.visibility
                                        : fallback('未設定', 'Not set');
                                    const sourceLabel = buildSourceLabel(attachment, t, fallbackLanguage);
                                    const updatedLabel = formatDateTime(attachment.updated_at ?? attachment.created_at, localeForDate);
                                    const isTrashed = Boolean(attachment.deleted_at);
                                    const title = buildAttachmentTitle(attachment, t, fallbackLanguage);
                                    const downloadUrl = attachment.download_url ?? attachment.file_url;
                                    const externalUrl = attachment.external_url;

                                    return (
                                        <tr key={attachment.id} className={isSelected ? 'bg-slate-50/60' : undefined}>
                                            <td className="px-4 py-3">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => onToggleSelection(attachment.id)}
                                                    aria-label={t('attachments.index.table.select_row', fallback('選取附件', 'Select attachment'))}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Paperclip className="h-4 w-4 text-slate-400" />
                                                        <span className="font-semibold text-slate-900 break-words">{title}</span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                        <Badge variant="outline" className="border-slate-200 text-slate-600">
                                                            {typeLabel}
                                                        </Badge>
                                                        {attachment.mime_type && (
                                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                                                {attachment.mime_type}
                                                            </span>
                                                        )}
                                                        {attachment.visibility && (
                                                            <Badge variant="secondary">{visibilityLabel}</Badge>
                                                        )}
                                                        {isTrashed && (
                                                            <Badge variant="destructive" className="bg-rose-50 text-rose-600">
                                                                {t('attachments.index.badges.trashed', fallback('已刪除', 'Trashed'))}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {attachment.filename && (
                                                        <p className="text-xs text-slate-500 break-all">
                                                            {attachment.filename}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1 text-sm text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4" />
                                                        <span className="break-words">{sourceLabel}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <User2 className="h-3.5 w-3.5" />
                                                        <span>
                                                            {attachment.uploader?.name ?? t('attachments.index.table.uploader_unknown', fallback('未知上傳者', 'Unknown uploader'))}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <HardDrive className="h-4 w-4" />
                                                    <span>{formatBytes(attachment.size)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <CalendarClock className="h-4 w-4" />
                                                    <span>{
                                                        updatedLabel ?? t('attachments.index.table.not_available', fallback('無資料', 'N/A'))
                                                    }</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    {externalUrl && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <a
                                                                    href={externalUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={iconActionClass}
                                                                    aria-label={t('attachments.index.actions.visit_external', fallback('開啟外部連結', 'Open external link'))}
                                                                >
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {t('attachments.index.actions.visit_external', fallback('開啟外部連結', 'Open external link'))}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    {downloadUrl && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <a
                                                                    href={downloadUrl}
                                                                    className={iconActionClass}
                                                                    aria-label={t('attachments.index.actions.download', fallback('下載附件', 'Download attachment'))}
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {t('attachments.index.actions.download', fallback('下載附件', 'Download attachment'))}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className={iconActionClass}
                                                                onClick={() => onRestore(attachment)}
                                                                disabled={!isTrashed}
                                                                aria-label={t('attachments.index.actions.restore', fallback('還原附件', 'Restore attachment'))}
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {t('attachments.index.actions.restore', fallback('還原附件', 'Restore attachment'))}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className={iconActionClass}
                                                                onClick={() => onDelete(attachment)}
                                                                disabled={isTrashed}
                                                                aria-label={t('attachments.index.actions.delete', fallback('刪除附件', 'Move to recycle bin'))}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {t('attachments.index.actions.delete', fallback('刪除附件', 'Move to recycle bin'))}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className={iconActionClass}
                                                                onClick={() => onForceDelete(attachment)}
                                                                aria-label={t('attachments.index.actions.force_delete', fallback('永久刪除', 'Permanently delete'))}
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {t('attachments.index.actions.force_delete', fallback('永久刪除', 'Permanently delete'))}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="grid gap-3 xl:hidden">
                    {attachments.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                            {t('attachments.index.table.empty', fallback('目前尚無符合條件的附件。', 'No attachments match the filters.'))}
                        </div>
                    ) : (
                        attachments.map((attachment) => {
                            const isSelected = selectedIds.includes(attachment.id);
                            const typeLabel = typeLabels[attachment.type]?.[fallbackLanguage] ?? attachment.type;
                            const visibilityLabel = attachment.visibility
                                ? visibilityLabels[attachment.visibility]?.[fallbackLanguage] ?? attachment.visibility
                                : fallback('未設定', 'Not set');
                            const sourceLabel = buildSourceLabel(attachment, t, fallbackLanguage);
                            const updatedLabel = formatDateTime(attachment.updated_at ?? attachment.created_at, localeForDate);
                            const isTrashed = Boolean(attachment.deleted_at);
                            const title = buildAttachmentTitle(attachment, t, fallbackLanguage);
                            const downloadUrl = attachment.download_url ?? attachment.file_url;
                            const externalUrl = attachment.external_url;

                            return (
                                <div key={`mobile-attachment-${attachment.id}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2 text-slate-900">
                                                    <Paperclip className="h-4 w-4 text-slate-400" />
                                                    <span className="text-base font-semibold break-words">{title}</span>
                                                </div>
                                                {attachment.visibility && (
                                                    <Badge variant="secondary">{visibilityLabel}</Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                <Badge variant="outline" className="border-slate-200 text-slate-600">
                                                    {typeLabel}
                                                </Badge>
                                                {attachment.mime_type && (
                                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                                        {attachment.mime_type}
                                                    </span>
                                                )}
                                                {isTrashed && (
                                                    <Badge variant="destructive" className="bg-rose-50 text-rose-600">
                                                        {t('attachments.index.badges.trashed', fallback('已刪除', 'Trashed'))}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid gap-3 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                <span className="break-words">{sourceLabel}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <User2 className="h-3.5 w-3.5" />
                                                <span>
                                                    {attachment.uploader?.name ?? t('attachments.index.table.uploader_unknown', fallback('未知上傳者', 'Unknown uploader'))}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <HardDrive className="h-4 w-4" />
                                                <span>{formatBytes(attachment.size)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CalendarClock className="h-4 w-4" />
                                                <span>{updatedLabel ?? t('attachments.index.table.not_available', fallback('無資料', 'N/A'))}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => onToggleSelection(attachment.id)}
                                                    aria-label={t('attachments.index.table.select_row', fallback('選取附件', 'Select attachment'))}
                                                />
                                                <span className="text-xs text-slate-600">
                                                    {isSelected
                                                        ? t('attachments.index.mobile.selected', fallback('已選取', 'Selected'))
                                                        : t('attachments.index.mobile.select', fallback('選取', 'Select'))}
                                                </span>
                                            </div>
                                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                                                {externalUrl && (
                                                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                                                        <a
                                                            href={externalUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <ExternalLink className="mr-1 h-4 w-4" />
                                                            {t('attachments.index.actions.visit_external', fallback('開啟外部連結', 'Open external link'))}
                                                        </a>
                                                    </Button>
                                                )}
                                                {downloadUrl && (
                                                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                                                        <a href={downloadUrl}>
                                                            <Download className="mr-1 h-4 w-4" />
                                                            {t('attachments.index.actions.download', fallback('下載附件', 'Download attachment'))}
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full sm:w-auto"
                                                    onClick={() => onRestore(attachment)}
                                                    disabled={!isTrashed}
                                                >
                                                    <RotateCcw className="mr-1 h-4 w-4" />
                                                    {t('attachments.index.actions.restore', fallback('還原附件', 'Restore attachment'))}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full sm:w-auto"
                                                    onClick={() => onDelete(attachment)}
                                                    disabled={isTrashed}
                                                >
                                                    <Trash2 className="mr-1 h-4 w-4" />
                                                    {t('attachments.index.actions.delete', fallback('刪除附件', 'Move to recycle bin'))}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="w-full sm:w-auto"
                                                    onClick={() => onForceDelete(attachment)}
                                                >
                                                    <XCircle className="mr-1 h-4 w-4" />
                                                    {t('attachments.index.actions.force_delete', fallback('永久刪除', 'Permanently delete'))}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {paginationLinks.length > 0 && (
                    <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                        <p>
                            {t('attachments.index.pagination.summary', fallback('第 :current / :last 頁', 'Page :current of :last'), {
                                current: pagination.current_page,
                                last: pagination.last_page,
                            })}
                            ，
                            {t('attachments.index.table.records_total', fallback('共 :total 筆資料', 'Total :total records'), {
                                total: pagination.total,
                            })}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-9 w-9"
                                onClick={() => changePage(pagination.current_page - 1)}
                                disabled={pagination.current_page <= 1}
                                aria-label={t('attachments.index.pagination.previous', fallback('上一頁', 'Previous page'))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-9 w-9"
                                onClick={() => changePage(pagination.current_page + 1)}
                                disabled={pagination.current_page >= pagination.last_page}
                                aria-label={t('attachments.index.pagination.next', fallback('下一頁', 'Next page'))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
