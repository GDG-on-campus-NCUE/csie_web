import AdminDashboard from '@/components/admin/dashboard/admin-dashboard';
import ManageLayout from '@/layouts/manage/manage-layout';
import { useTranslator } from '@/hooks/use-translator';

export default function ManageAdminDashboard() {
    const { t } = useTranslator('manage');

    const breadcrumbs = [
        { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.admin_dashboard', '系統總覽'), href: '/manage/admin/dashboard' },
    ];

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <AdminDashboard />
        </ManageLayout>
    );
}
