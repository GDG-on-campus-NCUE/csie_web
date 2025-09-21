import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ManageLayout from '@/layouts/manage/manage-layout';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Calendar, ChevronLeft, ChevronRight, Edit, Eye, FileText, Paperclip, Pin, Trash2, User } from 'lucide-react';
import { useTranslator } from '@/hooks/use-translator';

interface PostCategory {
    id: number;
    name: string;
    name_en: string;
    slug: string;
}

interface UserSummary {
    id: number;
    name: string;
    email: string;
}

interface PostItem {
    id: number;
    title: string;
    title_en: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    publish_at: string | null;
    pinned: boolean;
    attachments_count: number;
    category: PostCategory;
    creator: UserSummary;
    created_at: string;
    updated_at: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PostsIndexProps {
    posts: {
        data: PostItem[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        meta?: PaginationMeta;
        current_page?: number;
        last_page?: number;
        per_page?: number;
        total?: number;
    };
    categories: PostCategory[];
    filters?: {
        search?: string;
        category?: string | number;
        status?: string;
        pinned?: string;
        per_page?: number;
    };
    perPageOptions?: number[];
}

type FilterState = {
    search: string;
    category: string;
    status: string;
    pinned: string;
    per_page: string;
};

const DEFAULT_PAGINATION_META: PaginationMeta = {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
};

export default function PostsIndex({ posts, categories, filters = {}, perPageOptions = [] }: PostsIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const { t, isZh, localeKey } = useTranslator('manage');
    const role = auth?.user?.role ?? 'user';

    const postsIndexUrl = '/manage/admin/posts';
    const attachmentsIndexUrl = '/manage/admin/attachments';

    const { delete: destroy } = useForm();

    const postsData = posts?.data ?? [];
    const paginationMeta: PaginationMeta = {
        current_page: posts?.meta?.current_page ?? posts?.current_page ?? DEFAULT_PAGINATION_META.current_page,
        last_page: posts?.meta?.last_page ?? posts?.last_page ?? DEFAULT_PAGINATION_META.last_page,
        per_page: posts?.meta?.per_page ?? posts?.per_page ?? DEFAULT_PAGINATION_META.per_page,
        total: posts?.meta?.total ?? posts?.total ?? DEFAULT_PAGINATION_META.total,
    };
    const paginationLinks = posts?.links ?? [];
    const resolvedPerPageOptions = perPageOptions.length > 0 ? perPageOptions : [10, 20, 50];

    const [filterState, setFilterState] = useState<FilterState>({
        search: filters.search ?? '',
        category: filters.category ? String(filters.category) : '',
        status: filters.status ?? '',
        pinned: filters.pinned ?? '',
        per_page: String(filters.per_page ?? paginationMeta.per_page ?? DEFAULT_PAGINATION_META.per_page),
    });

    useEffect(() => {
        setFilterState({
            search: filters.search ?? '',
            category: filters.category ? String(filters.category) : '',
            status: filters.status ?? '',
            pinned: filters.pinned ?? '',
            per_page: String(filters.per_page ?? paginationMeta.per_page ?? DEFAULT_PAGINATION_META.per_page),
        });
    }, [filters.search, filters.category, filters.status, filters.pinned, filters.per_page, paginationMeta.per_page]);

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilterState((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const applyFilters = (event?: FormEvent) => {
        event?.preventDefault();
        const query = Object.fromEntries(Object.entries(filterState).filter(([_, value]) => value !== ''));

        router.get(postsIndexUrl, query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const resetState: FilterState = {
            search: '',
            category: '',
            status: '',
            pinned: '',
            per_page: String(paginationMeta.per_page ?? DEFAULT_PAGINATION_META.per_page),
        };
        setFilterState(resetState);
        router.get(postsIndexUrl, { per_page: resetState.per_page }, {
            preserveScroll: true,
            replace: true,
        });
    };

    const hasActiveFilters = useMemo(() => {
        const { search, category, status, pinned } = filterState;
        return [search, category, status, pinned].some((value) => value !== '');
    }, [filterState]);

    const buildFilterQuery = (overrides: Record<string, string | number | undefined>) => {
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

    const buildAttachmentLink = (postId: number) => {
        const params = new URLSearchParams({
            attachable_type: 'App\\Models\\Post',
            attachable_id: String(postId),
        });

        return `${attachmentsIndexUrl}?${params.toString()}`;
    };

    const goToPage = (page: number) => {
        if (page < 1 || page > paginationMeta.last_page || page === paginationMeta.current_page) {
            return;
        }

        router.get(postsIndexUrl, buildFilterQuery({ page }), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const paginationButtonClass = (disabled: boolean) =>
        cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors',
            disabled
                ? 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
                : 'border-transparent bg-[#151f54] text-white shadow-sm hover:bg-[#1f2a6d]'
        );

    const getStatusBadge = (status: string) => {
        const variants = {
            draft: 'secondary',
            published: 'default',
            archived: 'outline',
        } as const;

        const labels = {
            draft: t('posts.status.draft', isZh ? '草稿' : 'Draft'),
            published: t('posts.status.published', isZh ? '發布' : 'Published'),
            archived: t('posts.status.archived', isZh ? '封存' : 'Archived'),
        } as const;

        return <Badge variant={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) {
            return t('posts.index.table.not_scheduled', isZh ? '未排程' : 'Not scheduled');
        }

        return new Date(dateString).toLocaleString(localeKey === 'zh-TW' ? 'zh-TW' : 'en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const sanitizeLabel = (label: string) =>
        label
            .replace(/<[^>]+>/g, '')
            .replace(/&laquo;/g, '«')
            .replace(/&raquo;/g, '»')
            .replace(/&nbsp;/g, ' ');

    const canEditPost = (post: PostItem) => {
        if (!auth?.user) return false;
        if (auth.user.role === 'admin') return true;
        if (auth.user.role === 'teacher' && post.creator.id === auth.user.id) return true;
        return false;
    };

    const canDeletePost = (post: PostItem) => {
        if (!auth?.user) return false;
        if (auth.user.role === 'admin') return true;
        if (auth.user.role === 'teacher' && post.creator.id === auth.user.id) return true;
        return false;
    };

    const breadcrumbs = [
        { title: t('layout.breadcrumbs.dashboard', isZh ? '管理首頁' : 'Management'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.posts', isZh ? '公告管理' : 'Announcements'), href: postsIndexUrl },
    ];

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <Head title={t('posts.index.title', isZh ? '公告管理' : 'Manage announcements')} />

            <section className="space-y-6">
                <div className="rounded-3xl bg-gradient-to-br from-white via-white to-[#eef1ff] px-6 py-8 shadow-sm ring-1 ring-black/5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#151f54]/10 px-3 py-1 text-xs font-semibold text-[#151f54]">
                                <Calendar className="h-4 w-4" />
                                {t('posts.index.badge', isZh ? '公告中心' : 'Bulletin hub')}
                            </span>
                            <h1 className="text-3xl font-semibold text-[#151f54]">
                                {t('posts.index.title', isZh ? '公告管理' : 'Manage announcements')}
                            </h1>
                            <p className="max-w-2xl text-sm text-slate-600">
                                {t(
                                    'posts.index.description',
                                    isZh
                                        ? '掌握公告發布、置頂與附件，維持對外資訊的一致性。'
                                        : 'Control publication status, pin important updates, and keep attachments organised.'
                                )}
                            </p>
                        </div>
                        {auth?.user && ['admin', 'teacher'].includes(role) && (
                            <Button
                                asChild
                                className="rounded-full bg-[#151f54] px-6 text-white shadow-sm hover:bg-[#1f2a6d]"
                            >
                                <Link href="/manage/admin/posts/create">
                                    {t('posts.index.create', isZh ? '新增公告' : 'Create bulletin')}
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold text-[#151f54]">
                            {t('posts.index.filters_title', isZh ? '篩選條件' : 'Filters')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={applyFilters}
                            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6"
                        >
                            <div className="xl:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="post-search">
                                    {t('posts.index.filters.keyword', isZh ? '關鍵字' : 'Keyword')}
                                </label>
                                <Input
                                    id="post-search"
                                    type="search"
                                    placeholder={t(
                                        'posts.index.filters.keyword_placeholder',
                                        isZh ? '輸入標題關鍵字' : 'Search by title'
                                    )}
                                    value={filterState.search}
                                    onChange={(event) => handleFilterChange('search', event.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="post-category">
                                    {t('posts.index.filters.category', isZh ? '分類' : 'Category')}
                                </label>
                                <Select
                                    id="post-category"
                                    value={filterState.category}
                                    onChange={(event) => handleFilterChange('category', event.target.value)}
                                >
                                    <option value="">{t('posts.index.filters.all', isZh ? '全部' : 'All')}</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {isZh ? category.name : category.name_en}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="post-status">
                                    {t('posts.index.filters.status', isZh ? '狀態' : 'Status')}
                                </label>
                                <Select
                                    id="post-status"
                                    value={filterState.status}
                                    onChange={(event) => handleFilterChange('status', event.target.value)}
                                >
                                    <option value="">{t('posts.index.filters.all', isZh ? '全部' : 'All')}</option>
                                    <option value="draft">{t('posts.status.draft', isZh ? '草稿' : 'Draft')}</option>
                                    <option value="published">{t('posts.status.published', isZh ? '發布' : 'Published')}</option>
                                    <option value="archived">{t('posts.status.archived', isZh ? '封存' : 'Archived')}</option>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="post-pinned">
                                    {t('posts.index.filters.pinned', isZh ? '置頂' : 'Pinned')}
                                </label>
                                <Select
                                    id="post-pinned"
                                    value={filterState.pinned}
                                    onChange={(event) => handleFilterChange('pinned', event.target.value)}
                                >
                                    <option value="">{t('posts.index.filters.all', isZh ? '全部' : 'All')}</option>
                                    <option value="1">{t('posts.index.filters.pinned_only', isZh ? '僅顯示置頂' : 'Pinned only')}</option>
                                    <option value="0">{t('posts.index.filters.pinned_exclude', isZh ? '排除置頂' : 'Exclude pinned')}</option>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="post-per-page">
                                    {t('posts.index.filters.per_page', isZh ? '每頁數量' : 'Per page')}
                                </label>
                                <Select
                                    id="post-per-page"
                                    value={filterState.per_page}
                                    onChange={(event) => handleFilterChange('per_page', event.target.value)}
                                >
                                    {resolvedPerPageOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="flex items-end gap-2">
                                <Button type="submit" className="w-full bg-[#151f54] text-white hover:bg-[#1f2a6d]">
                                    {t('posts.index.filters.apply', isZh ? '套用' : 'Apply')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full"
                                    disabled={!hasActiveFilters}
                                    onClick={resetFilters}
                                >
                                    {t('posts.index.filters.reset', isZh ? '重設' : 'Reset')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardHeader className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold text-[#151f54]">
                                {t('posts.index.table.title', isZh ? '公告列表' : 'Announcement list')}
                            </CardTitle>
                            <p className="text-sm text-slate-500">
                                {t(
                                    'posts.index.table.records_total',
                                    isZh
                                        ? `共 ${paginationMeta.total} 筆資料`
                                        : `${paginationMeta.total} records in total`,
                                    { total: paginationMeta.total }
                                )}
                            </p>
                        </div>
                        {auth?.user && ['admin', 'teacher'].includes(role) && (
                            <Button asChild variant="outline" className="rounded-full border-[#151f54]/30">
                                <Link href="/manage/admin/posts/create">
                                    {t('posts.index.create', isZh ? '新增公告' : 'Create bulletin')}
                                </Link>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="overflow-hidden rounded-2xl border border-neutral-200/70">
                            <table className="min-w-full divide-y divide-neutral-200 bg-white text-sm">
                                <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">
                                            {t('posts.index.table.columns.title', isZh ? '標題' : 'Title')}
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            {t('posts.index.table.columns.category', isZh ? '分類' : 'Category')}
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            {t('posts.index.table.columns.status', isZh ? '狀態' : 'Status')}
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            {t('posts.index.table.columns.published_at', isZh ? '發布時間' : 'Published at')}
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            {t('posts.index.table.columns.attachments', isZh ? '附件' : 'Attachments')}
                                        </th>
                                        <th className="px-4 py-3 font-medium text-right">
                                            {t('posts.index.table.columns.actions', isZh ? '操作' : 'Actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {postsData.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500">
                                                {t(
                                                    'posts.index.table.empty',
                                                    isZh
                                                        ? '目前尚無符合條件的公告'
                                                        : 'No announcements found with current filters.'
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                    {postsData.map((post) => {
                                        const attachmentsLink = buildAttachmentLink(post.id);
                                        const attachmentsCountLabel = t(
                                            'posts.index.table.attachments_count',
                                            isZh
                                                ? `${post.attachments_count} 筆附件`
                                                : `${post.attachments_count} attachment${post.attachments_count === 1 ? '' : 's'}`,
                                            { count: post.attachments_count }
                                        );

                                        return (
                                            <tr key={post.id} className="hover:bg-[#f7f8fc]">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-2 text-sm font-semibold text-[#151f54]">
                                                            {post.pinned && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <span className="inline-flex items-center justify-center rounded-full bg-[#151f54]/10 p-1 text-[#151f54]">
                                                                            <Pin className="h-3.5 w-3.5" />
                                                                        </span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {t(
                                                                            'posts.index.actions.pinned_badge',
                                                                            isZh ? '置頂公告' : 'Pinned bulletin'
                                                                        )}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            <Link href={`/manage/admin/posts/${post.id}`} className="hover:text-[#8a6300]">
                                                                {isZh ? post.title : post.title_en}
                                                            </Link>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                                                            <span className="inline-flex items-center gap-1">
                                                                <User className="h-3.5 w-3.5" />
                                                                {post.creator.name}
                                                            </span>
                                                            <span>{formatDate(post.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-neutral-600">
                                                    {isZh ? post.category.name : post.category.name_en}
                                                </td>
                                                <td className="px-4 py-4">{getStatusBadge(post.status)}</td>
                                                <td className="px-4 py-4 text-sm text-neutral-600">{formatDate(post.publish_at)}</td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col gap-2 text-sm text-neutral-600">
                                                        <span className="inline-flex items-center gap-2">
                                                            <Paperclip className="h-4 w-4" />
                                                            {attachmentsCountLabel}
                                                        </span>
                                                        <Link
                                                            href={attachmentsLink}
                                                            preserveScroll
                                                            className="inline-flex items-center gap-2 text-xs font-medium text-[#151f54] hover:text-[#8a6300]"
                                                        >
                                                            <FileText className="h-3.5 w-3.5" />
                                                            {t(
                                                                'posts.index.table.manage_attachments',
                                                                isZh ? '管理附件' : 'Manage attachments'
                                                            )}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Link
                                                                    href={`/manage/admin/posts/${post.id}`}
                                                                    className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white p-2 text-[#151f54] hover:border-[#151f54]/40 hover:bg-[#f5f7ff]"
                                                                    aria-label={t(
                                                                        'posts.index.actions.view_aria',
                                                                        isZh ? '檢視公告' : 'View announcement'
                                                                    )}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {t(
                                                                    'posts.index.actions.view_label',
                                                                    isZh ? '檢視公告內容' : 'View details'
                                                                )}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        {canEditPost(post) && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Link
                                                                        href={`/manage/admin/posts/${post.id}/edit`}
                                                                        className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white p-2 text-[#151f54] hover:border-[#151f54]/40 hover:bg-[#f5f7ff]"
                                                                        aria-label={t(
                                                                            'posts.index.actions.edit_aria',
                                                                            isZh ? '編輯公告' : 'Edit announcement'
                                                                        )}
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {t(
                                                                        'posts.index.actions.edit_label',
                                                                        isZh ? '編輯公告內容' : 'Edit this bulletin'
                                                                    )}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                        {canDeletePost(post) && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            destroy(`${postsIndexUrl}/${post.id}`, {
                                                                                preserveScroll: true,
                                                                            })
                                                                        }
                                                                        className="inline-flex items-center justify-center rounded-full border border-rose-100 bg-white p-2 text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                                                                        aria-label={t(
                                                                            'posts.index.actions.delete_aria',
                                                                            isZh ? '刪除公告' : 'Delete announcement'
                                                                        )}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {t(
                                                                        'posts.index.actions.delete_label',
                                                                        isZh ? '刪除此公告' : 'Delete this bulletin'
                                                                    )}
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
                            <div className="flex items-center justify-between pt-2 text-sm text-neutral-500">
                                <div>
                                    {t(
                                        'posts.index.table.page',
                                        isZh
                                            ? `第 ${paginationMeta.current_page} / ${paginationMeta.last_page} 頁`
                                            : `Page ${paginationMeta.current_page} of ${paginationMeta.last_page}`,
                                        { current: paginationMeta.current_page, last: paginationMeta.last_page }
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => goToPage(paginationMeta.current_page - 1)}
                                        className={paginationButtonClass(paginationMeta.current_page <= 1)}
                                        disabled={paginationMeta.current_page <= 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    {paginationLinks.map((link, index) => {
                                        const linkUrl = link.url;

                                        if (!linkUrl) {
                                            return null;
                                        }

                                        const label = sanitizeLabel(link.label);
                                        const isActive = link.active;

                                        return (
                                            <button
                                                type="button"
                                                key={`${link.label}-${index}`}
                                                onClick={() => {
                                                    const url = new URL(linkUrl);
                                                    const pageParam = url.searchParams.get('page');
                                                    const pageNumber = pageParam ? Number(pageParam) : 1;
                                                    goToPage(pageNumber);
                                                }}
                                                className={cn(
                                                    'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm transition',
                                                    isActive
                                                        ? 'border-[#151f54]/20 bg-[#151f54] text-white'
                                                        : 'border-transparent bg-white text-neutral-600 hover:bg-[#f5f7ff]'
                                                )}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                    <button
                                        type="button"
                                        onClick={() => goToPage(paginationMeta.current_page + 1)}
                                        className={paginationButtonClass(paginationMeta.current_page >= paginationMeta.last_page)}
                                        disabled={paginationMeta.current_page >= paginationMeta.last_page}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>
        </ManageLayout>
    );
}
