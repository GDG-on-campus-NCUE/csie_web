import { Link } from '@inertiajs/react';
import type { ReactElement } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarClock, CheckCircle2, Eye, Loader2, Mail, MoreVertical, Trash2, Undo2, ShieldAlert } from 'lucide-react';
import type {
    ContactMessageItem,
    ContactPaginationLink,
    ContactPaginationMeta,
    ContactMessageStatus,
} from './contact-types';
import { contactStatusBadgeVariant, contactStatusLabels } from './contact-types';

interface ContactTableProps {
    messages: ContactMessageItem[];
    pagination: ContactPaginationMeta;
    paginationLinks: ContactPaginationLink[];
    changePage: (page: number) => void;
    iconActionClass: string;
    fallbackLanguage: 'zh' | 'en';
    localeForDate: 'zh-TW' | 'en';
    onUpdateStatus: (id: number, status: ContactMessageStatus) => void;
    onDelete: (id: number) => void;
    processingId: number | null;
    deletingId: number | null;
}

/**
 * 轉換日期字串為對應語系格式，若傳入值無效則回傳空字串
 */
const formatDateTime = (value: string | null, locale: 'zh-TW' | 'en'): string => {
    if (!value) {
        return '';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    return parsed.toLocaleString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

/**
 * 根據語系提供預設文案，避免英文環境仍顯示中文
 */
const fallbackText = (fallbackLanguage: 'zh' | 'en', zh: string, en: string) =>
    fallbackLanguage === 'zh' ? zh : en;

/**
 * 聯絡訊息列表元件，負責展示資料與操作入口
 */
export function ContactTable({
    messages,
    pagination,
    paginationLinks,
    changePage,
    iconActionClass,
    fallbackLanguage,
    localeForDate,
    onUpdateStatus,
    onDelete,
    processingId,
    deletingId,
}: ContactTableProps) {
    const hasData = messages.length > 0;

    const buildStatusActionLabel = (status: ContactMessageStatus): string => {
        const labels: Record<ContactMessageStatus, { zh: string; en: string }> = {
            new: { zh: '標記為未處理', en: 'Mark as new' },
            in_progress: { zh: '標記為處理中', en: 'Mark as in progress' },
            resolved: { zh: '標記為已完成', en: 'Mark as resolved' },
            spam: { zh: '標記為垃圾訊息', en: 'Mark as spam' },
        };

        const label = labels[status];
        return fallbackText(fallbackLanguage, label.zh, label.en);
    };

    const actionIconMap: Record<ContactMessageStatus, ReactElement> = {
        new: <Undo2 className="h-4 w-4" />, // 將狀態還原為未處理
        in_progress: <Loader2 className="h-4 w-4" />, // 設為處理中
        resolved: <CheckCircle2 className="h-4 w-4" />, // 設為已完成
        spam: <ShieldAlert className="h-4 w-4" />, // 標記為垃圾訊息
    };

    const availableStatusActions: ContactMessageStatus[] = ['new', 'in_progress', 'resolved', 'spam'];

    return (
        <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-col gap-2 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                        {fallbackText(fallbackLanguage, '聯絡訊息列表', 'Contact messages')}
                    </CardTitle>
                    <p className="text-sm text-slate-600">
                        {fallbackText(
                            fallbackLanguage,
                            `共 ${pagination.total} 筆資料`,
                            `Total ${pagination.total} records`,
                        )}
                    </p>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="hidden lg:block">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <TableHead className="w-64">{fallbackText(fallbackLanguage, '聯絡人', 'Contact')}</TableHead>
                                <TableHead>{fallbackText(fallbackLanguage, '主旨', 'Subject')}</TableHead>
                                <TableHead>{fallbackText(fallbackLanguage, '訊息', 'Message')}</TableHead>
                                <TableHead className="w-32">{fallbackText(fallbackLanguage, '狀態', 'Status')}</TableHead>
                                <TableHead className="w-40">{fallbackText(fallbackLanguage, '建立時間', 'Created at')}</TableHead>
                                <TableHead className="w-40">{fallbackText(fallbackLanguage, '處理資訊', 'Processing')}</TableHead>
                                <TableHead className="w-20 text-right">{fallbackText(fallbackLanguage, '操作', 'Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!hasData && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-500">
                                        {fallbackText(
                                            fallbackLanguage,
                                            '目前尚無符合條件的聯絡訊息。',
                                            'No contact messages match the filters yet.',
                                        )}
                                    </TableCell>
                                </TableRow>
                            )}
                            {hasData &&
                                messages.map((message) => {
                                    const statusLabel = contactStatusLabels[message.status];
                                    const badgeVariant = contactStatusBadgeVariant[message.status];
                                    const createdAtLabel = formatDateTime(message.created_at, localeForDate);
                                    const processedAtLabel = formatDateTime(message.processed_at, localeForDate);
                                    const isProcessing = processingId === message.id;
                                    const isDeleting = deletingId === message.id;

                                    return (
                                        <TableRow key={message.id} className="align-top">
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-semibold text-slate-900">{message.name}</span>
                                                    <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                                                        <Mail className="h-4 w-4" />
                                                        <a
                                                            href={`mailto:${message.email}`}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {message.email}
                                                        </a>
                                                    </span>
                                                    {message.locale && (
                                                        <span className="text-xs text-slate-500">{`Locale：${message.locale}`}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="block font-medium text-slate-800">
                                                    {message.subject || fallbackText(fallbackLanguage, '未填寫主旨', 'No subject')}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <p className="line-clamp-3 whitespace-pre-line text-sm text-slate-600">
                                                    {message.message}
                                                </p>
                                                {message.file_url && (
                                                    <a
                                                        href={message.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-2 inline-flex text-xs text-blue-600 hover:underline"
                                                    >
                                                        {fallbackText(fallbackLanguage, '下載附件', 'Download attachment')}
                                                    </a>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={badgeVariant}>{statusLabel[fallbackLanguage]}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm text-slate-600">
                                                    <span>{createdAtLabel || fallbackText(fallbackLanguage, '尚未提供', 'Not available')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 text-sm text-slate-600">
                                                    {message.processor ? (
                                                        <span className="font-medium text-slate-800">{message.processor.name}</span>
                                                    ) : (
                                                        <span>{fallbackText(fallbackLanguage, '尚未指定負責人', 'No processor yet')}</span>
                                                    )}
                                                    {processedAtLabel && (
                                                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                                            <CalendarClock className="h-4 w-4" />
                                                            {processedAtLabel}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className={iconActionClass}
                                                            disabled={isProcessing || isDeleting}
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuLabel>
                                                            {fallbackText(fallbackLanguage, '操作選單', 'Actions')}
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/manage/contact-messages/${message.id}`} className="flex items-center gap-2">
                                                                <Eye className="h-4 w-4" />
                                                                {fallbackText(fallbackLanguage, '檢視詳情', 'View details')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {availableStatusActions.map((status) => {
                                                            if (status === message.status) {
                                                                return null;
                                                            }

                                                            return (
                                                                <DropdownMenuItem
                                                                    key={`${message.id}-${status}`}
                                                                    onClick={() => onUpdateStatus(message.id, status)}
                                                                    disabled={isProcessing}
                                                                >
                                                                    {actionIconMap[status]}
                                                                    {buildStatusActionLabel(status)}
                                                                </DropdownMenuItem>
                                                            );
                                                        })}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => onDelete(message.id)}
                                                            disabled={isDeleting}
                                                            variant="destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            {fallbackText(fallbackLanguage, '刪除訊息', 'Delete message')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </div>

                <div className="grid gap-4 lg:hidden">
                    {!hasData && (
                        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                            {fallbackText(
                                fallbackLanguage,
                                '目前尚未收到聯絡訊息或條件過於嚴格。',
                                'No contact messages found for the current filters.',
                            )}
                        </div>
                    )}

                    {hasData &&
                        messages.map((message) => {
                            const statusLabel = contactStatusLabels[message.status];
                            const badgeVariant = contactStatusBadgeVariant[message.status];
                            const createdAtLabel = formatDateTime(message.created_at, localeForDate);
                            const processedAtLabel = formatDateTime(message.processed_at, localeForDate);
                            const isProcessing = processingId === message.id;
                            const isDeleting = deletingId === message.id;

                            return (
                                <div key={`mobile-${message.id}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-base font-semibold text-slate-900">{message.name}</p>
                                            <a
                                                href={`mailto:${message.email}`}
                                                className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                            >
                                                <Mail className="h-4 w-4" />
                                                {message.email}
                                            </a>
                                        </div>
                                        <Badge variant={badgeVariant}>{statusLabel[fallbackLanguage]}</Badge>
                                    </div>

                                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                                        <p className="font-medium text-slate-800">
                                            {message.subject || fallbackText(fallbackLanguage, '未填寫主旨', 'No subject')}
                                        </p>
                                        <p className="whitespace-pre-line">{message.message}</p>
                                        {message.file_url && (
                                            <a
                                                href={message.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex text-xs text-blue-600 hover:underline"
                                            >
                                                {fallbackText(fallbackLanguage, '下載附件', 'Download attachment')}
                                            </a>
                                        )}
                                    </div>

                                    <div className="mt-4 flex flex-col gap-1 text-xs text-slate-500">
                                        <span>
                                            {fallbackText(fallbackLanguage, '建立時間：', 'Created: ')}
                                            {createdAtLabel || fallbackText(fallbackLanguage, '尚未提供', 'Not available')}
                                        </span>
                                        <span>
                                            {fallbackText(fallbackLanguage, '處理資訊：', 'Processing: ')}
                                            {message.processor
                                                ? `${message.processor.name}${processedAtLabel ? ` · ${processedAtLabel}` : ''}`
                                                : fallbackText(fallbackLanguage, '尚未指定負責人', 'No processor yet')}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={`/manage/contact-messages/${message.id}`} className="flex items-center gap-2">
                                                <Eye className="h-4 w-4" />
                                                {fallbackText(fallbackLanguage, '檢視詳情', 'View details')}
                                            </Link>
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    disabled={isProcessing || isDeleting}
                                                    className="flex items-center gap-2"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                    {fallbackText(fallbackLanguage, '更多操作', 'More actions')}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-48">
                                                {availableStatusActions.map((status) => {
                                                    if (status === message.status) {
                                                        return null;
                                                    }

                                                    return (
                                                        <DropdownMenuItem
                                                            key={`mobile-${message.id}-${status}`}
                                                            onClick={() => onUpdateStatus(message.id, status)}
                                                            disabled={isProcessing}
                                                        >
                                                            {actionIconMap[status]}
                                                            {buildStatusActionLabel(status)}
                                                        </DropdownMenuItem>
                                                    );
                                                })}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(message.id)}
                                                    disabled={isDeleting}
                                                    variant="destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    {fallbackText(fallbackLanguage, '刪除訊息', 'Delete message')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })}
                </div>

                {hasData && (
                    <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
                        <p className="text-sm text-slate-600">
                            {fallbackText(
                                fallbackLanguage,
                                `顯示第 ${pagination.from ?? 0} - ${pagination.to ?? 0} 筆，共 ${pagination.total} 筆`,
                                `Showing ${pagination.from ?? 0} - ${pagination.to ?? 0} of ${pagination.total} records`,
                            )}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-9 w-9"
                                onClick={() => changePage(pagination.current_page - 1)}
                                disabled={pagination.current_page <= 1}
                                aria-label={fallbackText(fallbackLanguage, '上一頁', 'Previous page')}
                            >
                                ‹
                            </Button>
                            {paginationLinks.map((link, index) => {
                                if (!link.url) {
                                    return null;
                                }

                                const url = new URL(link.url);
                                const pageParam = url.searchParams.get('page');
                                const pageNumber = pageParam ? Number(pageParam) : 1;
                                const label = link.label.replace(/&laquo;|&raquo;|&nbsp;/g, '') || pageNumber.toString();

                                return (
                                    <Button
                                        type="button"
                                        key={`${link.label}-${index}`}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        className="min-w-9"
                                        onClick={() => changePage(pageNumber)}
                                    >
                                        {label}
                                    </Button>
                                );
                            })}
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-9 w-9"
                                onClick={() => changePage(pagination.current_page + 1)}
                                disabled={pagination.current_page >= pagination.last_page}
                                aria-label={fallbackText(fallbackLanguage, '下一頁', 'Next page')}
                            >
                                ›
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
