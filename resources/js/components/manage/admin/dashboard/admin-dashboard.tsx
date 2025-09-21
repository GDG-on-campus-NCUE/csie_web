import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-tw';
import 'dayjs/locale/en';
import { useMemo } from 'react';

import { useTranslator } from '@/hooks/use-translator';
import { type AdminDashboardAttachmentSummary, type AdminDashboardPostSummary, type SharedData } from '@/types';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

type MetricKey =
    | 'totalPosts'
    | 'publishedPosts'
    | 'draftPosts'
    | 'archivedPosts'
    | 'pinnedPosts'
    | 'totalUsers';

type AttachmentMetricKey = 'total' | 'images' | 'documents' | 'links' | 'trashed';

const metricOrder: MetricKey[] = [
    'totalPosts',
    'publishedPosts',
    'draftPosts',
    'archivedPosts',
    'pinnedPosts',
    'totalUsers',
];

const attachmentOrder: AttachmentMetricKey[] = ['total', 'images', 'documents', 'links', 'trashed'];

function formatNumber(value: number | null | undefined) {
    if (value === null || value === undefined) {
        return '0';
    }

    return new Intl.NumberFormat().format(value);
}

function formatBytes(bytes: number | null | undefined) {
    if (!bytes) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** exponent;

    return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function getPostTitle(post: AdminDashboardPostSummary, locale: string | undefined) {
    const normalized = locale?.toLowerCase();

    if (normalized === 'en') {
        return post.title_en || post.title;
    }

    return post.title || post.title_en;
}

function PostListItem({
    post,
    locale,
    badgeCopy,
}: {
    post: AdminDashboardPostSummary;
    locale: string | undefined;
    badgeCopy: Record<string, string>;
}) {
    const title = getPostTitle(post, locale);
    const publishAt = post.publish_at ? dayjs(post.publish_at) : null;
    const localeKey = locale?.toLowerCase() ?? 'zh-tw';

    return (
        <li className="flex flex-col gap-2 rounded-2xl bg-neutral-50/70 px-4 py-3 text-sm text-neutral-700 ring-1 ring-black/5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium text-neutral-900">{title}</div>
                <Badge variant="outline" className="border-[#0f1c3f]/20 bg-[#0f1c3f]/10 text-[#0f1c3f]">
                    {badgeCopy[post.status] ?? post.status}
                </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                {publishAt && (
                    <span>
                        {publishAt.locale(localeKey).format('YYYY/MM/DD HH:mm')}
                        {' · '}
                        {publishAt.locale(localeKey).fromNow()}
                    </span>
                )}
                <span>
                    {badgeCopy.attachments.replace(':count', String(post.attachments_count ?? 0))}
                </span>
                {post.pinned && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">{badgeCopy.pinned}</span>}
            </div>
        </li>
    );
}

function AttachmentListItem({
    attachment,
    t,
    locale,
}: {
    attachment: AdminDashboardAttachmentSummary;
    t: (key: string, fallback?: string) => string;
    locale: string | undefined;
}) {
    const createdAt = attachment.created_at ? dayjs(attachment.created_at) : null;
    const localeKey = locale?.toLowerCase() ?? 'zh-tw';

    return (
        <li className="flex flex-col gap-2 rounded-2xl bg-neutral-50/70 px-4 py-3 text-sm text-neutral-700 ring-1 ring-black/5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium text-neutral-900">
                    {attachment.title ?? t('dashboard.admin.attachments.untitled', '未命名附件')}
                </div>
                <Badge variant="outline" className="border-neutral-200 bg-white text-neutral-600">
                    {t(`dashboard.admin.attachments.types.${attachment.type}`, attachment.type)}
                </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                <span>{formatBytes(attachment.file_size)}</span>
                {createdAt && <span>{createdAt.locale(localeKey).format('YYYY/MM/DD HH:mm')}</span>}
                {attachment.attachable?.label && (
                    <span className="truncate text-neutral-600">
                        {attachment.attachable.label}
                    </span>
                )}
            </div>
        </li>
    );
}

export default function AdminDashboard() {
    const { t } = useTranslator('manage');
    const { props } = usePage<SharedData>();
    const { adminDashboard, locale } = props;

    const metricCopy = useMemo(
        () => ({
            totalPosts: t('dashboard.admin.metrics.total_posts', '公告總數'),
            publishedPosts: t('dashboard.admin.metrics.published_posts', '已發布'),
            draftPosts: t('dashboard.admin.metrics.draft_posts', '草稿'),
            archivedPosts: t('dashboard.admin.metrics.archived_posts', '封存'),
            pinnedPosts: t('dashboard.admin.metrics.pinned_posts', '置頂公告'),
            totalUsers: t('dashboard.admin.metrics.total_users', '使用者數'),
        }),
        [t]
    );

    const attachmentCopy = useMemo(
        () => ({
            title: t('dashboard.admin.attachments.title', '附件概況'),
            total: t('dashboard.admin.attachments.total', '總附件'),
            images: t('dashboard.admin.attachments.images', '圖片'),
            documents: t('dashboard.admin.attachments.documents', '文件'),
            links: t('dashboard.admin.attachments.links', '外部連結'),
            trashed: t('dashboard.admin.attachments.trashed', '回收桶'),
            totalSize: t('dashboard.admin.attachments.total_size', '儲存使用量'),
            untitled: t('dashboard.admin.attachments.untitled', '未命名附件'),
            types: {
                image: t('dashboard.admin.attachments.types.image', '圖片'),
                document: t('dashboard.admin.attachments.types.document', '文件'),
                link: t('dashboard.admin.attachments.types.link', '連結'),
            },
        }),
        [t]
    );

    const postBadgeCopy = useMemo(
        () => ({
            draft: t('posts.status.draft', '草稿'),
            published: t('posts.status.published', '發布'),
            archived: t('posts.status.archived', '封存'),
            attachments: t('dashboard.admin.posts.attachments_count', '共 :count 筆附件'),
            pinned: t('dashboard.admin.posts.pinned_badge', '置頂'),
        }),
        [t]
    );

    if (!adminDashboard) {
        return (
            <Card className="rounded-3xl border-none bg-white shadow-sm ring-1 ring-black/5">
                <CardHeader className="gap-2">
                    <CardTitle className="text-xl font-semibold text-neutral-900">
                        {t('dashboard.admin.empty.title', '尚未載入儀表板資料')}
                    </CardTitle>
                    <CardDescription className="text-sm text-neutral-500">
                        {t('dashboard.admin.empty.description', '請確認後端是否提供 Dashboard 資料。')}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const metrics = metricOrder.map((key) => ({
        key,
        label: metricCopy[key],
        value: adminDashboard.metrics[key],
    }));

    const attachmentMetrics = attachmentOrder.map((key) => ({
        key,
        label: attachmentCopy[key],
        value: adminDashboard.attachments[key],
    }));

    return (
        <div className="flex flex-col gap-8">
            <section className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium uppercase tracking-wide text-[#0f1c3f]">
                            {t('dashboard.admin.badge', '管理儀表板')}
                        </p>
                        <h1 className="text-3xl font-semibold text-neutral-900">
                            {t('dashboard.admin.title', '系統總覽')}
                        </h1>
                        <p className="max-w-2xl text-sm text-neutral-500">
                            {t(
                                'dashboard.admin.description',
                                '即時掌握公告、附件與聯絡訊息狀態，協助團隊快速行動。'
                            )}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button asChild className="bg-[#0f1c3f] hover:bg-[#172b63]">
                            <Link href="/manage/posts/create">
                                {t('dashboard.admin.actions.create_post', '快速建立公告')}
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/manage/posts">
                                {t('dashboard.admin.actions.view_posts', '檢視公告列表')}
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <section className="grid gap-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {metrics.map((metric) => (
                        <Card
                            key={metric.key}
                            className="rounded-3xl border-none bg-white shadow-sm ring-1 ring-black/5"
                        >
                            <CardHeader className="gap-1">
                                <CardDescription className="text-sm text-neutral-500">
                                    {metric.label}
                                </CardDescription>
                                <CardTitle className="text-3xl font-semibold text-neutral-900">
                                    {formatNumber(metric.value)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {attachmentMetrics.map((metric) => (
                        <Card
                            key={metric.key}
                            className="rounded-3xl border-none bg-white shadow-sm ring-1 ring-black/5"
                        >
                            <CardHeader className="gap-1">
                                <CardDescription className="text-sm text-neutral-500">
                                    {metric.label}
                                </CardDescription>
                                <CardTitle className="text-3xl font-semibold text-neutral-900">
                                    {formatNumber(metric.value)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    ))}

                    <Card className="rounded-3xl border-none bg-white shadow-sm ring-1 ring-black/5">
                        <CardHeader className="gap-1">
                            <CardDescription className="text-sm text-neutral-500">
                                {attachmentCopy.totalSize}
                            </CardDescription>
                            <CardTitle className="text-3xl font-semibold text-neutral-900">
                                {formatBytes(adminDashboard.attachments.totalSize)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <Card className="h-full rounded-3xl border-none bg-white shadow-sm ring-1 ring-black/5">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-neutral-900">
                            {t('dashboard.admin.posts.title', '最新公告')}
                        </CardTitle>
                        <CardDescription className="text-sm text-neutral-500">
                            {t('dashboard.admin.posts.description', '追蹤最近發佈或更新的公告')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {adminDashboard.recentPosts.length === 0 ? (
                            <p className="text-sm text-neutral-500">
                                {t('dashboard.admin.posts.empty', '目前沒有公告記錄。')}
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {adminDashboard.recentPosts.map((post) => (
                                    <PostListItem
                                        key={post.id}
                                        post={post}
                                        locale={locale}
                                        badgeCopy={postBadgeCopy}
                                    />
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card className="h-full rounded-3xl border-none bg-white shadow-sm ring-1 ring-black/5">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-neutral-900">
                            {t('dashboard.admin.attachments.recent_title', '最新附件')}
                        </CardTitle>
                        <CardDescription className="text-sm text-neutral-500">
                            {t('dashboard.admin.attachments.recent_description', '檢視最近上傳或建立的附件資源')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {adminDashboard.recentAttachments.length === 0 ? (
                            <p className="text-sm text-neutral-500">
                                {t('dashboard.admin.attachments.empty', '目前沒有附件記錄。')}
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {adminDashboard.recentAttachments.map((attachment) => (
                                    <AttachmentListItem
                                        key={attachment.id}
                                        attachment={attachment}
                                        t={t}
                                        locale={locale}
                                    />
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </section>

            <section>
                <Card className="rounded-3xl border-none bg-white shadow-sm ring-1 ring-black/5">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-neutral-900">
                            {t('dashboard.admin.contact.title', '聯絡訊息狀態')}
                        </CardTitle>
                        <CardDescription className="text-sm text-neutral-500">
                            {t('dashboard.admin.contact.description', '即時掌握聯絡表單處理進度')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {(['new', 'in_progress', 'resolved', 'spam'] as const).map((key) => (
                                <div
                                    key={key}
                                    className="flex flex-col gap-1 rounded-2xl bg-neutral-50/70 px-4 py-3 text-sm text-neutral-600 ring-1 ring-black/5"
                                >
                                    <span className="text-xs uppercase tracking-wide text-neutral-500">
                                        {t(`dashboard.admin.contact.status.${key}`, key)}
                                    </span>
                                    <span className="text-2xl font-semibold text-neutral-900">
                                        {formatNumber(adminDashboard.contactMessages[key])}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
