import { useMemo } from 'react';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { Download, Trash2, CircleCheck, CirclePause } from 'lucide-react';
import { Link } from '@inertiajs/react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

import type { PaginationLink, PaginationMeta, UserRole, UserRow } from './user-types';

interface UserTableProps {
    data: UserRow[];
    meta: PaginationMeta;
    links?: PaginationLink[] | Record<string, unknown> | null;
    selected: number[];
    onSelect: (userId: number, checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
    onToggleStatus: (user: UserRow) => void;
    onDelete: (user: UserRow) => void;
    onBulkDelete: () => void;
    onExport: () => void;
    bulkProcessing: boolean;
    canManage: boolean;
    authUserId: number;
    locale: string;
}

const roleLabels: Record<UserRole, string> = {
    admin: '管理員',
    teacher: '教師',
    user: '一般會員',
};

const statusBadge: Record<UserRow['status'], { label: string; variant: 'default' | 'outline'; icon: typeof CircleCheck }> = {
    active: { label: '啟用', variant: 'default', icon: CircleCheck },
    suspended: { label: '停用', variant: 'outline', icon: CirclePause },
};

const formatDateTime = (value: string | null | undefined, locale: string) => {
    if (!value) {
        return '—';
    }

    try {
        return new Date(value).toLocaleString(locale, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    } catch (error) {
        return value;
    }
};

const getInitials = (name: string) => {
    const trimmed = name.trim();
    if (trimmed === '') {
        return 'U';
    }

    return trimmed
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
};

export default function UserTable({
    data,
    meta,
    links,
    selected,
    onSelect,
    onSelectAll,
    onToggleStatus,
    onDelete,
    onBulkDelete,
    onExport,
    bulkProcessing,
    canManage,
    authUserId,
    locale,
}: UserTableProps) {
    const allIds = useMemo(() => data.map((user) => user.id), [data]);

    const paginationLinks = Array.isArray(links)
        ? links
        : Array.isArray(meta.links)
            ? meta.links
            : [];

    const isAllSelected = allIds.length > 0 && allIds.every((id) => selected.includes(id));
    const isIndeterminate = selected.length > 0 && !isAllSelected;
    const selectedCount = selected.length;

    const handleSelectAll = (value: CheckedState) => {
        onSelectAll(value === true);
    };

    const handleSelect = (userId: number) => (value: CheckedState) => {
        onSelect(userId, value === true);
    };

    return (
        <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-col gap-4 border-b border-slate-100 pb-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">使用者列表</CardTitle>
                    <CardDescription>共 {meta.total} 筆資料</CardDescription>
                    {selectedCount > 0 && (
                        <p className="mt-1 text-sm text-slate-600">已選取 {selectedCount} 位使用者</p>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" onClick={onExport}>
                        <Download className="mr-2 h-4 w-4" /> 匯出 CSV
                    </Button>
                    {canManage && (
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={selectedCount === 0 || bulkProcessing}
                            onClick={onBulkDelete}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> 刪除選取
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {data.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 p-10 text-center">
                        <p className="text-base font-medium text-neutral-900">目前沒有符合條件的使用者</p>
                        <p className="mt-2 text-sm text-neutral-500">請調整篩選條件或建立新的帳號。</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-hidden rounded-2xl ring-1 ring-black/5 xl:block">
                            <table className="min-w-full divide-y divide-neutral-100 text-sm">
                                <thead className="bg-neutral-50/60 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    <tr>
                                        {canManage && (
                                            <th className="px-4 py-3">
                                                <Checkbox
                                                    checked={isAllSelected ? true : isIndeterminate ? 'indeterminate' : false}
                                                    onCheckedChange={handleSelectAll}
                                                    aria-label="選取全部"
                                                />
                                            </th>
                                        )}
                                        <th className="px-4 py-3 text-neutral-600">使用者</th>
                                        <th className="px-4 py-3 text-neutral-600">角色</th>
                                        <th className="px-4 py-3 text-neutral-600">狀態</th>
                                        <th className="px-4 py-3 text-neutral-600">建立時間</th>
                                        <th className="px-4 py-3 text-neutral-600">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 bg-white">
                                    {data.map((user) => {
                                        const statusMeta = statusBadge[user.status];
                                        const StatusIcon = statusMeta.icon;
                                        const disableSelfAction = authUserId === user.id;

                                        return (
                                            <tr key={user.id} className="hover:bg-neutral-50/60">
                                                {canManage && (
                                                    <td className="px-4 py-3">
                                                        <Checkbox
                                                            checked={selected.includes(user.id)}
                                                            onCheckedChange={handleSelect(user.id)}
                                                            aria-label={`選取 ${user.name}`}
                                                        />
                                                    </td>
                                                )}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-10">
                                                            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-neutral-900">{user.name}</span>
                                                            <span className="text-xs text-neutral-500">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {user.roles.length === 0 ? (
                                                        <span className="text-sm text-neutral-400">—</span>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {user.roles.map((role) => (
                                                                <Badge
                                                                    key={`${user.id}-role-${role}`}
                                                                    variant="outline"
                                                                    className="border-primary/30 bg-primary/5 text-primary"
                                                                >
                                                                    {roleLabels[role] ?? role}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={statusMeta.variant} className="flex items-center gap-1">
                                                        <StatusIcon className="h-3.5 w-3.5" />
                                                        {statusMeta.label}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-neutral-500">
                                                    {formatDateTime(user.created_at ?? null, locale)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Link
                                                            href={`/manage/users/${user.id}/edit`}
                                                            className={cn(
                                                                'text-sm font-medium text-primary transition hover:text-primary/80',
                                                                disableSelfAction && 'cursor-not-allowed opacity-40',
                                                            )}
                                                            onClick={(event) => {
                                                                if (disableSelfAction) {
                                                                    event.preventDefault();
                                                                }
                                                            }}
                                                        >
                                                            編輯
                                                        </Link>
                                                        {canManage && (
                                                            <button
                                                                type="button"
                                                                className="text-sm font-medium text-destructive transition hover:text-destructive/80"
                                                                onClick={() => onToggleStatus(user)}
                                                                disabled={disableSelfAction}
                                                            >
                                                                {user.status === 'active' ? '停用' : '啟用'}
                                                            </button>
                                                        )}
                                                        {canManage && (
                                                            <button
                                                                type="button"
                                                                className="text-sm font-medium text-destructive transition hover:text-destructive/80"
                                                                onClick={() => onDelete(user)}
                                                                disabled={disableSelfAction}
                                                            >
                                                                刪除
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-3 xl:hidden">
                            {data.map((user) => {
                                const statusMeta = statusBadge[user.status];
                                const StatusIcon = statusMeta.icon;
                                const disableSelfAction = authUserId === user.id;

                                return (
                                    <div
                                        key={`mobile-${user.id}`}
                                        className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-12">
                                                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-neutral-900">{user.name}</p>
                                                <p className="text-xs text-neutral-500">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {user.roles.map((role) => (
                                                <Badge
                                                    key={`${user.id}-mobile-role-${role}`}
                                                    variant="outline"
                                                    className="border-primary/30 bg-primary/5 text-primary"
                                                >
                                                    {roleLabels[role] ?? role}
                                                </Badge>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                                            <StatusIcon className="h-3.5 w-3.5 text-primary" />
                                            {statusMeta.label}
                                            <span className="mx-2 h-1 w-1 rounded-full bg-neutral-300" />
                                            {formatDateTime(user.created_at ?? null, locale)}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            {canManage && (
                                                <Checkbox
                                                    checked={selected.includes(user.id)}
                                                    onCheckedChange={handleSelect(user.id)}
                                                    aria-label={`選取 ${user.name}`}
                                                />
                                            )}
                                            <Link
                                                href={`/manage/users/${user.id}/edit`}
                                                className={cn(
                                                    'text-sm font-medium text-primary transition hover:text-primary/80',
                                                    disableSelfAction && 'cursor-not-allowed opacity-40',
                                                )}
                                                onClick={(event) => {
                                                    if (disableSelfAction) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                            >
                                                編輯
                                            </Link>
                                            {canManage && (
                                                <button
                                                    type="button"
                                                    className="text-sm font-medium text-destructive transition hover:text-destructive/80"
                                                    onClick={() => onToggleStatus(user)}
                                                    disabled={disableSelfAction}
                                                >
                                                    {user.status === 'active' ? '停用' : '啟用'}
                                                </button>
                                            )}
                                            {canManage && (
                                                <button
                                                    type="button"
                                                    className="text-sm font-medium text-destructive transition hover:text-destructive/80"
                                                    onClick={() => onDelete(user)}
                                                    disabled={disableSelfAction}
                                                >
                                                    刪除
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {paginationLinks.length > 0 && (
                            <nav className="flex justify-end">
                                <ul className="inline-flex items-center gap-1 text-sm text-neutral-600">
                                    {paginationLinks.map((link, index) => (
                                        <li key={`pagination-${index}`}>
                                            {link.url ? (
                                                <Link
                                                    href={link.url}
                                                    className={cn(
                                                        'rounded-full px-3 py-1 transition hover:bg-primary/10 hover:text-primary',
                                                        link.active && 'bg-primary text-white hover:bg-primary/90 hover:text-white',
                                                    )}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <span className="rounded-full px-3 py-1 text-neutral-400" dangerouslySetInnerHTML={{ __html: link.label }} />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
