import AdminDashboard from '@/components/manage/admin/dashboard/admin-dashboard';
import ManageLayout from '@/layouts/manage/manage-layout';
import { Head } from '@inertiajs/react';
import { useTranslator } from '@/hooks/use-translator';

export default function ManageAdminDashboard() {
    const { t } = useTranslator('manage');
    const title = t('dashboard.admin.title', '系統總覽');
    const breadcrumbs = [
        { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
        { title, href: '/manage/dashboard' },
    ];

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <AdminDashboard />
        </ManageLayout>
    );
}
