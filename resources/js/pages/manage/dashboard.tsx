import AdminDashboard from '@/components/manage/dashboard/dashboard';
import DashboardHeroCard from '@/components/manage/dashboard/dashboard-hero-card';
import {
    DashboardQuickAction,
    DashboardQuickActionsCard,
} from '@/components/manage/dashboard/dashboard-quick-actions-card';
import {
    DashboardToastContainer,
    useDashboardToast,
} from '@/components/manage/dashboard/dashboard-toast';
import { Button } from '@/components/ui/button';
import ManageLayout from '@/layouts/manage/manage-layout';
import { useTranslator } from '@/hooks/use-translator';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, LayoutGrid, Megaphone, NotebookPen, Settings, ShieldCheck, User } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import type { ManageRole } from '@/components/manage/manage-brand';
import { deriveManageRole } from '@/components/manage/utils/role-helpers';

interface DashboardFlashMessages {
    success?: string;
    error?: string;
    warnings?: string[];
    importErrors?: string[];
}

interface AdminStatusTracker {
    status: 'loaded' | 'missing' | null;
    generatedAt: string | null;
}

// 嘗試以使用者語系格式化時間字串，若格式化失敗則回傳 undefined 以避免顯示錯誤資訊。
function formatGeneratedAt(value: string | null | undefined, locale: string | undefined) {
    if (!value) {
        return undefined;
    }

    try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return undefined;
        }

        return new Intl.DateTimeFormat(locale ?? 'zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    } catch {
        return undefined;
    }
}

export default function Dashboard() {
    const page = usePage<SharedData & { flash?: DashboardFlashMessages }>();
    const { auth, adminDashboard, locale } = page.props;
    const flashMessages: DashboardFlashMessages = page.props.flash ?? {};
    const role = deriveManageRole(auth?.user ?? null, null);
    const { t } = useTranslator('manage');
    const { toasts, showToast, dismissToast } = useDashboardToast();
    const previousFlashRef = useRef<DashboardFlashMessages>({});
    const adminStatusRef = useRef<AdminStatusTracker>({ status: null, generatedAt: null });
    const roleToastRef = useRef<ManageRole | null>(null);

    // 監聽後端 flash 訊息，確保操作成功或失敗時使用者能透過 Toast 立即得知結果。
    useEffect(() => {
        const successMessage = flashMessages.success;
        const errorMessage = flashMessages.error;
        const warningMessages = flashMessages.warnings ?? [];
        const importErrorMessages = flashMessages.importErrors ?? [];

        if (successMessage && successMessage !== previousFlashRef.current.success) {
            showToast({
                type: 'success',
                title: t('dashboard.common.toast.success_title', '操作成功'),
                description: successMessage,
            });
        }

        if (errorMessage && errorMessage !== previousFlashRef.current.error) {
            showToast({
                type: 'error',
                title: t('dashboard.common.toast.error_title', '操作失敗'),
                description: errorMessage,
            });
        }

        warningMessages
            .filter((message) => !(previousFlashRef.current.warnings ?? []).includes(message))
            .forEach((message) => {
                showToast({
                    type: 'info',
                    title: t('dashboard.common.toast.info_title', '提醒'),
                    description: message,
                });
            });

        importErrorMessages
            .filter((message) => !(previousFlashRef.current.importErrors ?? []).includes(message))
            .forEach((message) => {
                showToast({
                    type: 'error',
                    title: t('dashboard.common.toast.import_error_title', '批次匯入失敗'),
                    description: message,
                });
            });

        previousFlashRef.current = {
            success: successMessage,
            error: errorMessage,
            warnings: [...warningMessages],
            importErrors: [...importErrorMessages],
        };
    }, [flashMessages, showToast, t]);

    // 當管理員儀表板資料載入或更新時顯示成功提示，若後端未提供資料則跳出錯誤提醒。
    useEffect(() => {
        if (role !== 'admin') {
            adminStatusRef.current = { status: null, generatedAt: null };
            return;
        }

        if (adminDashboard) {
            const generatedAt = adminDashboard.generatedAt ?? null;
            const statusChanged = adminStatusRef.current.status !== 'loaded';
            const timestampChanged = adminStatusRef.current.generatedAt !== generatedAt;

            if (statusChanged || timestampChanged) {
                const formatted = formatGeneratedAt(generatedAt, locale);
                showToast({
                    type: 'success',
                    title: t('dashboard.admin.toast.data_loaded_title', '儀表板資料載入成功'),
                    description:
                        formatted ?? t('dashboard.admin.toast.data_loaded_description', '統計資料已更新。'),
                });
            }

            adminStatusRef.current = { status: 'loaded', generatedAt };
        } else if (adminStatusRef.current.status !== 'missing') {
            showToast({
                type: 'error',
                title: t('dashboard.admin.toast.data_missing_title', '無法載入儀表板資料'),
                description: t(
                    'dashboard.admin.toast.data_missing_description',
                    '目前暫時無法取得統計資訊，請稍後再試。',
                ),
            });
            adminStatusRef.current = { status: 'missing', generatedAt: null };
        }
    }, [role, adminDashboard, locale, showToast, t]);

    // 非管理員角色進入儀表板時，提供載入完成的提示，避免使用者不確定頁面是否可操作。
    useEffect(() => {
        if (role === 'admin') {
            roleToastRef.current = null;
            return;
        }

        if (roleToastRef.current === role) {
            return;
        }

        showToast({
            type: 'success',
            title: t('dashboard.common.toast.ready_title', '儀表板載入完成'),
            description: t('dashboard.common.toast.ready_description', '所有快捷操作已為您準備就緒。'),
        });
        roleToastRef.current = role;
    }, [role, showToast, t]);

    if (role === 'admin') {
        const adminTitle = t('dashboard.admin.title', '系統總覽');
        const breadcrumbs = [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            { title: adminTitle, href: '/manage/dashboard' },
        ];

        return (
            <ManageLayout role={role} breadcrumbs={breadcrumbs}>
                <Head title={adminTitle} />
                <DashboardToastContainer toasts={toasts} onDismiss={dismissToast} />
                <AdminDashboard />
            </ManageLayout>
        );
    }

    const { title, description, actions } = useMemo(() => {
        if (role === 'teacher') {
            const teacherActions: DashboardQuickAction[] = [
                {
                    href: '/manage/posts',
                    label: t('dashboard.teacher.actions.posts.label'),
                    description: t('dashboard.teacher.actions.posts.description'),
                    icon: Megaphone,
                },
                {
                    href: '/manage/labs',
                    label: t('dashboard.teacher.actions.labs.label'),
                    description: t('dashboard.teacher.actions.labs.description'),
                    icon: NotebookPen,
                },
                {
                    href: '/manage/projects',
                    label: t('dashboard.teacher.actions.projects.label'),
                    description: t('dashboard.teacher.actions.projects.description'),
                    icon: BookOpen,
                },
                {
                    href: '/manage/settings/profile',
                    label: t('dashboard.teacher.actions.profile.label'),
                    description: t('dashboard.teacher.actions.profile.description'),
                    icon: Settings,
                },
            ];

            return {
                title: t('dashboard.teacher.title'),
                description: t('dashboard.teacher.description'),
                actions: teacherActions,
            };
        }

        const userActions: DashboardQuickAction[] = [
            {
                href: '/manage/settings/profile',
                label: t('dashboard.user.actions.profile.label'),
                description: t('dashboard.user.actions.profile.description'),
                icon: User,
            },
            {
                href: '/manage/settings/password',
                label: t('dashboard.user.actions.security.label'),
                description: t('dashboard.user.actions.security.description'),
                icon: ShieldCheck,
            },
        ];

        return {
            title: t('dashboard.user.title'),
            description: t('dashboard.user.description'),
            actions: userActions,
        };
    }, [role, t]);

    const breadcrumbs = [{ title: t('layout.breadcrumbs.dashboard'), href: '/manage/dashboard' }];

    return (
        <ManageLayout role={role} breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <DashboardToastContainer toasts={toasts} onDismiss={dismissToast} />

            <section className="space-y-6">
                <DashboardHeroCard
                    badge={{ icon: <LayoutGrid className="h-4 w-4" />, label: t('dashboard.common.manage_center') }}
                    title={title}
                    description={description}
                    action={
                        <Button asChild className="rounded-full px-6">
                            <Link href="/manage/dashboard">{t('dashboard.common.back_to_overview')}</Link>
                        </Button>
                    }
                />

                <DashboardQuickActionsCard
                    title={t('dashboard.common.quick_actions')}
                    actions={actions}
                />
            </section>
        </ManageLayout>
    );
}
