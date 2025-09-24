import { type ReactNode } from 'react';

// 儀表板標題區塊，統一管理徽章、標題、描述與操作按鈕的排版樣式。
interface DashboardHeroCardProps {
    badge?: {
        icon?: ReactNode;
        label: string;
    };
    title: string;
    description: string;
    action?: ReactNode;
}

export function DashboardHeroCard({ badge, title, description, action }: DashboardHeroCardProps) {
    return (
        <div className="rounded-3xl bg-white px-6 py-8 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    {badge && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {badge.icon}
                            {badge.label}
                        </span>
                    )}
                    <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
                    <p className="max-w-2xl text-sm text-slate-600">{description}</p>
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
            </div>
        </div>
    );
}

export default DashboardHeroCard;
