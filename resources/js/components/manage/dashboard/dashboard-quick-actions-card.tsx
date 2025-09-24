import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { type ComponentType } from 'react';

// 快速操作區塊，集中管理各角色的快捷連結樣式與互動行為。
export interface DashboardQuickAction {
    href: string;
    label: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
}

interface DashboardQuickActionsCardProps {
    title: string;
    actions: DashboardQuickAction[];
}

export function DashboardQuickActionsCard({ title, actions }: DashboardQuickActionsCardProps) {
    if (actions.length === 0) {
        return null;
    }

    return (
        <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                {actions.map(({ href, label, description, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className="group flex flex-col gap-3 rounded-2xl border border-transparent bg-slate-50 px-5 py-4 text-left shadow-sm transition hover:border-slate-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60"
                    >
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                            <span className="inline-flex size-8 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                                <Icon className="h-4 w-4" />
                            </span>
                            {label}
                        </span>
                        <span className="text-sm text-slate-600">{description}</span>
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}

export default DashboardQuickActionsCard;
