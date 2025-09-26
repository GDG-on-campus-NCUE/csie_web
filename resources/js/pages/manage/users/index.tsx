import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ShieldCheck, UserPlus } from 'lucide-react';

import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import ToastContainer from '@/components/ui/toast-container';
import { Button } from '@/components/ui/button';

import { useToast } from '@/hooks/use-toast';
import { useTranslator } from '@/hooks/use-translator';

import UserTable from '@/components/manage/users/UserTable';
import { UserFilterForm } from '@/components/manage/users/user-filter-form';
import type {
    OptionItem,
    UserFilterState,
    UserFlashMessages,
    UserRow,
    UserRole,
    UserStatus,
    UsersResponsePayload,
} from '@/components/manage/users/user-types';
import type { BreadcrumbItem, SharedData } from '@/types';

interface UsersIndexProps {
    users: UsersResponsePayload;
    filters: Partial<UserFilterState>;
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

const createInitialFilterState = (
    filters: Partial<UserFilterState>,
    defaultSort: string,
    defaultPerPage: number,
): UserFilterState => ({
    q: filters.q ?? '',
    role: filters.role ?? '',
    status: filters.status ?? '',
    created_from: filters.created_from ?? '',
    created_to: filters.created_to ?? '',
    sort: filters.sort ?? defaultSort,
    per_page: filters.per_page ?? String(defaultPerPage),
});

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
    const page = usePage<SharedData & { flash?: UserFlashMessages }>();
    const flashMessages: UserFlashMessages = page.props.flash ?? {};
    const locale = page.props.locale ?? 'zh-TW';

    const { t } = useTranslator('manage');
    const normalizedLocale = locale.toLowerCase().replace('_', '-');
    const isTraditionalChinese = normalizedLocale.startsWith('zh');
    const fallbackLanguage: 'zh' | 'en' = isTraditionalChinese ? 'zh' : 'en';
    const dateLocale = isTraditionalChinese ? 'zh-TW' : 'en-US';

    const { toasts, showSuccess, showError, showInfo, showBatchErrors, dismissToast } = useToast();

    const defaultSort = sortOptions[0]?.value ?? '-created_at';
    const defaultPerPage = perPageOptions[0] ?? 15;

    // 使用本地狀態保存篩選條件與勾選清單，提供順暢的使用者體驗。
    const [filterState, setFilterState] = useState<UserFilterState>(
        createInitialFilterState(filters, defaultSort, defaultPerPage),
    );
    const [selected, setSelected] = useState<number[]>([]);

    // Inertia 表單負責封裝與後端互動的請求，統一錯誤與載入狀態處理。
    const bulkForm = useForm<{ action: 'delete'; ids: number[] }>({
        action: 'delete',
        ids: [],
    });
    const statusForm = useForm<{
        name: string;
        email: string;
        role: UserRole;
        status: UserStatus;
        email_verified: boolean;
    }>({
        name: '',
        email: '',
        role: 'user',
        status: 'active',
        email_verified: false,
    });
    const deleteForm = useForm({});

    const skipFlashToastRef = useRef(false);
    const previousFlashRef = useRef<UserFlashMessages>({});

    const userData = users?.data ?? [];
    const paginationMeta = users?.meta ?? {
        current_page: 1,
        last_page: 1,
        per_page: defaultPerPage,
        total: userData.length,
        from: userData.length > 0 ? 1 : 0,
        to: userData.length,
    };
    const paginationLinks = users?.links ?? [];

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            { title: t('layout.breadcrumbs.users', '使用者管理'), href: '/manage/users' },
        ],
        [t],
    );

    const hasActiveFilters = useMemo(
        () =>
            filterState.q !== '' ||
            filterState.role !== '' ||
            filterState.status !== '' ||
            filterState.created_from !== '' ||
            filterState.created_to !== '' ||
            filterState.sort !== defaultSort,
        [filterState, defaultSort],
    );

    const handleFilterChange = useCallback((key: keyof UserFilterState, value: string) => {
        setFilterState((previous) => ({ ...previous, [key]: value }));
    }, []);

    const applyFilters = useCallback(
        (event?: FormEvent<HTMLFormElement>) => {
            event?.preventDefault();

            const params = Object.fromEntries(
                Object.entries(filterState).filter(([, value]) => value !== ''),
            );

            router.get('/manage/users', params, {
                preserveScroll: true,
                preserveState: true,
            });
        },
        [filterState],
    );

    const resetFilters = useCallback(() => {
        const initialState = createInitialFilterState({}, defaultSort, defaultPerPage);
        setFilterState(initialState);

        router.get(
            '/manage/users',
            { sort: initialState.sort, per_page: initialState.per_page },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    }, [defaultSort, defaultPerPage]);

    const handleSelectAll = useCallback(
        (checked: boolean) => {
            setSelected(checked ? userData.map((user) => user.id) : []);
        },
        [userData],
    );

    const handleSelect = useCallback((userId: number, value: boolean) => {
        setSelected((previous) =>
            value ? [...previous, userId] : previous.filter((id) => id !== userId),
        );
    }, []);

    // 批次刪除所有勾選的使用者，執行前會再次向使用者確認。
    const performBulkDelete = useCallback(() => {
        if (!can.manage || selected.length === 0 || bulkForm.processing) {
            return;
        }

        const confirmed = window.confirm(
            fallbackLanguage === 'zh'
                ? `確定要刪除選取的 ${selected.length} 位使用者嗎？`
                : `Delete the selected ${selected.length} users?`,
        );

        if (!confirmed) {
            return;
        }

        bulkForm.transform(() => ({
            action: 'delete',
            ids: selected,
        }));

        bulkForm.post('/manage/users/bulk', {
            preserveScroll: true,
            onSuccess: () => {
                setSelected([]);
                bulkForm.reset();
            },
            onError: (errors) => {
                skipFlashToastRef.current = true;
                const errorMessages = Object.values(errors)
                    .flat()
                    .map((message) => String(message))
                    .filter((message) => message.length > 0);
                const fallbackMessage =
                    fallbackLanguage === 'zh'
                        ? '批次刪除失敗，請稍後再試。'
                        : 'Bulk deletion failed. Please try again later.';
                showBatchErrors(
                    errorMessages.length > 0 ? errorMessages : [fallbackMessage],
                    fallbackLanguage === 'zh' ? '操作失敗' : 'Operation failed',
                );
            },
        });
    }, [can.manage, selected, bulkForm, fallbackLanguage, showBatchErrors]);

    // 切換使用者的啟用／停用狀態，確保不會對自己或重複操作。
    const handleToggleStatus = useCallback(
        (user: UserRow) => {
            if (!can.manage || statusForm.processing) {
                return;
            }

            const nextStatus: UserStatus = user.status === 'active' ? 'suspended' : 'active';

            statusForm.transform(() => ({
                name: user.name,
                email: user.email,
                role: user.role,
                status: nextStatus,
                email_verified: Boolean(user.email_verified_at),
            }));

            statusForm.put(`/manage/users/${user.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelected((previous) => previous.filter((id) => id !== user.id));
                },
                onError: (errors) => {
                    skipFlashToastRef.current = true;
                    const errorMessages = Object.values(errors)
                        .flat()
                        .map((message) => String(message))
                        .filter((message) => message.length > 0);
                    const fallbackMessage =
                        fallbackLanguage === 'zh'
                            ? '更新狀態時發生錯誤，請稍後再試。'
                            : 'Failed to update status. Please try again later.';
                    showBatchErrors(
                        errorMessages.length > 0 ? errorMessages : [fallbackMessage],
                        fallbackLanguage === 'zh' ? '操作失敗' : 'Operation failed',
                    );
                },
                onFinish: () => {
                    statusForm.reset();
                },
            });
        },
        [can.manage, statusForm, fallbackLanguage, showBatchErrors],
    );

    // 刪除單一使用者並從已勾選名單中移除。
    const handleDeleteUser = useCallback(
        (user: UserRow) => {
            if (!can.manage || deleteForm.processing) {
                return;
            }

            const confirmed = window.confirm(
                fallbackLanguage === 'zh'
                    ? `確定要刪除「${user.name}」帳號嗎？`
                    : `Delete the account for “${user.name}”?`,
            );

            if (!confirmed) {
                return;
            }

            deleteForm.delete(`/manage/users/${user.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelected((previous) => previous.filter((id) => id !== user.id));
                },
                onError: (errors) => {
                    skipFlashToastRef.current = true;
                    const errorMessages = Object.values(errors)
                        .flat()
                        .map((message) => String(message))
                        .filter((message) => message.length > 0);
                    const fallbackMessage =
                        fallbackLanguage === 'zh'
                            ? '刪除帳號時發生錯誤，請稍後再試。'
                            : 'Failed to delete the user. Please try again later.';
                    showBatchErrors(
                        errorMessages.length > 0 ? errorMessages : [fallbackMessage],
                        fallbackLanguage === 'zh' ? '操作失敗' : 'Operation failed',
                    );
                },
            });
        },
        [can.manage, deleteForm, fallbackLanguage, showBatchErrors],
    );

    // 依目前篩選條件與勾選名單匯出 CSV，並顯示提示避免使用者重複操作。
    const handleExport = useCallback(() => {
        const params = new URLSearchParams();

        Object.entries(filterState).forEach(([key, value]) => {
            if (value !== '') {
                params.append(key, value);
            }
        });

        selected.forEach((id) => params.append('ids[]', String(id)));

        const url = `/manage/users/export${params.toString() ? `?${params.toString()}` : ''}`;

        showInfo(
            fallbackLanguage === 'zh' ? '開始匯出' : 'Export started',
            fallbackLanguage === 'zh'
                ? '系統已依目前條件準備匯出，檔案將自動下載。'
                : 'Preparing CSV with the current filters. The download will start shortly.',
        );

        if (typeof window !== 'undefined') {
            window.location.href = url;
        }
    }, [filterState, selected, showInfo, fallbackLanguage]);

    useEffect(() => {
        setFilterState(createInitialFilterState(filters, defaultSort, defaultPerPage));
    }, [filters, defaultSort, defaultPerPage]);

    useEffect(() => {
        setSelected([]);
    }, [paginationMeta.current_page, paginationMeta.total]);

    // 監看伺服器返回的 flash 訊息並轉換為 Toast，統一前端提示行為。
    useEffect(() => {
        if (skipFlashToastRef.current) {
            previousFlashRef.current = flashMessages;
            skipFlashToastRef.current = false;
            return;
        }

        if (flashMessages.success && flashMessages.success !== previousFlashRef.current.success) {
            showSuccess(
                t('users.index.flash.success_title', fallbackLanguage === 'zh' ? '操作成功' : 'Success'),
                flashMessages.success,
            );
        }

        if (flashMessages.error && flashMessages.error !== previousFlashRef.current.error) {
            showError(
                t('users.index.flash.error_title', fallbackLanguage === 'zh' ? '操作失敗' : 'Error'),
                flashMessages.error,
            );
        }

        if (flashMessages.info && flashMessages.info !== previousFlashRef.current.info) {
            showInfo(
                t('users.index.flash.info_title', fallbackLanguage === 'zh' ? '提示訊息' : 'Notice'),
                flashMessages.info,
            );
        }

        previousFlashRef.current = flashMessages;
    }, [flashMessages, showSuccess, showError, showInfo, t, fallbackLanguage]);

    const pageTitle = t('users.index.title', fallbackLanguage === 'zh' ? '使用者管理' : 'User management');
    const pageDescription = t(
        'users.index.description',
        fallbackLanguage === 'zh'
            ? '檢視並管理後台帳號，調整角色、狀態與權限。'
            : 'Review and manage accounts, including roles and status.',
    );

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} position="bottom-right" />

            <section className="space-y-6">
                <ManagePageHeader
                    badge={{ icon: <ShieldCheck className="h-4 w-4" />, label: t('users.index.badge', '帳號控管') }}
                    title={pageTitle}
                    description={pageDescription}
                    actions={
                        can.create ? (
                            <Button asChild className="rounded-full px-6">
                                <Link href="/manage/users/create">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {t('users.index.actions.create', fallbackLanguage === 'zh' ? '新增使用者' : 'New user')}
                                </Link>
                            </Button>
                        ) : null
                    }
                />

                <UserFilterForm
                    filterState={filterState}
                    roleOptions={roleOptions}
                    statusOptions={statusOptions}
                    sortOptions={sortOptions}
                    perPageOptions={perPageOptions}
                    hasActiveFilters={hasActiveFilters}
                    onChange={handleFilterChange}
                    onSubmit={applyFilters}
                    onReset={resetFilters}
                    t={t}
                    fallbackLanguage={fallbackLanguage}
                />

                <UserTable
                    data={userData}
                    meta={paginationMeta}
                    links={paginationLinks}
                    selected={selected}
                    onSelect={handleSelect}
                    onSelectAll={handleSelectAll}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDeleteUser}
                    onBulkDelete={performBulkDelete}
                    onExport={handleExport}
                    bulkProcessing={bulkForm.processing}
                    canManage={can.manage}
                    authUserId={authUserId}
                    locale={dateLocale}
                />
            </section>
        </ManageLayout>
    );
}
