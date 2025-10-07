import type { ReactNode } from 'react';

interface DashboardContentLayoutProps {
    overview: ReactNode;
    highlights: ReactNode;
    activity: ReactNode;
    quickActions: ReactNode;
}

export function DashboardContentLayout({ overview, highlights, activity, quickActions }: DashboardContentLayoutProps) {
    return (
        <div className="space-y-6">
            {overview}
            {highlights}
            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                {activity}
                {quickActions}
            </div>
        </div>
    );
}
