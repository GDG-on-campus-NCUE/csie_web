import { useEffect, useMemo, useRef, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import ManageToolbar from '@/components/manage/manage-toolbar';
import {
    manageFilterControlClass,
    manageToolbarPrimaryButtonClass,
    manageToolbarSecondaryButtonClass,
} from '@/components/manage/filter-styles';
import ResponsiveDataView from '@/components/manage/responsive-data-view';
import DataCard, { type DataCardStatusTone } from '@/components/manage/data-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TableEmpty from '@/components/manage/table-empty';
import ActivityTimeline from '@/components/manage/activity-timeline';
import ToastContainer from '@/components/ui/toast-container';
import { useTranslator } from '@/hooks/use-translator';
import useToast from '@/hooks/use-toast';
import { formatDateTime } from '@/lib/shared/format';
import { apiClient, isManageApiError } from '@/lib/manage/api-client';
import { cn } from '@/lib/shared/utils';
import type {
    ManageUser,
    ManageUserAbilities,
    ManageUserFilterOptions,
    ManageUserFilterState,
    ManageUserListResponse,
} from '@/types/manage';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ChangeEvent, ReactElement } from 'react';
import { useCallback } from 'react';
import {
    Clock3,
    MoreHorizontal,
    RefreshCcw,
    ShieldAlert,
    ShieldCheck,
    SquarePen,
    UserCheck,
    UserMinus,
    UserPlus,
    Users,
} from 'lucide-react';

type ManageAdminUsersPageProps = Omit<SharedData, 'abilities'> & {
    users: ManageUserListResponse;
    filters: ManageUserFilterState;
    filterOptions: ManageUserFilterOptions;
    abilities: ManageUserAbilities;
};

type FilterFormState = {
    keyword: string;
    roles: string[];
    statuses: string[];
    space: string;
    sort: string;
    direction: 'asc' | 'desc';
    per_page: string;
};

type DetailFormState = {
    name: string;
    email: string;
    role: string | null;
    status: string;
    locale: string | null;
    spaces: number[];
};

const PER_PAGE_OPTIONS = ['10', '15', '25', '50'] as const;

const STATUS_BADGE_CLASS: Record<string, string> = {
    active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    inactive: 'border-amber-200 bg-amber-50 text-amber-700',
};

const STATUS_TONE_MAP: Record<string, DataCardStatusTone> = {
    active: 'success',
    inactive: 'warning',
};

const STATUS_ICON_MAP: Record<string, typeof ShieldCheck> = {
    active: ShieldCheck,
    inactive: ShieldAlert,
};

function getInitials(name: string): string {
    const full = name.trim();
    if (!full) {
        return 'U';
    }

    const parts = full.split(/\s+/);
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export default function ManageAdminUsersIndex() {
    const page = usePage<ManageAdminUsersPageProps>();
    const { users, filters, filterOptions, abilities } = page.props;
    const locale = typeof page.props.locale === 'string' ? page.props.locale : 'zh-TW';

    const { t } = useTranslator('manage');
    const { toasts, showSuccess, showError, showWarning, dismissToast } = useToast();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.admin.users', '使用者'),
            href: '/manage/admin/users',
        },
    ];

    const pageTitle = t('sidebar.admin.users', '使用者管理');

    const defaultFilterForm = useMemo<FilterFormState>(() => ({
        keyword: filters.keyword ?? '',
        roles: filters.roles ?? [],
        statuses: filters.statuses ?? [],
        space: filters.space ? String(filters.space) : '',
        sort: filters.sort ?? 'name',
        direction: filters.direction ?? 'asc',
        per_page: String(filters.per_page ?? parseInt(PER_PAGE_OPTIONS[1], 10)),
    }), [filters.keyword, filters.roles, filters.statuses, filters.space, filters.sort, filters.direction, filters.per_page]);

    const [filterForm, setFilterForm] = useState<FilterFormState>(defaultFilterForm);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [pendingBulkAction, setPendingBulkAction] = useState<'activate' | 'deactivate' | null>(null);
    const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);
    const [detailUser, setDetailUser] = useState<ManageUser | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailForm, setDetailForm] = useState<DetailFormState | null>(null);
    const [detailSaving, setDetailSaving] = useState(false);
    const keywordTimer = useRef<number | null>(null);
    const pagination = users.meta;

    useEffect(() => {
        setFilterForm(defaultFilterForm);
    }, [defaultFilterForm]);

    useEffect(() => {
        setSelectedIds([]);
    }, [pagination.current_page, users.data.map(user => user.id).join('-')]);

    useEffect(() => {
        if (filterForm.keyword === (filters.keyword ?? '')) {
            return;
        }

        if (keywordTimer.current) {
            window.clearTimeout(keywordTimer.current);
        }

        keywordTimer.current = window.setTimeout(() => {
            applyFilters({ keyword: filterForm.keyword }, { replace: true });
        }, 400);

        return () => {
            if (keywordTimer.current) {
                window.clearTimeout(keywordTimer.current);
            }
        };
    }, [filterForm.keyword]);

    const applyFilters = useCallback((overrides: Partial<FilterFormState> = {}, options: { replace?: boolean } = {}) => {
        const payload: Record<string, string | number | string[] | null> = {
            keyword: (overrides.keyword ?? filterForm.keyword) || null,
            roles: overrides.roles ?? filterForm.roles,
            statuses: overrides.statuses ?? filterForm.statuses,
            space: (overrides.space ?? filterForm.space) || null,
            sort: overrides.sort ?? filterForm.sort,
            direction: overrides.direction ?? filterForm.direction,
            per_page: overrides.per_page ?? filterForm.per_page,
        };

        router.get('/manage/admin/users', payload, {
            preserveScroll: true,
            preserveState: true,
            replace: options.replace ?? false,
        });
    }, [filterForm.keyword, filterForm.roles, filterForm.statuses, filterForm.space, filterForm.sort, filterForm.direction, filterForm.per_page]);

    const handlePerPageChange = (perPage: string) => {
        setFilterForm(prev => ({ ...prev, per_page: perPage }));
        applyFilters({ per_page: perPage }, { replace: true });
    };

    const handleSortChange = (sort: string) => {
        setFilterForm(prev => ({ ...prev, sort }));
        applyFilters({ sort }, { replace: true });
    };

    const handleDirectionToggle = () => {
        const direction = filterForm.direction === 'asc' ? 'desc' : 'asc';
        setFilterForm(prev => ({ ...prev, direction }));
        applyFilters({ direction }, { replace: true });
    };

    const toggleRoleFilter = (value: string) => {
        setFilterForm(prev => {
            const exists = prev.roles.includes(value);
            const updated = exists ? prev.roles.filter(role => role !== value) : [...prev.roles, value];
            applyFilters({ roles: updated });
            return { ...prev, roles: updated };
        });
    };

    const toggleStatusFilter = (value: string) => {
        setFilterForm(prev => {
            const exists = prev.statuses.includes(value);
            const updated = exists ? prev.statuses.filter(status => status !== value) : [...prev.statuses, value];
            applyFilters({ statuses: updated });
            return { ...prev, statuses: updated };
        });
    };

    const handleSpaceFilterChange = (space: string) => {
        setFilterForm(prev => ({ ...prev, space }));
        applyFilters({ space }, { replace: true });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(users.data.map(user => user.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleRowSelect = (id: number, checked: boolean) => {
        setSelectedIds(prev => {
            if (checked) {
                return [...new Set([...prev, id])];
            }
            return prev.filter(item => item !== id);
        });
    };

    const fetchDetail = async (userId: number) => {
        try {
            setDetailLoading(true);
            const response = await apiClient.get<{ data: ManageUser }>(`/admin/users/${userId}`);
            const fetchedUser = response.data.data;
            setDetailUser(fetchedUser);
            setDetailForm({
                name: fetchedUser.name,
                email: fetchedUser.email,
                role: fetchedUser.role,
                status: fetchedUser.status,
                locale: fetchedUser.locale,
                spaces: fetchedUser.spaces.map(space => space.id),
            });
            setDetailOpen(true);
        } catch (error) {
            if (isManageApiError(error)) {
                showError(error.message);
            } else {
                showError(t('shared.error.unknown', '發生未知錯誤。'));
            }
        } finally {
            setDetailLoading(false);
        }
    };

    const handleStatusChange = async (user: ManageUser, status: 'active' | 'inactive') => {
        try {
            await apiClient.put(`/admin/users/${user.id}`, {
                name: user.name,
                email: user.email,
                role: user.role,
                status,
                spaces: user.spaces.map(space => space.id),
                locale: user.locale,
            });
            showSuccess(status === 'active' ? t('users.actions.activated', '已啟用使用者。') : t('users.actions.deactivated', '已停用使用者。'));
            router.reload({ only: ['users'] });
        } catch (error) {
            if (isManageApiError(error)) {
                showError(error.message);
            } else {
                showError(t('shared.error.unknown', '發生未知錯誤。'));
            }
        }
    };

    const executeBulkStatus = async (status: 'active' | 'inactive') => {
        try {
            const response = await apiClient.post<{ message?: string }>('/admin/users/bulk-status', {
                user_ids: selectedIds,
                status,
            });
            showSuccess(response.data.message ?? t('users.bulk.success', '批次狀態已更新。'));
            router.reload({ only: ['users'] });
        } catch (error) {
            if (isManageApiError(error)) {
                showError(error.message);
            } else {
                showError(t('shared.error.unknown', '發生未知錯誤。'));
            }
        } finally {
            setPendingBulkAction(null);
            setConfirmBulkOpen(false);
        }
    };

    const handleSendPasswordReset = async (user: ManageUser) => {
        try {
            const response = await apiClient.post<{ message?: string }>(`/admin/users/${user.id}/password-reset`);
            showSuccess(response.data.message ?? t('users.actions.reset_sent', '密碼重設連結已寄出。'));
        } catch (error) {
            if (isManageApiError(error)) {
                showError(error.message);
            } else {
                showError(t('shared.error.unknown', '發生未知錯誤。'));
            }
        }
    };

    const handleImpersonate = async (user: ManageUser) => {
        try {
            await apiClient.post(`/admin/users/${user.id}/impersonate`);
            showWarning(t('users.actions.impersonating', '已切換至模擬登入帳號，重新導向中。'));
            window.location.href = '/manage/dashboard';
        } catch (error) {
            if (isManageApiError(error)) {
                showError(error.message);
            } else {
                showError(t('shared.error.unknown', '發生未知錯誤。'));
            }
        }
    };

    const roleOptions = filterOptions.roles;
    const statusOptions = filterOptions.statuses;
    const spaceOptions = filterOptions.spaces;

    const totalSpaceMemberships = useMemo(
        () => users.data.reduce((sum, user) => sum + (user.space_count ?? user.spaces.length ?? 0), 0),
        [users.data]
    );
    const activeUsersOnPage = useMemo(
        () => users.data.filter(user => user.status === 'active').length,
        [users.data]
    );
    const totalUsersOnPage = users.data.length;
    const allowBulkStatus = abilities.canUpdate || abilities.canAssignRoles;

    const actionDisabled = selectedIds.length === 0;
    const selectionLabel = actionDisabled
        ? t('users.bulk.no_selection', '尚未選擇任何使用者')
        : t('users.bulk.selected_count', '已選擇 {count} 筆', { count: selectedIds.length });

    const renderStatusBadge = (user: ManageUser) => {
        const Icon = STATUS_ICON_MAP[user.status] ?? ShieldCheck;

        return (
            <Badge
                variant="outline"
                className={cn(
                    'gap-1.5 border-2 text-xs capitalize',
                    STATUS_BADGE_CLASS[user.status] ?? 'border-neutral-200 bg-neutral-100 text-neutral-600'
                )}
            >
                <Icon className="h-3 w-3" />
                {user.status_label}
            </Badge>
        );
    };

    const handleDetailRoleToggle = (role: string) => {
        setDetailForm(prev => {
            if (!prev) {
                return prev;
            }

            return {
                ...prev,
                role,
            };
        });
    };

    const handleDetailStatusChange = (status: string) => {
        setDetailForm(prev => {
            if (!prev) {
                return prev;
            }

            return {
                ...prev,
                status,
            };
        });
    };

    const handleDetailSpaceToggle = (spaceId: number, checked: boolean) => {
        setDetailForm(prev => {
            if (!prev) {
                return prev;
            }

            const current = new Set(prev.spaces);
            if (checked) {
                current.add(spaceId);
            } else {
                current.delete(spaceId);
            }

            return {
                ...prev,
                spaces: Array.from(current),
            };
        });
    };

    const handleDetailSave = async () => {
        if (!detailUser || !detailForm) {
            return;
        }

        try {
            setDetailSaving(true);
            const response = await apiClient.put<{ data: ManageUser; message?: string }>(`/admin/users/${detailUser.id}`, {
                name: detailForm.name,
                email: detailForm.email,
                locale: detailForm.locale,
                role: detailForm.role,
                status: detailForm.status,
                spaces: detailForm.spaces,
            });

            const updated = response.data.data;
            setDetailUser(updated);
            setDetailForm({
                name: updated.name,
                email: updated.email,
                role: updated.role,
                status: updated.status,
                locale: updated.locale,
                spaces: updated.spaces.map(space => space.id),
            });

            showSuccess(response.data.message ?? t('users.detail.save_success', '使用者設定已更新。'));
            router.reload({ only: ['users'] });
        } catch (error) {
            if (isManageApiError(error)) {
                showError(error.message);
            } else {
                showError(t('shared.error.unknown', '發生未知錯誤。'));
            }
        } finally {
            setDetailSaving(false);
        }
    };

    const renderRoleBadge = (user: ManageUser) => (
        <Badge variant="outline" className="capitalize">
            {user.role_label}
        </Badge>
    );

    const renderActionMenuItems = (user: ManageUser, options: { includeViewDetail?: boolean } = {}) => {
        const includeViewDetail = options.includeViewDetail ?? true;

        return (
            <>
                {includeViewDetail ? (
                    <>
                        <DropdownMenuItem className="gap-2" onSelect={() => fetchDetail(user.id)}>
                            <SquarePen className="h-4 w-4" />
                            {t('users.actions.view_detail', '檢視詳細資料')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                ) : null}
                <DropdownMenuItem
                    disabled={!abilities.canSendPasswordReset}
                    className="gap-2"
                    onSelect={() => handleSendPasswordReset(user)}
                >
                    <UserMinus className="h-4 w-4" />
                    {t('users.actions.send_reset', '寄送重設密碼')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={!abilities.canImpersonate}
                    className="gap-2"
                    onSelect={() => handleImpersonate(user)}
                >
                    <UserCheck className="h-4 w-4" />
                    {t('users.actions.impersonate', '模擬登入')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="gap-2"
                    disabled={!abilities.canUpdate}
                    onSelect={() => handleStatusChange(user, user.status === 'active' ? 'inactive' : 'active')}
                >
                    {user.status === 'active' ? (
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                    ) : (
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    )}
                    {user.status === 'active'
                        ? t('users.actions.deactivate', '停用帳號')
                        : t('users.actions.activate', '啟用帳號')}
                </DropdownMenuItem>
            </>
        );
    };

    const renderUserCard = (user: ManageUser) => {
        const isSelected = selectedIds.includes(user.id);
        const StatusIcon = STATUS_ICON_MAP[user.status] ?? ShieldCheck;
        const tone = STATUS_TONE_MAP[user.status] ?? 'neutral';
        const lastLogin = formatDateTime(user.last_login_at, locale) || t('users.table.never_login', '尚未登入');
        const spaces = user.spaces ?? [];
        const displayedSpaces = spaces.slice(0, 3);

        return (
            <div key={user.id} className="relative">
                <div className="absolute right-4 top-4 md:hidden">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleRowSelect(user.id, Boolean(checked))}
                        aria-label={t('users.table.select_row', '選擇使用者')}
                    />
                </div>
                <DataCard
                    title={user.name}
                    description={user.email}
                    status={{
                        label: user.status_label,
                        tone,
                        icon: <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />,
                    }}
                    metadata={[
                        {
                            label: t('users.table.role', '角色'),
                            value: user.role_label,
                        },
                        {
                            label: t('users.table.last_login', '最近登入'),
                            value: lastLogin,
                            icon: <Clock3 className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />,
                        },
                        {
                            label: t('users.table.spaces', '所屬 Space'),
                            value:
                                spaces.length > 0
                                    ? spaces.map(space => space.name).join('、')
                                    : t('users.table.no_spaces', '尚未綁定'),
                            icon: <Users className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />,
                        },
                    ]}
                    actions={(
                        <div className="flex w-full flex-wrap items-center justify-end gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                                onClick={() => fetchDetail(user.id)}
                            >
                                <SquarePen className="h-4 w-4" />
                                {t('users.actions.view_detail', '檢視詳細資料')}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-2 border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                        {t('users.actions.more', '更多操作')}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    {renderActionMenuItems(user, { includeViewDetail: false })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                        <Badge variant="outline" className="border-neutral-200 text-neutral-500">
                            ID #{user.id}
                        </Badge>
                        {user.locale ? (
                            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                {user.locale}
                            </Badge>
                        ) : null}
                        <span>{t('users.table.spaces_count', 'Space 數：{count}', { count: user.space_count })}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {spaces.length === 0 ? (
                            <span className="text-xs text-neutral-400">{t('users.table.no_spaces', '尚未綁定')}</span>
                        ) : (
                            displayedSpaces.map(space => (
                                <Badge key={space.id} variant="secondary" className="text-xs">
                                    {space.name}
                                </Badge>
                            ))
                        )}
                        {user.space_count > displayedSpaces.length ? (
                            <Badge variant="outline" className="text-xs text-neutral-500">
                                +{user.space_count - displayedSpaces.length}
                            </Badge>
                        ) : null}
                    </div>
                </DataCard>
            </div>
        );
    };

    return (
        <>
            <Head title={pageTitle} />
            <ToastContainer toasts={toasts} onDismiss={dismissToast} position="top-right" />
            <ManagePage
                title={pageTitle}
                description={t('users.description', '管理使用者角色、權限與登入狀態。')}
                breadcrumbs={breadcrumbs}
                toolbar={(
                    <ManageToolbar
                        wrap
                        primary={
                            abilities.canCreate ? (
                                <Button
                                    size="sm"
                                    variant="default"
                                    className={manageToolbarPrimaryButtonClass('gap-2')}
                                    asChild
                                >
                                    <Link href="/manage/admin/users/create">
                                        <UserPlus className="h-4 w-4" />
                                        {t('users.invite', '邀請新成員')}
                                    </Link>
                                </Button>
                            ) : null
                        }
                        secondary={
                            <div className="flex flex-col gap-2 text-xs text-neutral-500 md:flex-row md:items-center md:gap-3">
                                <span>{selectionLabel}</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className={manageToolbarPrimaryButtonClass('gap-2')}
                                            disabled={actionDisabled || !allowBulkStatus}
                                        >
                                            <UserCheck className="h-4 w-4" />
                                            {t('users.bulk.actions', '批次操作')}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>{t('users.bulk.title', '選擇批次動作')}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            disabled={actionDisabled || !allowBulkStatus}
                                            onSelect={() => {
                                                setPendingBulkAction('activate');
                                                setConfirmBulkOpen(true);
                                            }}
                                            className="gap-2"
                                        >
                                            <ShieldCheck className="h-4 w-4" />
                                            {t('users.bulk.activate', '啟用選取帳號')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            disabled={actionDisabled || !allowBulkStatus}
                                            onSelect={() => {
                                                setPendingBulkAction('deactivate');
                                                setConfirmBulkOpen(true);
                                            }}
                                            className="gap-2"
                                        >
                                            <ShieldAlert className="h-4 w-4" />
                                            {t('users.bulk.deactivate', '停用選取帳號')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        }
                    >
                        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
                            <Input
                                value={filterForm.keyword}
                                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                    setFilterForm(prev => ({ ...prev, keyword: event.target.value }))
                                }
                                placeholder={t('users.filters.keyword_placeholder', '搜尋姓名或 Email')}
                                className={manageFilterControlClass('w-full lg:max-w-xs')}
                            />
                            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={manageToolbarPrimaryButtonClass('justify-between gap-2 sm:w-auto')}
                                        >
                                            {t('users.filters.roles', '角色')}
                                            {filterForm.roles.length > 0 ? (
                                                <Badge variant="secondary" className="ml-2">
                                                    {filterForm.roles.length}
                                                </Badge>
                                            ) : null}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-48">
                                        {roleOptions.map(option => (
                                            <DropdownMenuItem
                                                key={option.value}
                                                className="gap-2"
                                                onSelect={(event) => event.preventDefault()}
                                            >
                                                <Checkbox
                                                    checked={filterForm.roles.includes(String(option.value))}
                                                    onCheckedChange={() => toggleRoleFilter(String(option.value))}
                                                />
                                                <span>{option.label}</span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={manageToolbarPrimaryButtonClass('justify-between gap-2 sm:w-auto')}
                                        >
                                            {t('users.filters.status', '狀態')}
                                            {filterForm.statuses.length > 0 ? (
                                                <Badge variant="secondary" className="ml-2">
                                                    {filterForm.statuses.length}
                                                </Badge>
                                            ) : null}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-48">
                                        {statusOptions.map(option => (
                                            <DropdownMenuItem
                                                key={option.value}
                                                className="gap-2"
                                                onSelect={(event) => event.preventDefault()}
                                            >
                                                <Checkbox
                                                    checked={filterForm.statuses.includes(String(option.value))}
                                                    onCheckedChange={() => toggleStatusFilter(String(option.value))}
                                                />
                                                <span>{option.label}</span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Select
                                    value={filterForm.space}
                                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                                        handleSpaceFilterChange(event.target.value)
                                    }
                                    className={manageFilterControlClass('w-full sm:w-48')}
                                >
                                    <option value="">{t('users.filters.space_all', '全部空間')}</option>
                                    {spaceOptions.map(option => (
                                        <option key={option.value} value={String(option.value)}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                                <Select
                                    value={filterForm.sort}
                                    onChange={(event: ChangeEvent<HTMLSelectElement>) => handleSortChange(event.target.value)}
                                    className={manageFilterControlClass('w-full sm:w-40')}
                                >
                                    {filterOptions.sorts.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDirectionToggle}
                                    className={manageToolbarPrimaryButtonClass('sm:w-auto')}
                                >
                                    {filterForm.direction === 'asc'
                                        ? t('users.filters.direction.asc', '升冪')
                                        : t('users.filters.direction.desc', '降冪')}
                                </Button>
                                <Select
                                    value={filterForm.per_page}
                                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                                        handlePerPageChange(event.target.value)
                                    }
                                    className={manageFilterControlClass('w-full sm:w-36')}
                                >
                                    {PER_PAGE_OPTIONS.map(option => (
                                        <option key={option} value={option}>
                                            {t('users.filters.per_page', '{count} 筆/頁', { count: option })}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </ManageToolbar>
                )}
            >
                <section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
                    <header className="flex flex-col gap-3 border-b border-neutral-200/70 px-5 py-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold text-neutral-900">
                                {t('users.list.title', '帳號列表')}
                            </h2>
                            <p className="text-sm text-neutral-500">
                                {t('users.list.subtitle', '檢視成員資訊並快速調整權限。')}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                {t('users.stats.total_on_page', '本頁 {count} 筆', { count: totalUsersOnPage })}
                            </Badge>
                            <span>{t('users.stats.active_count', '啟用帳號：{count}', { count: activeUsersOnPage })}</span>
                            <span>{t('users.stats.space_memberships', 'Space 關聯數：{count}', { count: totalSpaceMemberships })}</span>
                        </div>
                    </header>
                    <div className="px-5 py-5">
                        <ResponsiveDataView
                            table={() => (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-neutral-200/80">
                                                <TableHead className="w-10">
                                                    <Checkbox
                                                        checked={selectedIds.length > 0 && selectedIds.length === users.data.length}
                                                        onCheckedChange={checked => handleSelectAll(Boolean(checked))}
                                                        aria-label={t('users.table.select_all', '全選')}
                                                    />
                                                </TableHead>
                                                <TableHead className="min-w-[220px] text-neutral-500">
                                                    {t('users.table.name', '姓名')}
                                                </TableHead>
                                                <TableHead className="min-w-[220px] text-neutral-500">
                                                    {t('users.table.email', '電子郵件')}
                                                </TableHead>
                                                <TableHead className="min-w-[120px] text-neutral-500">
                                                    {t('users.table.role', '角色')}
                                                </TableHead>
                                                <TableHead className="min-w-[120px] text-neutral-500">
                                                    {t('users.table.status', '狀態')}
                                                </TableHead>
                                                <TableHead className="hidden min-w-[160px] text-neutral-500 lg:table-cell">
                                                    {t('users.table.last_login', '最近登入')}
                                                </TableHead>
                                                <TableHead className="hidden min-w-[200px] text-neutral-500 lg:table-cell">
                                                    {t('users.table.spaces', '所屬 Space')}
                                                </TableHead>
                                                <TableHead className="w-40 text-right text-neutral-500">
                                                    {t('users.table.actions', '操作')}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.data.map(user => {
                                                const displayedSpaces = user.spaces.slice(0, 3);

                                                return (
                                                    <TableRow key={user.id} className="border-neutral-200/70">
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={selectedIds.includes(user.id)}
                                                                onCheckedChange={checked => handleRowSelect(user.id, Boolean(checked))}
                                                                aria-label={t('users.table.select_row', '選擇使用者')}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-9 w-9">
                                                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <div className="font-medium text-neutral-800">{user.name}</div>
                                                                    <div className="text-xs text-neutral-400">ID #{user.id}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-neutral-600">{user.email}</TableCell>
                                                        <TableCell>{renderRoleBadge(user)}</TableCell>
                                                        <TableCell>{renderStatusBadge(user)}</TableCell>
                                                        <TableCell className="hidden text-neutral-500 lg:table-cell">
                                                            {formatDateTime(user.last_login_at, locale) ||
                                                                t('users.table.never_login', '尚未登入')}
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell">
                                                            <div className="flex flex-wrap gap-1">
                                                                {user.spaces.length === 0 ? (
                                                                    <span className="text-xs text-neutral-400">
                                                                        {t('users.table.no_spaces', '尚未綁定')}
                                                                    </span>
                                                                ) : (
                                                                    displayedSpaces.map(space => (
                                                                        <Badge key={space.id} variant="secondary" className="text-xs">
                                                                            {space.name}
                                                                        </Badge>
                                                                    ))
                                                                )}
                                                                {user.space_count > displayedSpaces.length ? (
                                                                    <Badge variant="outline" className="text-xs text-neutral-500">
                                                                        +{user.space_count - displayedSpaces.length}
                                                                    </Badge>
                                                                ) : null}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="hidden gap-2 border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 xl:flex"
                                                                    onClick={() => fetchDetail(user.id)}
                                                                >
                                                                    <SquarePen className="h-4 w-4" />
                                                                    {t('users.actions.view_detail', '檢視詳細資料')}
                                                                </Button>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-52">
                                                                        {renderActionMenuItems(user)}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                            card={() => <div className="space-y-3">{users.data.map(renderUserCard)}</div>}
                            isEmpty={totalUsersOnPage === 0}
                            emptyState={(
                                <TableEmpty
                                    title={t('users.empty.title', '尚無使用者資料')}
                                    description={t('users.empty.description', '您可以從右上角邀請新成員或稍後再試。')}
                                    action={
                                        abilities.canCreate ? (
                                            <Button
                                                size="sm"
                                                variant="tonal"
                                                className="gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 focus-visible:ring-emerald-200/60"
                                                asChild
                                            >
                                                <Link href="/manage/admin/users/create">
                                                    <UserPlus className="h-4 w-4" />
                                                    {t('users.invite', '邀請新成員')}
                                                </Link>
                                            </Button>
                                        ) : null
                                    }
                                />
                            )}
                            stickyActions={
                                selectedIds.length > 0 ? (
                                    <>
                                        <span className="text-xs font-semibold text-neutral-600">{selectionLabel}</span>
                                        <Button
                                            size="sm"
                                            variant="tonal"
                                            className="w-full gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 focus-visible:ring-emerald-200/60 disabled:opacity-60"
                                            disabled={!allowBulkStatus}
                                            onClick={() => {
                                                setPendingBulkAction('activate');
                                                setConfirmBulkOpen(true);
                                            }}
                                        >
                                            <ShieldCheck className="h-4 w-4" />
                                            {t('users.bulk.activate', '啟用選取帳號')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="tonal"
                                            className="w-full gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 focus-visible:ring-amber-200/60 disabled:opacity-60"
                                            disabled={!allowBulkStatus}
                                            onClick={() => {
                                                setPendingBulkAction('deactivate');
                                                setConfirmBulkOpen(true);
                                            }}
                                        >
                                            <ShieldAlert className="h-4 w-4" />
                                            {t('users.bulk.deactivate', '停用選取帳號')}
                                        </Button>
                                    </>
                                ) : null
                            }
                        />
                    </div>
                    <div className="border-t border-neutral-200/70 px-5 py-4">
                        <Pagination
                            meta={{
                                current_page: pagination.current_page,
                                last_page: pagination.last_page,
                                per_page: pagination.per_page,
                                total: pagination.total,
                                from: pagination.from ?? 0,
                                to: pagination.to ?? 0,
                                links: pagination.links ?? [],
                            }}
                            onPerPageChange={(perPage) => handlePerPageChange(String(perPage))}
                            perPageOptions={PER_PAGE_OPTIONS.map(option => Number(option))}
                        />
                    </div>
                </section>
            </ManagePage>

            <ConfirmDialog
                open={confirmBulkOpen}
                onOpenChange={setConfirmBulkOpen}
                title={pendingBulkAction === 'activate' ? t('users.bulk.confirm_activate_title', '確認啟用') : t('users.bulk.confirm_deactivate_title', '確認停用')}
                description={pendingBulkAction === 'activate'
                    ? t('users.bulk.confirm_activate_description', '將啟用所有選取的帳號，是否繼續？')
                    : t('users.bulk.confirm_deactivate_description', '將停用所有選取的帳號，是否繼續？')}
                onConfirm={() => pendingBulkAction && executeBulkStatus(pendingBulkAction === 'activate' ? 'active' : 'inactive')}
                variant={pendingBulkAction === 'activate' ? 'default' : 'destructive'}
            />

            <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>{detailUser?.name ?? t('users.detail.title', '使用者詳情')}</SheetTitle>
                        <SheetDescription>
                            {detailUser?.email ?? t('users.detail.description', '檢視使用者基本資料、角色與活動紀錄。')}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-6 px-4 pb-8 pt-6">
                        {detailLoading && (
                            <div className="text-center text-sm text-neutral-500">{t('users.detail.loading', '載入中...')}</div>
                        )}
                        {!detailLoading && detailUser && detailForm && (
                            <>
                                {/* 使用者基本資訊區塊（唯讀） */}
                                <div className="rounded-lg border border-neutral-200/70 p-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-14 w-14">
                                            <AvatarFallback>{getInitials(detailUser.name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-lg font-semibold text-neutral-900">{detailUser.name}</div>
                                            <div className="text-sm text-neutral-500">{detailUser.email}</div>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {renderRoleBadge(detailUser)}
                                                {renderStatusBadge(detailUser)}
                                            </div>
                                        </div>
                                    </div>
                                    <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-neutral-600 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-neutral-400">{t('users.detail.fields.locale', '語系')}</dt>
                                            <dd>{detailUser.locale ?? '—'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-neutral-400">{t('users.detail.fields.last_login', '最近登入')}</dt>
                                            <dd>{formatDateTime(detailUser.last_login_at, locale)}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-neutral-400">{t('users.detail.fields.created_at', '建立時間')}</dt>
                                            <dd>{formatDateTime(detailUser.created_at, locale)}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-neutral-400">{t('users.detail.fields.updated_at', '最後更新')}</dt>
                                            <dd>{formatDateTime(detailUser.updated_at, locale)}</dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* 角色編輯區塊：提供角色選項勾選，支援多角色切換 */}
                                {abilities.canAssignRoles && (
                                    <div className="rounded-lg border border-neutral-200/70 p-4">
                                        <h3 className="mb-3 text-sm font-semibold text-neutral-700">
                                            {t('users.detail.sections.role', '角色管理')}
                                        </h3>
                                        <div className="space-y-2">
                                            {roleOptions.map((option) => {
                                                const isSelected = detailForm.role === option.value;
                                                return (
                                                    <label
                                                        key={String(option.value)}
                                                        className={cn(
                                                            'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                                                            isSelected
                                                                ? 'border-blue-300 bg-blue-50/60'
                                                                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50',
                                                        )}
                                                    >
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => handleDetailRoleToggle(String(option.value))}
                                                        />
                                                        <span className="text-sm font-medium text-neutral-700">{option.label}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* 狀態編輯區塊：啟用/停用選擇器 */}
                                {abilities.canUpdate && (
                                    <div className="rounded-lg border border-neutral-200/70 p-4">
                                        <h3 className="mb-3 text-sm font-semibold text-neutral-700">
                                            {t('users.detail.sections.status', '帳號狀態')}
                                        </h3>
                                        <div className="space-y-2">
                                            {statusOptions.map((option) => {
                                                const isSelected = detailForm.status === option.value;
                                                return (
                                                    <label
                                                        key={String(option.value)}
                                                        className={cn(
                                                            'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                                                            isSelected
                                                                ? 'border-emerald-300 bg-emerald-50/60'
                                                                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50',
                                                        )}
                                                    >
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => handleDetailStatusChange(String(option.value))}
                                                        />
                                                        <span className="text-sm font-medium text-neutral-700">{option.label}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Space 多選區塊：讓管理員為使用者綁定多個 Space */}
                                {abilities.canAssignRoles && spaceOptions.length > 0 && (
                                    <div className="rounded-lg border border-neutral-200/70 p-4">
                                        <h3 className="mb-3 text-sm font-semibold text-neutral-700">
                                            {t('users.detail.sections.spaces', '綁定 Space')}
                                        </h3>
                                        <div className="space-y-2">
                                            {spaceOptions.map((option) => {
                                                const isSelected = detailForm.spaces.includes(Number(option.value));
                                                return (
                                                    <label
                                                        key={String(option.value)}
                                                        className={cn(
                                                            'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                                                            isSelected
                                                                ? 'border-purple-300 bg-purple-50/60'
                                                                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50',
                                                        )}
                                                    >
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) =>
                                                                handleDetailSpaceToggle(Number(option.value), Boolean(checked))
                                                            }
                                                        />
                                                        <span className="text-sm font-medium text-neutral-700">{option.label}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        {detailForm.spaces.length === 0 && (
                                            <p className="mt-2 text-xs text-neutral-500">
                                                {t('users.detail.no_spaces_selected', '尚未選擇任何空間。')}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* 最近操作紀錄區塊：顯示最近 10 筆活動 */}
                                <div className="rounded-lg border border-neutral-200/70 p-4">
                                    <h3 className="text-sm font-semibold text-neutral-700">{t('users.detail.sections.activities', '最近操作紀錄')}</h3>
                                    {/* 以共用時間線元件呈現活動，避免重複模板 */}
                                    <ActivityTimeline
                                        className="mt-3"
                                        activities={detailUser.recent_activities}
                                        locale={locale}
                                        emptyText={t('users.detail.no_activities', '尚無操作紀錄。')}
                                    />
                                </div>

                                {/* 儲存按鈕區塊：集中在底部方便操作 */}
                                <div className="flex items-center justify-end gap-3 border-t border-neutral-200/70 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDetailOpen(false)}
                                        disabled={detailSaving}
                                    >
                                        {t('users.detail.actions.cancel', '取消')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="tonal"
                                        onClick={handleDetailSave}
                                        disabled={detailSaving || (!abilities.canUpdate && !abilities.canAssignRoles)}
                                        className="gap-2"
                                    >
                                        {detailSaving ? (
                                            <>
                                                <RefreshCcw className="h-4 w-4 animate-spin" />
                                                {t('users.detail.actions.saving', '儲存中...')}
                                            </>
                                        ) : (
                                            <>{t('users.detail.actions.save', '儲存變更')}</>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

ManageAdminUsersIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
