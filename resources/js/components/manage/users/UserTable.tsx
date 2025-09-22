import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { useMemo } from 'react';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { CircleCheck, CirclePause, Trash2 } from 'lucide-react';

export interface UserRow {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'user';
    status: 'active' | 'suspended';
    avatar?: string | null;
    email_verified_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface UserTableProps {
    data: UserRow[];
    meta: PaginationMeta;
    links: PaginationLink[];
    selected: number[];
    onSelect: (userId: number, checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
    onToggleStatus: (user: UserRow) => void;
    onDelete: (user: UserRow) => void;
    canManage: boolean;
    authUserId: number;
}

const roleLabels: Record<UserRow['role'], string> = {
    admin: '管理員',
    teacher: '教師',
    user: '一般會員',
};

const statusBadge: Record<UserRow['status'], { label: string; variant: 'default' | 'outline'; icon: typeof CircleCheck }> = {
    active: { label: '啟用', variant: 'default', icon: CircleCheck },
    suspended: { label: '停用', variant: 'outline', icon: CirclePause },
};

const formatDateTime = (value?: string | null) => {
    if (!value) {
        return '—';
    }

    try {
        return new Date(value).toLocaleString('zh-TW', {
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
    canManage,
    authUserId,
}: UserTableProps) {
    const allIds = useMemo(() => data.map((user) => user.id), [data]);

    const isAllSelected = allIds.length > 0 && allIds.every((id) => selected.includes(id));
    const isIndeterminate = selected.length > 0 && !isAllSelected;

    const handleSelectAll = (value: CheckedState) => {
        onSelectAll(value === true);
    };

    const handleSelect = (userId: number) => (value: CheckedState) => {
        onSelect(userId, value === true);
    };

    if (data.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center shadow-sm">
                <p className="text-base font-medium text-neutral-900">目前沒有符合條件的使用者</p>
                <p className="mt-2 text-sm text-neutral-500">請調整篩選條件或新增新的帳號。</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 md:block">
                <table className="min-w-full divide-y divide-neutral-100 text-sm">
                    <thead className="bg-neutral-50/60 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        <tr>
                            <th className="px-4 py-3">
                                <Checkbox
                                    checked={isAllSelected ? true : isIndeterminate ? 'indeterminate' : false}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="選取全部"
                                />
                            </th>
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
                                    <td className="px-4 py-3">
                                        <Checkbox
                                            checked={selected.includes(user.id)}
                                            onCheckedChange={handleSelect(user.id)}
                                            aria-label={`選取 ${user.name}`}
                                        />
                                    </td>
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
                                        <Badge variant="outline" className="font-medium text-neutral-700">
                                            {roleLabels[user.role]}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={statusMeta.variant}
                                            className={cn('flex items-center gap-1.5 px-3 py-1 text-xs font-semibold', {
                                                'bg-emerald-50 text-emerald-700 ring-emerald-500/20': user.status === 'active',
                                                'bg-neutral-100 text-neutral-600 ring-neutral-400/20': user.status === 'suspended',
                                            })}
                                        >
                                            <StatusIcon className="size-3.5" />
                                            {statusMeta.label}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-600">{formatDateTime(user.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onToggleStatus(user)}
                                                disabled={!canManage || disableSelfAction}
                                            >
                                                {user.status === 'active' ? '停用' : '啟用'}
                                            </Button>
                                            <Button size="sm" variant="ghost" asChild>
                                                <Link href={`/manage/users/${user.id}/edit`}>編輯</Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => onDelete(user)}
                                                disabled={!canManage || disableSelfAction}
                                            >
                                                <Trash2 className="mr-1 size-4" />
                                                刪除
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="grid gap-3 md:hidden">
                {data.map((user) => {
                    const statusMeta = statusBadge[user.status];
                    const StatusIcon = statusMeta.icon;
                    const disableSelfAction = authUserId === user.id;

                    return (
                        <div key={user.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-12">
                                        <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-base font-semibold text-neutral-900">{user.name}</p>
                                        <p className="text-xs text-neutral-500">{user.email}</p>
                                    </div>
                                </div>
                                <Checkbox
                                    checked={selected.includes(user.id)}
                                    onCheckedChange={handleSelect(user.id)}
                                    aria-label={`選取 ${user.name}`}
                                />
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                                <Badge variant="outline">{roleLabels[user.role]}</Badge>
                                <Badge
                                    variant={statusMeta.variant}
                                    className={cn('flex items-center gap-1.5 px-3 py-1', {
                                        'bg-emerald-50 text-emerald-700 ring-emerald-500/20': user.status === 'active',
                                        'bg-neutral-100 text-neutral-600 ring-neutral-400/20': user.status === 'suspended',
                                    })}
                                >
                                    <StatusIcon className="size-3.5" />
                                    {statusMeta.label}
                                </Badge>
                            </div>

                            <dl className="mt-3 grid grid-cols-1 gap-1 text-xs text-neutral-500">
                                <div className="flex items-center justify-between">
                                    <dt>建立時間</dt>
                                    <dd className="text-neutral-700">{formatDateTime(user.created_at)}</dd>
                                </div>
                            </dl>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => onToggleStatus(user)}
                                    disabled={!canManage || disableSelfAction}
                                >
                                    {user.status === 'active' ? '停用' : '啟用'}
                                </Button>
                                <Button size="sm" variant="secondary" className="flex-1" asChild>
                                    <Link href={`/manage/users/${user.id}/edit`}>編輯</Link>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => onDelete(user)}
                                    disabled={!canManage || disableSelfAction}
                                >
                                    刪除
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-600">
                <div>
                    共 <span className="font-semibold text-neutral-900">{meta.total}</span> 筆資料
                </div>
                <div className="flex items-center gap-2">
                    {links.map((link, index) => {
                        const label = link.label.replace('&laquo;', '«').replace('&raquo;', '»');
                        const isDisabled = !link.url;
                        return (
                            <Button
                                key={`${label}-${index}`}
                                size="sm"
                                variant={link.active ? 'default' : 'ghost'}
                                className={cn('min-w-[2.25rem]', {
                                    'pointer-events-none opacity-40': isDisabled,
                                })}
                                asChild={!isDisabled}
                            >
                                {isDisabled ? (
                                    <span dangerouslySetInnerHTML={{ __html: label }} />
                                ) : (
                                    <Link href={link.url!} preserveScroll preserveState>
                                        <span dangerouslySetInnerHTML={{ __html: label }} />
                                    </Link>
                                )}
                            </Button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
