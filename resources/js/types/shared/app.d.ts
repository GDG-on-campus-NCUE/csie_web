import type { AdminDashboardData } from '../manage/dashboard';
import type { Auth } from './user';

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    locale?: string;
    locales?: string[];
    i18n?: Record<string, any>;
    adminDashboard?: AdminDashboardData | null;
    [key: string]: unknown;
}
