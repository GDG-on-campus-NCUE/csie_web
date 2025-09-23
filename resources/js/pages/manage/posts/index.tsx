import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, ChevronLeft, ChevronRight, Eye, FileText, Filter, Pen, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem, SharedData } from '@/types';

interface CategoryOption {
    id: number;
    name: string;
    name_en: string;
    slug: string;
}

interface AuthorOption {
    id: number;
    name: string;
}

interface PostItem {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'scheduled';
    publish_at: string | null;
    category: CategoryOption | null;
    author: { id: number; name: string; email: string } | null;
    views: number;
    attachments_count: number;
    created_at: string | null;
    updated_at: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
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
        links: PaginationLink[];
        meta: PaginationMeta;
    };
    categories: CategoryOption[];
    authors: AuthorOption[];
    filters: Partial<Record<'search' | 'category' | 'status' | 'author' | 'date_from' | 'date_to' | 'per_page', string>>;
    statusOptions: Array<'draft' | 'published' | 'scheduled'>;
    perPageOptions: number[];
    can: {
        create: boolean;
        bulk: boolean;
    };
}

type FilterState = {
    search: string;
    category: string;
    status: string;
    author: string;
    date_from: string;
    date_to: string;
    per_page: string;
};

const statusBadgeMap: Record<'draft' | 'published' | 'scheduled', { label: string; variant: 'secondary' | 'outline' | 'default' }> = {
    draft: { label: '草稿', variant: 'secondary' },
    published: { label: '已發布', variant: 'default' },
    scheduled: { label: '排程中', variant: 'outline' },
};

const formatDateTime = (value: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('zh-TW', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

export default function PostsIndex({ posts, categories, authors, filters, statusOptions, perPageOptions, can }: PostsIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth?.user?.role ?? 'user';
    const layoutRole: 'admin' | 'teacher' | 'user' =
        userRole === 'admin' ? 'admin' : userRole === 'teacher' ? 'teacher' : 'user';
    const [selected, setSelected] = useState<number[]>([]);
    const defaultPerPage = perPageOptions[0] ?? 20;

    const initialFilters: FilterState = {
        search: filters.search ?? '',
        category: filters.category ?? '',
        status: filters.status ?? '',
        author: filters.author ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        per_page: filters.per_page ?? String(defaultPerPage),
    } as FilterState;

    const [filterState, setFilterState] = useState<FilterState>(initialFilters);
    const resolvedPerPage = Number(filterState.per_page || defaultPerPage);

    const postData = posts?.data ?? [];
    const pagination: PaginationMeta = posts?.meta ?? {
        current_page: 1,
        last_page: 1,
        per_page: resolvedPerPage,
        total: postData.length,
    };
    const paginationLinks = posts?.links ?? [];

    const bulkForm = useForm({
        action: '',
        ids: [] as number[],
    });

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: '管理首頁', href: '/manage/dashboard' },
            { title: '公告管理', href: '/manage/posts' },
        ],
        []
    );

    const applyFilters = (event?: React.FormEvent) => {
        event?.preventDefault();
        router.get(
            '/manage/posts',
            {
                ...Object.fromEntries(
                    Object.entries(filterState).filter(([, value]) => value !== '')
                ),
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const resetFilters = () => {
        setFilterState({
            search: '',
            category: '',
            status: '',
            author: '',
            date_from: '',
            date_to: '',
            per_page: String(defaultPerPage),
        });
        router.get(
            '/manage/posts',
            { per_page: defaultPerPage },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelected(postData.map((post) => post.id));
        } else {
            setSelected([]);
        }
    };

    const toggleSelection = (postId: number) => {
        setSelected((prev) =>
            prev.includes(postId)
                ? prev.filter((id) => id !== postId)
                : [...prev, postId]
        );
    };

    const performBulkAction = (action: 'publish' | 'unpublish' | 'delete') => {
        if (selected.length === 0 || bulkForm.processing) return;

        bulkForm.transform(() => ({
            action,
            ids: selected,
        }));

        bulkForm.post('/manage/posts/bulk', {
            preserveScroll: true,
            onSuccess: () => {
                setSelected([]);
                bulkForm.reset();
            },
        });
    };

    const changePage = (page: number) => {
        if (page <= 0 || page > pagination.last_page || page === pagination.current_page) {
            return;
        }

        router.get(
            '/manage/posts',
            {
                ...Object.fromEntries(
                    Object.entries(filterState).filter(([, value]) => value !== '')
                ),
                page,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const hasActiveFilters = useMemo(
        () =>
            filterState.search !== '' ||
            filterState.category !== '' ||
            filterState.status !== '' ||
            filterState.author !== '' ||
            filterState.date_from !== '' ||
            filterState.date_to !== '',
        [filterState]
    );

    useEffect(() => {
        setFilterState({
            search: filters.search ?? '',
            category: filters.category ?? '',
            status: filters.status ?? '',
            author: filters.author ?? '',
            date_from: filters.date_from ?? '',
            date_to: filters.date_to ?? '',
            per_page: filters.per_page ?? String(defaultPerPage),
        } as FilterState);
    }, [filters.search, filters.category, filters.status, filters.author, filters.date_from, filters.date_to, filters.per_page, perPageOptions]);

    useEffect(() => {
        setSelected([]);
    }, [pagination.current_page, pagination.total]);

    return (
        <ManageLayout role={layoutRole} breadcrumbs={breadcrumbs}>
            <Head title="公告管理" />

            <section className="space-y-6">
                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                <Filter className="h-4 w-4" /> 公告總覽
                            </span>
                            <h1 className="text-3xl font-semibold text-slate-900">公告管理</h1>
                            <p className="text-sm text-slate-600">
                                管理公告分類、排程發布及附件檔案，確保資訊即時且一致。
                            </p>
                        </div>
                        {can.create && (
                            <Button asChild className="rounded-full px-6">
                                <Link href="/manage/posts/create">新增公告</Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                            <Filter className="h-5 w-5" /> 篩選條件
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={applyFilters}
                            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6"
                        >
                            <div className="xl:col-span-2 space-y-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-search">
                                    關鍵字
                                </label>
                                <Input
                                    id="filter-search"
                                    value={filterState.search}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, search: event.target.value }))}
                                    placeholder="搜尋標題或內容"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-category">
                                    分類
                                </label>
                                <Select
                                    id="filter-category"
                                    value={filterState.category}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, category: event.target.value }))}
                                >
                                    <option value="">全部</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-status">
                                    狀態
                                </label>
                                <Select
                                    id="filter-status"
                                    value={filterState.status}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, status: event.target.value }))}
                                >
                                    <option value="">全部</option>
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {statusBadgeMap[status].label}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-author">
                                    作者
                                </label>
                                <Select
                                    id="filter-author"
                                    value={filterState.author}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, author: event.target.value }))}
                                >
                                    <option value="">全部</option>
                                    {authors.map((author) => (
                                        <option key={author.id} value={author.id}>
                                            {author.name}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-date-from">
                                    起始日期
                                </label>
                                <Input
                                    id="filter-date-from"
                                    type="date"
                                    value={filterState.date_from}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, date_from: event.target.value }))}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-date-to">
                                    結束日期
                                </label>
                                <Input
                                    id="filter-date-to"
                                    type="date"
                                    value={filterState.date_to}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, date_to: event.target.value }))}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-per-page">
                                    每頁數量
                                </label>
                                <Select
                                    id="filter-per-page"
                                    value={filterState.per_page}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, per_page: event.target.value }))}
                                >
                                    {perPageOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="flex items-end gap-2">
                                <Button type="submit" className="w-full rounded-full">
                                    套用
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={!hasActiveFilters}
                                    className="w-full rounded-full"
                                    onClick={resetFilters}
                                >
                                    重設
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold text-slate-900">公告列表</CardTitle>
                            <p className="text-sm text-slate-600">共 {pagination.total} 筆資料</p>
                        </div>
                        {can.bulk && (
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={selected.length === 0 || bulkForm.processing}
                                    onClick={() => performBulkAction('publish')}
                                >
                                    <FileText className="mr-2 h-4 w-4" /> 批次發布
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={selected.length === 0 || bulkForm.processing}
                                    onClick={() => performBulkAction('unpublish')}
                                >
                                    <Calendar className="mr-2 h-4 w-4" /> 設為草稿
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={selected.length === 0 || bulkForm.processing}
                                    onClick={() => performBulkAction('delete')}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> 批次刪除
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                    <tr>
                                        {can.bulk && (
                                            <th className="px-4 py-3">
                                                <Checkbox
                                                    checked={selected.length === postData.length && postData.length > 0}
                                                    onCheckedChange={(value) => toggleSelectAll(Boolean(value))}
                                                />
                                            </th>
                                        )}
                                        <th className="px-4 py-3">標題</th>
                                        <th className="px-4 py-3">分類</th>
                                        <th className="px-4 py-3">作者</th>
                                        <th className="px-4 py-3">狀態</th>
                                        <th className="px-4 py-3">發布時間</th>
                                        <th className="px-4 py-3">瀏覽</th>
                                        <th className="px-4 py-3">附件</th>
                                        <th className="px-4 py-3 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {postData.length === 0 && (
                                        <tr>
                                            <td colSpan={can.bulk ? 9 : 8} className="px-4 py-12 text-center text-sm text-slate-500">
                                                尚無符合條件的公告
                                            </td>
                                        </tr>
                                    )}
                                    {postData.map((post) => {
                                        const statusInfo = statusBadgeMap[post.status];
                                        const isSelected = selected.includes(post.id);

                                        return (
                                            <tr key={post.id} className="bg-white hover:bg-slate-50">
                                                {can.bulk && (
                                                    <td className="px-4 py-3">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => toggleSelection(post.id)}
                                                        />
                                                    </td>
                                                )}
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col gap-1">
                                                        <Link
                                                            href={`/manage/posts/${post.id}`}
                                                            className="font-semibold text-slate-800 hover:text-slate-900"
                                                        >
                                                            {post.title}
                                                        </Link>
                                                        <span className="text-xs text-slate-500">Slug：{post.slug}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {post.category ? post.category.name : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {post.author ? post.author.name : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{formatDateTime(post.publish_at)}</td>
                                                <td className="px-4 py-3 text-slate-600">{post.views}</td>
                                                <td className="px-4 py-3 text-slate-600">{post.attachments_count}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Link
                                                                    href={`/manage/posts/${post.id}`}
                                                                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </TooltipTrigger>
                                                            <TooltipContent>檢視</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Link
                                                                    href={`/manage/posts/${post.id}/edit`}
                                                                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                                                                >
                                                                    <Pen className="h-4 w-4" />
                                                                </Link>
                                                            </TooltipTrigger>
                                                            <TooltipContent>編輯</TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {paginationLinks.length > 0 && (
                            <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                                <p>
                                    第 {pagination.current_page} / {pagination.last_page} 頁，共 {pagination.total} 筆
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className={cn(
                                            'inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition',
                                            pagination.current_page <= 1
                                                ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                                                : 'border-transparent bg-slate-900 text-white hover:bg-slate-800'
                                        )}
                                        onClick={() => changePage(pagination.current_page - 1)}
                                        disabled={pagination.current_page <= 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    {paginationLinks.map((link, index) => {
                                        if (!link.url) {
                                            return null;
                                        }

                                        const label = link.label.replace(/&laquo;|&raquo;|&nbsp;/g, '');
                                        const url = new URL(link.url);
                                        const pageParam = url.searchParams.get('page');
                                        const pageNumber = pageParam ? Number(pageParam) : 1;

                                        return (
                                            <button
                                                type="button"
                                                key={`${link.label}-${index}`}
                                                className={cn(
                                                    'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm transition',
                                                    link.active
                                                        ? 'border-slate-900/30 bg-slate-900 text-white'
                                                        : 'border-transparent bg-white text-slate-600 hover:bg-slate-50'
                                                )}
                                                onClick={() => changePage(pageNumber)}
                                            >
                                                {label || pageNumber}
                                            </button>
                                        );
                                    })}
                                    <button
                                        type="button"
                                        className={cn(
                                            'inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition',
                                            pagination.current_page >= pagination.last_page
                                                ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                                                : 'border-transparent bg-slate-900 text-white hover:bg-slate-800'
                                        )}
                                        onClick={() => changePage(pagination.current_page + 1)}
                                        disabled={pagination.current_page >= pagination.last_page}
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
