import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Calendar, Trash2, Eye, Pen, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationLink, PaginationMeta, PostItem, TranslatorFunction } from './post-types';
import { statusFallbackLabels, statusVariantMap } from './post-types';
import type { PostStatus } from './post-types';

// 獨立負責公告列表與操作區塊的呈現，維持主頁面邏輯的單純性。
interface PostTableProps {
    posts: PostItem[];
    selectedIds: number[];
    canBulk: boolean;
    onToggleSelectAll: (checked: boolean) => void;
    onToggleSelection: (postId: number) => void;
    onBulkAction: (action: 'publish' | 'unpublish' | 'delete') => void;
    bulkFormProcessing: boolean;
    pagination: PaginationMeta;
    paginationLinks: PaginationLink[];
    changePage: (page: number) => void;
    iconActionClass: string;
    t: TranslatorFunction;
    fallbackLanguage: 'zh' | 'en';
    localeForDate: 'zh-TW' | 'en';
}

const formatDateTime = (value: string | null, locale: 'zh-TW' | 'en') => {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toLocaleString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

const getStatusLabel = (status: PostStatus, t: TranslatorFunction, fallbackLanguage: 'zh' | 'en') =>
    t(`posts.status.${status}`, statusFallbackLabels[status][fallbackLanguage]);

export function PostTable({
    posts,
    selectedIds,
    canBulk,
    onToggleSelectAll,
    onToggleSelection,
    onBulkAction,
    bulkFormProcessing,
    pagination,
    paginationLinks,
    changePage,
    iconActionClass,
    t,
    fallbackLanguage,
    localeForDate,
}: PostTableProps) {
    const selectedCount = selectedIds.length;
    const allSelected = posts.length > 0 && selectedCount === posts.length;

    return (
        <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                        {t('posts.index.table.title', '公告列表')}
                    </CardTitle>
                    <p className="text-sm text-slate-600">
                        {t('posts.index.table.records_total', '共 :total 筆資料', {
                            total: pagination.total,
                        })}
                    </p>
                </div>
                {canBulk && (
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={selectedCount === 0 || bulkFormProcessing}
                            onClick={() => onBulkAction('publish')}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            {t('posts.index.actions.bulk_publish', '批次發布')}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={selectedCount === 0 || bulkFormProcessing}
                            onClick={() => onBulkAction('unpublish')}
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            {t('posts.index.actions.bulk_unpublish', '設為草稿')}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={selectedCount === 0 || bulkFormProcessing}
                            onClick={() => onBulkAction('delete')}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('posts.index.actions.bulk_delete', '刪除選取')}
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="hidden md:block">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                            <tr>
                                {canBulk && (
                                    <th className="px-4 py-3">
                                        <Checkbox
                                            checked={allSelected}
                                            onCheckedChange={(value) => onToggleSelectAll(Boolean(value))}
                                        />
                                    </th>
                                )}
                                <th className="px-4 py-3">{t('posts.index.table.columns.title', '標題')}</th>
                                <th className="px-4 py-3">{t('posts.index.table.columns.category', '分類')}</th>
                                <th className="px-4 py-3">{t('posts.index.table.columns.author', '作者')}</th>
                                <th className="px-4 py-3">{t('posts.index.table.columns.status', '狀態')}</th>
                                <th className="px-4 py-3">{t('posts.index.table.columns.published_at', '發布時間')}</th>
                                <th className="px-4 py-3">{t('posts.index.table.columns.views', '瀏覽數')}</th>
                                <th className="px-4 py-3">{t('posts.index.table.columns.attachments', '附件')}</th>
                                <th className="px-4 py-3 text-right">{t('posts.index.table.columns.actions', '操作')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                            {posts.length === 0 ? (
                                <tr>
                                    <td colSpan={canBulk ? 9 : 8} className="px-4 py-6 text-center text-sm text-slate-500">
                                        {t('posts.index.table.empty', '尚無符合條件的公告。')}
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post) => {
                                    const statusVariant = statusVariantMap[post.status];
                                    const statusLabel = getStatusLabel(post.status, t, fallbackLanguage);
                                    const isSelected = selectedIds.includes(post.id);
                                    const publishDate = formatDateTime(post.publish_at, localeForDate);
                                    const categoryLabel = post.category
                                        ? fallbackLanguage === 'zh'
                                            ? post.category.name
                                            : post.category.name_en ?? post.category.name
                                        : t('posts.show.not_set', fallbackLanguage === 'zh' ? '未設定' : 'Not set');
                                    const authorLabel = post.author
                                        ? post.author.name
                                        : t('posts.show.not_set', fallbackLanguage === 'zh' ? '未設定' : 'Not set');

                                    return (
                                        <tr key={post.id} className={isSelected ? 'bg-slate-50/60' : undefined}>
                                            {canBulk && (
                                                <td className="px-4 py-3">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => onToggleSelection(post.id)}
                                                    />
                                                </td>
                                            )}
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <Link
                                                        href={`/manage/posts/${post.id}`}
                                                        className="font-semibold text-slate-900 hover:text-slate-700"
                                                    >
                                                        {post.title}
                                                    </Link>
                                                    <span className="text-xs text-slate-500">
                                                        {`${t('posts.show.slug', '網址 Slug')}：${post.slug}`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{categoryLabel}</td>
                                            <td className="px-4 py-3 text-slate-600">{authorLabel}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={statusVariant}>{statusLabel}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {publishDate ??
                                                    t('posts.index.table.not_scheduled', fallbackLanguage === 'zh' ? '未排程' : 'Not scheduled')}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{post.views}</td>
                                            <td className="px-4 py-3 text-slate-600">{post.attachments_count}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={`/manage/posts/${post.id}`}
                                                                className={iconActionClass}
                                                                aria-label={t(
                                                                    'posts.index.actions.view_aria',
                                                                    fallbackLanguage === 'zh' ? '檢視公告' : 'View announcement',
                                                                )}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {t(
                                                                'posts.index.actions.view_label',
                                                                fallbackLanguage === 'zh' ? '檢視公告內容' : 'View details',
                                                            )}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={`/manage/posts/${post.id}/edit`}
                                                                className={iconActionClass}
                                                                aria-label={t(
                                                                    'posts.index.actions.edit_aria',
                                                                    fallbackLanguage === 'zh' ? '編輯公告' : 'Edit announcement',
                                                                )}
                                                            >
                                                                <Pen className="h-4 w-4" />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {t(
                                                                'posts.index.actions.edit_label',
                                                                fallbackLanguage === 'zh' ? '編輯公告內容' : 'Edit this bulletin',
                                                            )}
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

                <div className="grid gap-3 md:hidden">
                    {posts.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                            {t('posts.index.table.empty', '尚無符合條件的公告。')}
                        </div>
                    ) : (
                        posts.map((post) => {
                            const statusVariant = statusVariantMap[post.status];
                            const statusLabel = getStatusLabel(post.status, t, fallbackLanguage);
                            const isSelected = selectedIds.includes(post.id);
                            const categoryLabel = post.category
                                ? localeForDate === 'zh-TW'
                                    ? post.category.name
                                    : post.category.name_en ?? post.category.name
                                : t('posts.show.not_set', fallbackLanguage === 'zh' ? '未設定' : 'Not set');
                            const authorLabel = post.author
                                ? post.author.name
                                : t('posts.show.not_set', fallbackLanguage === 'zh' ? '未設定' : 'Not set');
                            const publishDate = formatDateTime(post.publish_at, localeForDate);

                            return (
                                <div key={`mobile-post-${post.id}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <Link
                                                    href={`/manage/posts/${post.id}`}
                                                    className="text-base font-semibold text-slate-900"
                                                >
                                                    {post.title}
                                                </Link>
                                                <Badge variant={statusVariant}>{statusLabel}</Badge>
                                            </div>
                                            <span className="text-xs text-slate-500">
                                                {`${t('posts.show.slug', '網址 Slug')}：${post.slug}`}
                                            </span>
                                        </div>

                                        <div className="grid gap-2 text-sm text-slate-600">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-medium text-slate-700">
                                                    {t('posts.index.table.columns.category', '分類')}
                                                </span>
                                                <span className="text-right">{categoryLabel}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-medium text-slate-700">
                                                    {t('posts.index.table.columns.author', '作者')}
                                                </span>
                                                <span className="text-right">{authorLabel}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-medium text-slate-700">
                                                    {t('posts.index.table.columns.published_at', '發布時間')}
                                                </span>
                                                <span className="text-right">
                                                    {publishDate ??
                                                        t(
                                                            'posts.index.table.not_scheduled',
                                                            fallbackLanguage === 'zh' ? '未排程' : 'Not scheduled',
                                                        )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-medium text-slate-700">
                                                    {t('posts.index.table.columns.views', '瀏覽數')}
                                                </span>
                                                <span className="text-right">{post.views}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-medium text-slate-700">
                                                    {t('posts.index.table.columns.attachments', '附件')}
                                                </span>
                                                <span className="text-right">{post.attachments_count}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            {canBulk && (
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => onToggleSelection(post.id)}
                                                    />
                                                    <span className="text-xs text-slate-600">
                                                        {isSelected
                                                            ? t('posts.index.mobile.selected', '已選取')
                                                            : t('posts.index.mobile.select', '選取')}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex flex-1 justify-end gap-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/manage/posts/${post.id}`}>
                                                        <Eye className="mr-1 h-4 w-4" />
                                                        {t('posts.index.actions.view_label', '檢視公告內容')}
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/manage/posts/${post.id}/edit`}>
                                                        <Pen className="mr-1 h-4 w-4" />
                                                        {t('posts.index.actions.edit_label', '編輯公告內容')}
                                                    </Link>
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
                            {t('posts.index.table.page', '第 :current / :last 頁', {
                                current: pagination.current_page,
                                last: pagination.last_page,
                            })}
                            ，
                            {t('posts.index.table.records_total', '共 :total 筆資料', {
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
                                aria-label={t('posts.index.table.prev', '上一頁')}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {paginationLinks.map((link, index) => {
                                if (!link.url) {
                                    return null;
                                }

                                const label = link.label.replace(/&laquo;|&raquo;|&nbsp;/g, '');
                                const url = new URL(link.url);
                                const pageParam = url.searchParams.get('page');
                                const pageNumber = pageParam ? Number(pageParam) : 1;

                                return (
                                    <Button
                                        type="button"
                                        key={`${link.label}-${index}`}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        className="min-w-9"
                                        onClick={() => changePage(pageNumber)}
                                    >
                                        {label || pageNumber}
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
                                aria-label={t('posts.index.table.next', '下一頁')}
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
