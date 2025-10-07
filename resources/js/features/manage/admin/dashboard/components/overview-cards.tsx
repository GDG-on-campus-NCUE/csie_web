import { StatCard } from '@/components/manage/stat-card';
import { formatBytes } from '@/lib/shared/format';
import { Activity, CalendarClock, FileText, Megaphone, Server, Users } from 'lucide-react';
import type { AdminDashboardMetric } from '@/types/manage';
import type { TranslatorFn } from '../types';

const metricIconMap: Record<string, typeof Activity> = {
    total_posts: Megaphone,
    draft_posts: FileText,
    scheduled_posts: CalendarClock,
    total_users: Users,
    storage_usage: Server,
};

interface OverviewCardsProps {
    metrics: AdminDashboardMetric[];
    locale: string;
    t: TranslatorFn;
}

const formatNumber = (value: number, locale: string) => new Intl.NumberFormat(locale).format(value);

export function OverviewCards({ metrics, locale, t }: OverviewCardsProps) {
    return (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
                const Icon = metricIconMap[metric.key] ?? Activity;
                const meta = (metric.meta ?? {}) as Record<string, unknown>;
                const displayValue = metric.unit === '%'
                    ? `${Number.isFinite(metric.value) ? metric.value.toFixed(1) : metric.value}%`
                    : formatNumber(metric.value, locale);

                const usageSummary = metric.key === 'storage_usage'
                    ? formatBytes((meta.usedBytes as number) ?? 0, locale)
                    : null;
                const usageCapacity = metric.key === 'storage_usage'
                    ? formatBytes((meta.capacityBytes as number) ?? 0, locale)
                    : null;

                return (
                    <StatCard
                        key={metric.key}
                        title={t(`admin.metrics.${metric.key}`, metric.label ?? metric.key)}
                        value={displayValue}
                        icon={Icon}
                        trend={metric.trend ?? 'flat'}
                        delta={metric.delta ?? undefined}
                        deltaLabel={t('admin.metrics.delta_label', 'vs last week')}
                        suffix={metric.unit === '%' ? '' : undefined}
                    >
                        {metric.key === 'storage_usage' && usageSummary && usageCapacity ? (
                            <div className="space-y-2">
                                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                                        style={{ width: `${Math.min(100, Math.max(0, metric.value))}%` }}
                                    />
                                </div>
                                <p className="text-xs font-medium text-neutral-600">
                                    {usageSummary} / {usageCapacity}
                                </p>
                            </div>
                        ) : null}
                    </StatCard>
                );
            })}
        </section>
    );
}
