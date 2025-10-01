import AppLayout from '@/layouts/app-layout';
import ManageDashboardPage from '@/layouts/manage/manage-dashboard-page';
import type { ReactElement } from 'react';

export default function ManageDashboard() {
    return <ManageDashboardPage />;
}

ManageDashboard.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
