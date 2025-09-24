import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';
import UserTable, { type PaginationLink, type PaginationMeta, type UserRow } from '@/components/manage/users/UserTable';

interface OptionItem {
    value: string;
    label: string;
}

interface UsersIndexProps {
    users: {
        data: UserRow[];
        meta: PaginationMeta;
        links?: PaginationLink[] | Record<string, unknown> | null;
    };
    filters: Partial<Record<'q' | 'role' | 'status' | 'created_from' | 'created_to' | 'sort' | 'per_page', string>>;
    roleOptions: OptionItem[];
    statusOptions: OptionItem[];
    sortOptions: OptionItem[];
    perPageOptions: number[];
    can: {
        create: boolean;
        manage: boolean;
    };
    authUserId: number;
}

type FilterState = {
    q: string;
    role: string;
    status: string;
    created_from: string;
    created_to: string;
    sort: string;
    per_page: string;
};

const buildQueryFromFilters = (filters: FilterState) => {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '')
    );
};

export default function UsersIndex({
    users,
    filters,
    roleOptions,
    statusOptions,
    sortOptions,
    perPageOptions,
    can,
    authUserId,
}: UsersIndexProps) {
    const defaultSort = sortOptions[0]?.value ?? '-created_at';
    const defaultPerPage = String(perPageOptions[0] ?? 15);

    const paginationLinks = Array.isArray(users.links)
        ? users.links
        : Array.isArray(users.meta.links)
            ? users.meta.links
            : [];

    const [filterState, setFilterState] = useState<FilterState>({
        q: filters.q ?? '',
        role: filters.role ?? '',
        status: filters.status ?? '',
        created_from: filters.created_from ?? '',
        created_to: filters.created_to ?? '',
        sort: filters.sort ?? defaultSort,
        per_page: filters.per_page ?? defaultPerPage,
    } as FilterState);

    const [selected, setSelected] = useState<number[]>([]);

    const bulkForm = useForm({
        action: 'delete' as 'delete',
        ids: [] as number[],
    });

    useEffect(() => {
        setSelected((previous) => previous.filter((id) => users.data.some((user) => user.id === id)));
    }, [users.data]);

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: '管理首頁', href: '/manage/dashboard' },
            { title: '使用者管理', href: '/manage/users' },
        ],
        []
    );

    const applyFilters = (event?: React.FormEvent<HTMLFormElement>) => {
        event?.preventDefault();

        const query = buildQueryFromFilters(filterState);

        router.get('/manage/users', query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        const resetState: FilterState = {
            q: '',
            role: '',
            status: '',
            created_from: '',
            created_to: '',
            sort: defaultSort,
            per_page: defaultPerPage,
        };

        setFilterState(resetState);

        router.get(
            '/manage/users',
            { sort: defaultSort, per_page: defaultPerPage },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSelect = (userId: number, checked: boolean) => {
        setSelected((previous) => {
            if (checked) {
                return Array.from(new Set([...previous, userId]));
            }

            return previous.filter((id) => id !== userId);
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelected(users.data.map((user) => user.id));
        } else {
            setSelected([]);
        }
    };

    const handleToggleStatus = (user: UserRow) => {
        if (!can.manage || user.id === authUserId) {
            return;
        }

        const nextStatus = user.status === 'active' ? 'suspended' : 'active';

        router.put(
            `/manage/users/${user.id}`,
            {
                name: user.name,
                email: user.email,
                role: user.role,
                status: nextStatus,
                password: null,
                password_confirmation: null,
                email_verified: Boolean(user.email_verified_at),
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleDelete = (user: UserRow) => {
        if (!can.manage || user.id === authUserId) {
            return;
        }

        if (!window.confirm(`確定要刪除「${user.name}」嗎？`)) {
            return;
        }

        router.delete(`/manage/users/${user.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setSelected((previous) => previous.filter((id) => id !== user.id));
            },
        });
    };

    const handleBulkDelete = () => {
        if (selected.length === 0 || bulkForm.processing || !can.manage) {
            return;
        }

        if (!window.confirm(`確定要刪除選取的 ${selected.length} 筆帳號嗎？`)) {
            return;
        }

        bulkForm.setData('action', 'delete');
        bulkForm.setData('ids', selected);

        bulkForm.post('/manage/users/bulk', {
            preserveScroll: true,
            onSuccess: () => {
                setSelected([]);
                bulkForm.reset();
            },
        });
    };

    const handleExport = () => {
        const params = new URLSearchParams();

        if (selected.length > 0) {
            selected.forEach((id) => params.append('ids[]', String(id)));
        } else {
            const currentFilters = buildQueryFromFilters(filterState);
            Object.entries(currentFilters).forEach(([key, value]) => params.append(key, value));
        }

        if (!params.has('sort') && filterState.sort !== '') {
            params.set('sort', filterState.sort);
        }

        const exportUrl = params.toString()
            ? `/manage/users/export?${params.toString()}`
            : '/manage/users/export';

        window.open(exportUrl, '_blank', 'noopener');
    };

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title="使用者管理" />

            <ManagePageHeader
                title="使用者管理"
                description="檢視、搜尋與管理平台帳號，支援角色分配、狀態切換與批次操作。"
                actions={
                    can.create ? (
                        <Button asChild className="rounded-full px-4 py-2">
                            <Link href="/manage/users/create">新增使用者</Link>
                        </Button>
                    ) : null
                }
            />

            <section className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
                <span>
                    共有 <span className="font-semibold text-neutral-900">{users.meta.total}</span> 位使用者
                </span>
                {selected.length > 0 && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-600">
                        已選取 {selected.length} 筆
                    </span>
                )}
            </section>

            <Card className="border-none shadow-sm ring-1 ring-black/5">
                <CardHeader className="flex flex-col gap-1">
                    <CardTitle className="text-base font-semibold text-neutral-900">篩選條件</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={applyFilters} className="grid gap-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="q" className="text-sm font-medium text-neutral-700">
                                    關鍵字
                                </label>
                                <Input
                                    id="q"
                                    value={filterState.q}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, q: event.target.value }))}
                                    placeholder="輸入姓名或電子郵件"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="role" className="text-sm font-medium text-neutral-700">
                                    角色
                                </label>
                                <Select
                                    id="role"
                                    value={filterState.role}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, role: event.target.value }))}
                                >
                                    <option value="">全部角色</option>
                                    {roleOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="status" className="text-sm font-medium text-neutral-700">
                                    狀態
                                </label>
                                <Select
                                    id="status"
                                    value={filterState.status}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, status: event.target.value }))}
                                >
                                    <option value="">全部狀態</option>
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="created_from" className="text-sm font-medium text-neutral-700">
                                    建立日期（起）
                                </label>
                                <Input
                                    id="created_from"
                                    type="date"
                                    value={filterState.created_from}
                                    onChange={(event) =>
                                        setFilterState((prev) => ({ ...prev, created_from: event.target.value }))
                                    }
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="created_to" className="text-sm font-medium text-neutral-700">
                                    建立日期（迄）
                                </label>
                                <Input
                                    id="created_to"
                                    type="date"
                                    value={filterState.created_to}
                                    onChange={(event) =>
                                        setFilterState((prev) => ({ ...prev, created_to: event.target.value }))
                                    }
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="sort" className="text-sm font-medium text-neutral-700">
                                    排序
                                </label>
                                <Select
                                    id="sort"
                                    value={filterState.sort}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, sort: event.target.value }))}
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="per_page" className="text-sm font-medium text-neutral-700">
                                    每頁筆數
                                </label>
                                <Select
                                    id="per_page"
                                    value={filterState.per_page}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, per_page: event.target.value }))}
                                >
                                    {perPageOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option} 筆
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-neutral-500">
                                變更條件後請點擊「套用篩選」，若需重置條件請使用重設按鈕。
                            </p>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="ghost" onClick={resetFilters}>
                                    重設
                                </Button>
                                <Button type="submit">套用篩選</Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <section className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={handleExport}
                    >
                        匯出
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={handleBulkDelete}
                        disabled={selected.length === 0 || !can.manage || bulkForm.processing}
                    >
                        批次刪除
                    </Button>
                </div>
                <p className="text-xs text-neutral-400">
                    匯出將依照目前篩選條件產出 CSV 檔案，若未選取資料則匯出整個列表。
                </p>
            </section>

            <UserTable
                data={users.data}
                meta={users.meta}
                links={paginationLinks}
                selected={selected}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                canManage={can.manage}
                authUserId={authUserId}
            />
        </ManageLayout>
    );
}
