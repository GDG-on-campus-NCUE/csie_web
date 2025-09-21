import UserTable, { type ManageUserRecord } from '@/components/manage/users/user-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useTranslator } from '@/hooks/use-translator';
import ManageLayout from '@/layouts/manage/manage-layout';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface UsersIndexProps {
    users: {
        data: ManageUserRecord[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        meta?: PaginationMeta;
        current_page?: number;
        last_page?: number;
        per_page?: number;
        total?: number;
    };
    filters?: {
        search?: string;
        role?: string;
        status?: string;
        per_page?: number;
    };
    roleOptions?: SelectOption[];
    statusOptions?: SelectOption[];
    perPageOptions?: number[];
}

type FilterState = {
    search: string;
    role: string;
    status: string;
    per_page: string;
};

const DEFAULT_PAGINATION_META: PaginationMeta = {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
};

const sanitizeLabel = (label: string) =>
    label
        .replace(/<[^>]+>/g, '')
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&nbsp;/g, ' ');

const resolvePaginationLabel = (
    label: string,
    t: (key: string, fallback?: string) => string,
    isZh: boolean,
) => {
    if (/previous/i.test(label)) {
        const arrow = label.includes('«') ? '« ' : '';
        return `${arrow}${t('users.index.pagination.previous', isZh ? '上一頁' : 'Previous')}`;
    }

    if (/next/i.test(label)) {
        const arrow = label.includes('»') ? ' »' : '';
        return `${t('users.index.pagination.next', isZh ? '下一頁' : 'Next')}${arrow}`;
    }

    return label;
};

export default function UsersIndex({
    users,
    filters = {},
    roleOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'teacher', label: 'Teacher' },
        { value: 'user', label: 'User' },
    ],
    statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'suspended', label: 'Suspended' },
    ],
    perPageOptions = [],
}: UsersIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const { t, isZh, localeKey } = useTranslator('manage');
    const role = auth?.user?.role ?? 'user';

    const usersIndexUrl = '/manage/admin/users';

    const { delete: destroy, post } = useForm({});

    const usersData = users?.data ?? [];
    const paginationMeta: PaginationMeta = {
        current_page: users?.meta?.current_page ?? users?.current_page ?? DEFAULT_PAGINATION_META.current_page,
        last_page: users?.meta?.last_page ?? users?.last_page ?? DEFAULT_PAGINATION_META.last_page,
        per_page: users?.meta?.per_page ?? users?.per_page ?? DEFAULT_PAGINATION_META.per_page,
        total: users?.meta?.total ?? users?.total ?? DEFAULT_PAGINATION_META.total,
    };
    const paginationLinks = users?.links ?? [];
    const resolvedPerPageOptions = perPageOptions.length > 0 ? perPageOptions : [10, 20, 50];

    const [filterState, setFilterState] = useState<FilterState>({
        search: filters.search ?? '',
        role: filters.role ?? '',
        status: filters.status ?? '',
        per_page: String(filters.per_page ?? paginationMeta.per_page ?? DEFAULT_PAGINATION_META.per_page),
    });

    useEffect(() => {
        setFilterState({
            search: filters.search ?? '',
            role: filters.role ?? '',
            status: filters.status ?? '',
            per_page: String(filters.per_page ?? paginationMeta.per_page ?? DEFAULT_PAGINATION_META.per_page),
        });
    }, [filters.search, filters.role, filters.status, filters.per_page, paginationMeta.per_page]);

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilterState((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    const buildFilterQuery = (overrides: Record<string, string | number> = {}) => {
        const query: Record<string, string | number> = {};

        Object.entries(filterState).forEach(([key, value]) => {
            if (value !== '') {
                query[key] = value;
            }
        });

        Object.entries(overrides).forEach(([key, value]) => {
            if (value !== '' && value !== undefined && value !== null) {
                query[key] = value;
            }
        });

        return query;
    };

    const applyFilters = (event?: FormEvent) => {
        event?.preventDefault();
        router.get(usersIndexUrl, buildFilterQuery(), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const resetState: FilterState = {
            search: '',
            role: '',
            status: '',
            per_page: String(paginationMeta.per_page ?? DEFAULT_PAGINATION_META.per_page),
        };
        setFilterState(resetState);
        router.get(usersIndexUrl, { per_page: resetState.per_page }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const hasActiveFilters = useMemo(() => {
        const { search, role: roleFilter, status } = filterState;
        return [search, roleFilter, status].some((value) => value !== '');
    }, [filterState]);

    const handleDelete = (user: ManageUserRecord) => {
        if (
            confirm(
                t(
                    'users.index.dialogs.delete_confirm',
                    isZh ? `確定要停用並刪除「${user.name}」？` : `Delete user "${user.name}"?`,
                    { name: user.name },
                ),
            )
        ) {
            destroy(`${usersIndexUrl}/${user.id}`, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const handleRestore = (user: ManageUserRecord) => {
        post(`${usersIndexUrl}/${user.id}/restore`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const breadcrumbs = [
        { title: t('layout.breadcrumbs.dashboard', isZh ? '管理首頁' : 'Management'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.users', isZh ? '使用者管理' : 'Users'), href: usersIndexUrl },
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
                            <p className="text-sm text-slate-600">
                                {t(
                                    'users.index.description',
                                    isZh
                                        ? '檢視系統帳號、調整角色權限並快速回復已刪除的使用者。'
                                        : 'Review accounts, adjust roles, and recover deleted users with ease.',
                                )}
                            </p>
                        </div>

                        {role === 'admin' && (
                            <Button asChild className="rounded-full bg-[#151f54] px-6 text-white shadow-sm hover:bg-[#1f2a6d]">
                                <Link href="/manage/admin/users/create">
                                    {t('users.index.actions.create', isZh ? '新增使用者' : 'New user')}
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold text-[#151f54]">
                            {t('users.index.filters.title', isZh ? '篩選條件' : 'Filters')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={applyFilters}
                            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6"
                        >
                            <div className="xl:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="user-search">
                                    {t('users.index.filters.search', isZh ? '搜尋姓名或信箱' : 'Search name or email')}
                                </label>
                                <Input
                                    id="user-search"
                                    type="search"
                                    value={filterState.search}
                                    onChange={(event) => handleFilterChange('search', event.target.value)}
                                    placeholder={t('users.index.filters.search_placeholder', isZh ? '輸入關鍵字' : 'Keyword')}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="user-role-filter">
                                    {t('users.index.filters.role', isZh ? '角色' : 'Role')}
                                </label>
                                <Select
                                    id="user-role-filter"
                                    value={filterState.role}
                                    onChange={(event) => handleFilterChange('role', event.target.value)}
                                >
                                    <option value="">
                                        {t('users.index.filters.role_all', isZh ? '全部角色' : 'All roles')}
                                    </option>
                                    {roleOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {t(`users.roles.${option.value}`, option.label)}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="user-status-filter">
                                    {t('users.index.filters.status', isZh ? '狀態' : 'Status')}
                                </label>
                                <Select
                                    id="user-status-filter"
                                    value={filterState.status}
                                    onChange={(event) => handleFilterChange('status', event.target.value)}
                                >
                                    <option value="">
                                        {t('users.index.filters.status_all', isZh ? '全部狀態' : 'All statuses')}
                                    </option>
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {t(`users.status.${option.value}`, option.label)}
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
                                    onChange={(event) => handleFilterChange('per_page', event.target.value)}
                                >
                                    {resolvedPerPageOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="flex items-end gap-3 xl:col-span-2 xl:justify-end">
                                <Button type="submit" className="rounded-full bg-[#151f54] px-6 text-white hover:bg-[#1f2a6d]">
                                    {t('users.index.filters.apply', isZh ? '套用篩選' : 'Apply filters')}
                                </Button>
                                {hasActiveFilters && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-full border-[#151f54]/20 text-[#151f54]"
                                        onClick={resetFilters}
                                    >
                                        {t('users.index.filters.reset', isZh ? '清除條件' : 'Reset')}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold text-[#151f54]">
                            {t('users.index.table.title', isZh ? '使用者列表' : 'User list')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <UserTable
                            users={usersData}
                            isZh={isZh}
                            localeKey={localeKey}
                            t={t}
                            onDelete={handleDelete}
                            onRestore={handleRestore}
                        />

                        {paginationLinks.length > 0 && (
                            <div className="flex flex-col gap-2 border-t border-neutral-100 pt-4 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                                    <span>
                                        {t(
                                            'users.index.pagination.summary',
                                            isZh
                                                ? `第 ${paginationMeta.current_page} / ${paginationMeta.last_page} 頁`
                                                : `Page ${paginationMeta.current_page} of ${paginationMeta.last_page}`,
                                            {
                                                current: paginationMeta.current_page,
                                                last: paginationMeta.last_page,
                                            },
                                        )}
                                    </span>
                                    <span className="text-xs text-neutral-400 sm:text-sm">
                                        {t(
                                            'users.index.pagination.total',
                                            isZh
                                                ? `共 ${paginationMeta.total} 位使用者`
                                                : `${paginationMeta.total} users in total`,
                                            { total: paginationMeta.total },
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {paginationLinks.map((link, index) => {
                                        const rawLabel = sanitizeLabel(link.label);
                                        const label = resolvePaginationLabel(rawLabel, t, isZh);

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
                                                onClick={() => router.visit(link.url as string, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    replace: true,
                                                })}
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
