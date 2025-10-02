import type { AdminDashboardData, ManageAbilityMap, SpaceOption } from '../manage';
import type { Auth } from './user';

export interface FlashMessages {
    success?: string | string[] | null;
    error?: string | string[] | null;
    warning?: string | string[] | null;
    info?: string | string[] | null;
    [key: string]: string | string[] | null | undefined;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    locale?: string;
    locales?: string[];
    i18n?: Record<string, unknown>;
    adminDashboard?: AdminDashboardData | null;
    flash?: FlashMessages;
    abilities?: ManageAbilityMap;
    spaces?: SpaceOption[];
    [key: string]: unknown;
}
