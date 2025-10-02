export type DashboardTrend = 'up' | 'down' | 'flat';

export interface AdminDashboardMetric {
    key: string;
    label?: string;
    value: number;
    delta?: number | null;
    trend?: DashboardTrend;
    unit?: string | null;
    meta?: Record<string, unknown> | null;
}

export interface AdminDashboardActivity {
    id: string;
    type: string;
    title: string;
    status?: string | null;
    timestamp: string | null;
    actor?: string | null;
    href?: string | null;
    icon?: string | null;
    meta?: Record<string, unknown> | null;
}

export interface AdminDashboardQuickLink {
    key: string;
    label?: string;
    description?: string | null;
    href: string;
    icon: string | null;
    ability?: string | null;
}

export interface AdminDashboardTodo {
    key: string;
    label?: string;
    description?: string | null;
    count?: number | null;
    completed: boolean;
    href?: string | null;
}

export interface AdminDashboardData {
    metrics: AdminDashboardMetric[];
    activities: AdminDashboardActivity[];
    quickLinks: AdminDashboardQuickLink[];
    personalTodos: AdminDashboardTodo[];
    generatedAt: string;
}
