import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useInitials } from '@/hooks/use-initials';
import { Link } from '@inertiajs/react';
import { Edit, RotateCcw, ShieldAlert, Trash2 } from 'lucide-react';
import { type ComponentProps } from 'react';

export interface ManageUserRecord {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'user';
    status: 'active' | 'suspended';
    locale?: string | null;
    avatar?: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

interface UserTableProps {
    users: ManageUserRecord[];
    isZh: boolean;
    localeKey: 'zh-TW' | 'en';
    t: (key: string, fallback?: string, replacements?: Record<string, string | number>) => string;
    onDelete: (user: ManageUserRecord) => void;
    onRestore: (user: ManageUserRecord) => void;
}

const roleLabelFallback: Record<ManageUserRecord['role'], { zh: string; en: string }> = {
    admin: { zh: '管理員', en: 'Admin' },
    teacher: { zh: '教師', en: 'Teacher' },
    user: { zh: '一般使用者', en: 'User' },
};

const statusLabelFallback: Record<ManageUserRecord['status'], { zh: string; en: string }> = {
    active: { zh: '啟用', en: 'Active' },
    suspended: { zh: '停用', en: 'Suspended' },
};

const statusBadgeVariant: Record<ManageUserRecord['status'], ComponentProps<typeof Badge>['variant']> = {
    active: 'default',
    suspended: 'secondary',
};

const formatDateTime = (value: string, locale: 'zh-TW' | 'en') =>
    new Date(value).toLocaleString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });

export default function UserTable({ users, isZh, localeKey, t, onDelete, onRestore }: UserTableProps) {
    const getInitials = useInitials();

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center">
                <ShieldAlert className="h-10 w-10 text-[#151f54]" />
                <div className="space-y-1">
                    <p className="text-lg font-semibold text-[#151f54]">
                        {t('users.index.table.empty.title', isZh ? '目前尚無使用者資料' : 'No users yet')}
                    </p>
                    <p className="text-sm text-neutral-600">
                        {t(
                            'users.index.table.empty.description',
                            isZh ? '建立第一位使用者以開始管理系統權限。' : 'Create the first user to start managing access.',
                        )}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-[#151f54]/5">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#151f54]">
                            {t('users.index.table.columns.user', isZh ? '使用者' : 'User')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#151f54]">
                            {t('users.index.table.columns.role', isZh ? '角色' : 'Role')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#151f54]">
                            {t('users.index.table.columns.status', isZh ? '狀態' : 'Status')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#151f54]">
                            {t('users.index.table.columns.email', isZh ? '電子郵件' : 'Email')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#151f54]">
                            {t('users.index.table.columns.created_at', isZh ? '建立時間' : 'Created at')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#151f54]">
                            {t('users.index.table.columns.actions', isZh ? '操作' : 'Actions')}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                    {users.map((user) => {
                        const roleLabel = t(
                            `users.roles.${user.role}`,
                            isZh ? roleLabelFallback[user.role].zh : roleLabelFallback[user.role].en,
                        );
                        const statusLabel = t(
                            `users.status.${user.status}`,
                            isZh ? statusLabelFallback[user.status].zh : statusLabelFallback[user.status].en,
                        );
                        const verifiedLabel = user.email_verified_at
                            ? t('users.index.table.email_verified', isZh ? '已驗證' : 'Verified')
                            : t('users.index.table.email_unverified', isZh ? '未驗證' : 'Unverified');

                        return (
                            <tr
                                key={user.id}
                                className={cn(user.deleted_at ? 'bg-rose-50/60 text-neutral-500' : 'bg-white text-neutral-700')}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                                            <AvatarFallback className="bg-[#151f54]/10 text-sm font-semibold text-[#151f54]">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-[#151f54]">{user.name}</span>
                                            <span className="text-xs text-neutral-500">ID #{user.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className="border-[#151f54]/30 text-[#151f54]">
                                        {roleLabel}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={statusBadgeVariant[user.status]} className="capitalize">
                                            {statusLabel}
                                        </Badge>
                                        <span
                                            className={cn(
                                                'rounded-full px-2 py-0.5 text-xs',
                                                user.email_verified_at
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-amber-100 text-amber-700',
                                            )}
                                        >
                                            {verifiedLabel}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col text-sm text-neutral-600">
                                        <span>{user.email}</span>
                                        {user.locale && (
                                            <span className="text-xs text-neutral-400">
                                                {t('users.index.table.locale', isZh ? '語系' : 'Locale')}: {user.locale}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-neutral-600">
                                    {formatDateTime(user.created_at, localeKey)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        {!user.deleted_at && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="sm"
                                                        className="rounded-full text-[#151f54] hover:bg-[#151f54]/10"
                                                    >
                                                        <Link href={`/manage/admin/users/${user.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {t('users.index.table.actions.edit', isZh ? '編輯' : 'Edit')}
                                                </TooltipContent>
                                            </Tooltip>
                                        )}

                                        {user.deleted_at ? (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
                                                        onClick={() => onRestore(user)}
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {t('users.index.table.actions.restore', isZh ? '還原' : 'Restore')}
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="rounded-full text-rose-600 hover:bg-rose-50"
                                                        onClick={() => onDelete(user)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {t('users.index.table.actions.delete', isZh ? '刪除' : 'Delete')}
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
    );
}
