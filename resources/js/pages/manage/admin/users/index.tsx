import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { useTranslator } from '@/hooks/use-translator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Edit3, RotateCcw, Trash2, UserPlus2 } from 'lucide-react';

interface Option {
    value: string;
    label: string;
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

interface UserRecord {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'user';
    status: 'active' | 'suspended';
    locale?: string | null;
    email_verified_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}

interface UsersIndexProps {
    users: {
        data: UserRecord[];
        meta?: PaginationMeta;
        links?: PaginationLink[];
        current_page?: number;
        last_page?: number;
        per_page?: number;
        total?: number;
    };
    filters: {
        q?: string;
        role?: string;
        status?: string;
        created_from?: string;
        created_to?: string;
        trashed?: string;
        sort?: string;
        per_page?: number;
    };
    roleOptions: Option[];
    statusOptions: Option[];
    sortOptions: Option[];
    perPageOptions: number[];
}

type FilterState = {
    q: string;
    role: string;
    status: string;
    created_from: string;
    created_to: string;
    trashed: string;
    sort: string;
    per_page: string;
};

const DEFAULT_META: PaginationMeta = {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
};

export default function AdminUsersIndex({ users, filters, roleOptions, statusOptions, sortOptions, perPageOptions }: UsersIndexProps) {
    const { t, isZh } = useTranslator('manage');
    const { delete: destroy, post } = useForm({});

    const paginationMeta: PaginationMeta = {
        current_page: users.meta?.current_page ?? users.current_page ?? DEFAULT_META.current_page,
        last_page: users.meta?.last_page ?? users.last_page ?? DEFAULT_META.last_page,
        per_page: users.meta?.per_page ?? users.per_page ?? DEFAULT_META.per_page,
        total: users.meta?.total ?? users.total ?? DEFAULT_META.total,
    };

    const paginationLinks = users.links ?? [];

    const [filterState, setFilterState] = useState<FilterState>({
        q: filters.q ?? '',
        role: filters.role ?? '',
        status: filters.status ?? '',
        created_from: filters.created_from ?? '',
        created_to: filters.created_to ?? '',
        trashed: filters.trashed ?? '',
        sort: filters.sort ?? '-created_at',
        per_page: String(filters.per_page ?? paginationMeta.per_page ?? DEFAULT_META.per_page),
    });

    useEffect(() => {
        setFilterState({
            q: filters.q ?? '',
            role: filters.role ?? '',
            status: filters.status ?? '',
            created_from: filters.created_from ?? '',
            created_to: filters.created_to ?? '',
            trashed: filters.trashed ?? '',
            sort: filters.sort ?? '-created_at',
            per_page: String(filters.per_page ?? paginationMeta.per_page ?? DEFAULT_META.per_page),
        });
    }, [filters.q, filters.role, filters.status, filters.created_from, filters.created_to, filters.trashed, filters.sort, filters.per_page, paginationMeta.per_page]);

    const manageUsersUrl = '/manage/admin/users';

    const hasActiveFilters = useMemo(() => {
        const { q, role, status, created_from, created_to, trashed } = filterState;
        return [q, role, status, created_from, created_to, trashed].some((value) => value !== '');
    }, [filterState]);

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilterState((prev) => ({ ...prev, [key]: value }));
    };

    const buildQuery = (overrides: Partial<Record<keyof FilterState, string>> = {}) => {
        const query: Record<string, string> = {};

        Object.entries({ ...filterState, ...overrides }).forEach(([key, value]) => {
            if (value !== '') {
                query[key] = value;
            }
        });

        return query;
    };

    const applyFilters = (event?: FormEvent) => {
        event?.preventDefault();
        router.get(manageUsersUrl, buildQuery(), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const defaults: FilterState = {
            q: '',
            role: '',
            status: '',
            created_from: '',
            created_to: '',
            trashed: '',
            sort: '-created_at',
            per_page: String(paginationMeta.per_page ?? DEFAULT_META.per_page),
        };
        setFilterState(defaults);
        router.get(manageUsersUrl, { sort: defaults.sort, per_page: defaults.per_page }, {
            preserveScroll: true,
            replace: true,
        });
    };

    const handleDestroy = (user: UserRecord) => {
        if (confirm(isZh ? `確認刪除使用者「${user.name}」？` : `Delete user "${user.name}"?`)) {
            destroy(`${manageUsersUrl}/${user.id}`, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleRestore = (user: UserRecord) => {
        post(`${manageUsersUrl}/${user.id}/restore`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatRole = (role: UserRecord['role']) => {
        if (role === 'admin') return isZh ? '管理員' : 'Admin';
        if (role === 'teacher') return isZh ? '教師' : 'Teacher';
        return isZh ? '使用者' : 'User';
    };

    const formatStatus = (status: UserRecord['status']) => (status === 'active' ? (isZh ? '啟用' : 'Active') : isZh ? '停用' : 'Suspended');

    const formatDateTime = (value?: string | null) => {
        if (!value) return '-';
        return new Date(value).toLocaleString(isZh ? 'zh-TW' : 'en-US');
    };

    const breadcrumbs = [
        { title: t('layout.breadcrumbs.dashboard', isZh ? '管理首頁' : 'Management'), href: '/manage/dashboard' },
        { title: t('sidebar.admin.users', isZh ? '使用者管理' : 'User management'), href: manageUsersUrl },
    ];

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <Head title={t('users.index.title', isZh ? '使用者管理' : 'User management')} />

            <section className="space-y-6 px-4 py-8 sm:px-6 lg:px-0">
                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardContent className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-[#151f54]">
                                {t('users.index.title', isZh ? '使用者管理' : 'User management')}
                            </h1>
                            <p className="text-sm text-neutral-600">
                                {t(
                                    'users.index.description',
                                    isZh
                                        ? '檢視與管理所有後台帳號，掌握角色與啟用狀態。'
                                        : 'Review and manage back-office accounts, roles, and statuses.',
                                )}
                            </p>
                        </div>
                        <Button asChild className="rounded-full bg-[#151f54] text-white hover:bg-[#1f2a6d]">
                            <Link href="/manage/admin/users/create">
                                <UserPlus2 className="mr-2 h-4 w-4" />
                                {t('users.index.actions.create', isZh ? '新增使用者' : 'Create user')}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold text-[#151f54]">
                            {t('users.index.filters.title', isZh ? '篩選條件' : 'Filters')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyFilters} className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                            <div className="lg:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="user-search">
                                    {t('users.index.filters.search', isZh ? '搜尋使用者' : 'Search users')}
                                </label>
                                <Input
                                    id="user-search"
                                    type="search"
                                    placeholder={t('users.index.filters.search_placeholder', isZh ? '輸入姓名或 Email' : 'Name or email')}
                                    value={filterState.q}
                                    onChange={(event) => handleFilterChange('q', event.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="user-role">
                                    {t('users.index.filters.role', isZh ? '角色' : 'Role')}
                                </label>
                                <Select
                                    id="user-role"
                                    value={filterState.role}
                                    onChange={(event) => handleFilterChange('role', event.target.value)}
                                >
                                    <option value="">{t('users.index.filters.role_all', isZh ? '全部角色' : 'All roles')}</option>
                                    {roleOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="user-status">
                                    {t('users.index.filters.status', isZh ? '狀態' : 'Status')}
                                </label>
                                <Select
                                    id="user-status"
                                    value={filterState.status}
                                    onChange={(event) => handleFilterChange('status', event.target.value)}
                                >
                                    <option value="">{t('users.index.filters.status_all', isZh ? '全部狀態' : 'All statuses')}</option>
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="user-created-from">
                                    {t('users.index.filters.created_from', isZh ? '建立起始日' : 'Created from')}
                                </label>
                                <Input
                                    id="user-created-from"
                                    type="date"
                                    value={filterState.created_from}
                                    onChange={(event) => handleFilterChange('created_from', event.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="user-created-to">
                                    {t('users.index.filters.created_to', isZh ? '建立結束日' : 'Created to')}
                                </label>
                                <Input
                                    id="user-created-to"
                                    type="date"
                                    value={filterState.created_to}
                                    onChange={(event) => handleFilterChange('created_to', event.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="user-trashed">
                                    {t('users.index.filters.trashed', isZh ? '資料範圍' : 'Record scope')}
                                </label>
                                <Select
                                    id="user-trashed"
                                    value={filterState.trashed}
                                    onChange={(event) => handleFilterChange('trashed', event.target.value)}
                                >
                                    <option value="">{t('users.index.filters.trashed_active', isZh ? '僅現存帳號' : 'Active only')}</option>
                                    <option value="with">{t('users.index.filters.trashed_with', isZh ? '含已刪除' : 'Include deleted')}</option>
                                    <option value="only">{t('users.index.filters.trashed_only', isZh ? '僅已刪除' : 'Deleted only')}</option>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="user-sort">
                                    {t('users.index.filters.sort', isZh ? '排序' : 'Sort')}
                                </label>
                                <Select
                                    id="user-sort"
                                    value={filterState.sort}
                                    onChange={(event) => handleFilterChange('sort', event.target.value)}
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="user-per-page">
                                    {t('users.index.filters.per_page', isZh ? '每頁顯示' : 'Per page')}
                                </label>
                                <Select
                                    id="user-per-page"
                                    value={filterState.per_page}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        handleFilterChange('per_page', value);
                                        router.get(manageUsersUrl, buildQuery({ per_page: value }), {
                                            preserveState: true,
                                            preserveScroll: true,
                                            replace: true,
                                        });
                                    }}
                                >
                                    {perPageOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="flex items-end gap-2 lg:col-span-2">
                                <Button type="submit" className="w-full bg-[#151f54] text-white hover:bg-[#1f2a6d] sm:w-auto">
                                    {t('users.index.filters.apply', isZh ? '套用' : 'Apply')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full sm:w-auto"
                                    disabled={!hasActiveFilters}
                                    onClick={resetFilters}
                                >
                                    {t('users.index.filters.reset', isZh ? '重設' : 'Reset')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardHeader className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold text-[#151f54]">
                                {t('users.index.table.title', isZh ? '使用者列表' : 'User list')}
                            </CardTitle>
                            <p className="text-sm text-neutral-500">
                                {t(
                                    'users.index.table.summary',
                                    isZh ? `共 ${paginationMeta.total} 位帳號` : `${paginationMeta.total} accounts`,
                                    { total: paginationMeta.total },
                                )}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="overflow-hidden rounded-2xl border border-neutral-200/70">
                            <table className="min-w-full divide-y divide-neutral-200 bg-white text-sm">
                                <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">{t('users.index.table.columns.name', isZh ? '姓名' : 'Name')}</th>
                                        <th className="px-4 py-3 font-medium">{t('users.index.table.columns.email', 'Email')}</th>
                                        <th className="px-4 py-3 font-medium">{t('users.index.table.columns.role', isZh ? '角色' : 'Role')}</th>
                                        <th className="px-4 py-3 font-medium">{t('users.index.table.columns.status', isZh ? '狀態' : 'Status')}</th>
                                        <th className="px-4 py-3 font-medium">{t('users.index.table.columns.created_at', isZh ? '建立時間' : 'Created at')}</th>
                                        <th className="px-4 py-3 font-medium text-right">{t('users.index.table.columns.actions', isZh ? '操作' : 'Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 text-sm text-neutral-700">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                                                {t('users.index.table.empty', isZh ? '目前沒有符合條件的帳號。' : 'No accounts match the current filters.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user) => {
                                            const isDeleted = Boolean(user.deleted_at);
                                            const statusBadgeClass = user.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600';

                                            return (
                                                <tr key={user.id} className={cn(isDeleted && 'bg-rose-50/40 text-neutral-500')}>
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-neutral-900">
                                                                {user.name}
                                                                {isDeleted && (
                                                                    <span className="ml-2 inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-600">
                                                                        {t('users.index.badges.deleted', isZh ? '已刪除' : 'Deleted')}
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className="text-xs text-neutral-500">{user.locale ?? '—'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 align-top text-neutral-700">{user.email}</td>
                                                    <td className="px-4 py-4 align-top">
                                                        <Badge variant="outline" className="border-[#151f54]/30 text-[#151f54]">
                                                            {formatRole(user.role)}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-4 align-top">
                                                        <Badge className={statusBadgeClass}>{formatStatus(user.status)}</Badge>
                                                    </td>
                                                    <td className="px-4 py-4 align-top text-neutral-600">{formatDateTime(user.created_at)}</td>
                                                    <td className="px-4 py-4 align-top">
                                                        <div className="flex justify-end gap-2">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Link
                                                                        href={`${manageUsersUrl}/${user.id}/edit`}
                                                                        className="inline-flex items-center justify-center rounded-full border border-blue-100 bg-white p-2 text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
                                                                    >
                                                                        <Edit3 className="h-4 w-4" />
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {t('users.index.actions.edit', isZh ? '編輯' : 'Edit')}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                            {isDeleted ? (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRestore(user)}
                                                                            className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white p-2 text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-50"
                                                                        >
                                                                            <RotateCcw className="h-4 w-4" />
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {t('users.index.actions.restore', isZh ? '還原帳號' : 'Restore user')}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            ) : (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDestroy(user)}
                                                                            className="inline-flex items-center justify-center rounded-full border border-rose-100 bg-white p-2 text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {t('users.index.actions.delete', isZh ? '刪除帳號' : 'Delete user')}
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
                            <div className="flex flex-col gap-4 pt-2 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
                                <div>
                                    {t(
                                        'users.index.pagination.summary',
                                        isZh
                                            ? `第 ${paginationMeta.current_page} / ${paginationMeta.last_page} 頁`
                                            : `Page ${paginationMeta.current_page} of ${paginationMeta.last_page}`,
                                        { current: paginationMeta.current_page, last: paginationMeta.last_page },
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {paginationLinks.map((link, index) => {
                                        const label = link.label.replace(/&laquo;|&raquo;/g, (match) => (match === '&laquo;' ? '«' : '»'));

                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={`${label}-${index}`}
                                                    className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-neutral-200 px-2 text-sm text-neutral-400"
                                                >
                                                    {label}
                                                </span>
                                            );
                                        }

                                        return (
                                            <button
                                                type="button"
                                                key={`${label}-${index}`}
                                                onClick={() =>
                                                    router.visit(link.url as string, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                        replace: true,
                                                    })
                                                }
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

