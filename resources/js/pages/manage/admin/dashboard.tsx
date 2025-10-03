import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import type {
    AdminDashboardActivity,
    AdminDashboardData,
    AdminDashboardMetric,
    AdminDashboardQuickLink,
    AdminDashboardTodo,
    ManageAbilityMap,
} from '@/types/manage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/shared/utils';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity as ActivityIcon,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    CalendarClock,
    CheckCircle2,
    Clock3,
    FileText,
    Inbox,
    Megaphone,
    Minus,
    Newspaper,
    Server,
    UploadCloud,
    UserPlus,
    Users,
    type LucideIcon,
} from 'lucide-react';
import type { ReactElement } from 'react';

type AdminDashboardPageProps = SharedData & {
    dashboard?: AdminDashboardData | null;
    abilities?: ManageAbilityMap;
};

type TranslatorFn = ReturnType<typeof useTranslator>['t'];

const metricIconMap: Record<string, LucideIcon> = {
    total_posts: Megaphone,
    draft_posts: FileText,
    scheduled_posts: CalendarClock,
    total_users: Users,
    storage_usage: Server,
};

const quickLinkIconMap: Record<string, LucideIcon> = {
    create_post: Megaphone,
    view_posts: Newspaper,
    invite_teacher: UserPlus,
    upload_attachment: UploadCloud,
};

const activityIconMap: Record<string, LucideIcon> = {
    post: Megaphone,
    contact: Inbox,
};

const emptyStateIconMap: Record<'completed' | 'pending', LucideIcon> = {
    completed: CheckCircle2,
    pending: AlertTriangle,
};

const formatNumber = (value: number, locale: string) => new Intl.NumberFormat(locale).format(value);

const formatBytes = (value: number, locale: string) => {
    if (! Number.isFinite(value) || value <= 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    const num = value / 1024 ** exponent;

    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: num >= 100 ? 0 : 1 }).format(num)} ${units[exponent]}`;
};

const formatDateTime = (value: string | null | undefined, locale: string) => {
    if (! value) {
        return '';
    }

    return new Date(value).toLocaleString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const resolveDeltaLabel = (delta?: number | null) => {
    if (delta === undefined || delta === null) {
        return null;
    }

    return delta > 0 ? `+${delta}` : `${delta}`;
};

const OverviewCards = ({ metrics, locale, t }: { metrics: AdminDashboardMetric[]; locale: string; t: TranslatorFn }) => (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => {
            const Icon = metricIconMap[metric.key] ?? ActivityIcon;
            const meta = (metric.meta ?? {}) as Record<string, unknown>;
            const displayValue = metric.unit === '%'
                ? `${Number.isFinite(metric.value) ? metric.value.toFixed(1) : metric.value}%`
                : formatNumber(metric.value, locale);
            const deltaLabel = resolveDeltaLabel(metric.delta);
            const isPositive = (metric.trend ?? 'flat') === 'up' && (metric.delta ?? 0) > 0;
            const isNegative = (metric.trend ?? 'flat') === 'down' && (metric.delta ?? 0) < 0;

            const usageSummary = metric.key === 'storage_usage'
                ? formatBytes((meta.usedBytes as number) ?? 0, locale)
                : null;
            const usageCapacity = metric.key === 'storage_usage'
                ? formatBytes((meta.capacityBytes as number) ?? 0, locale)
                : null;

            return (
                <Card key={metric.key} className="border border-neutral-200/60 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                        <div className="flex flex-1 flex-col gap-1">
                            <CardTitle className="text-sm font-medium text-neutral-600">
                                {t(`admin.metrics.${metric.key}`, metric.label ?? metric.key)}
                            </CardTitle>
                            <div className="text-2xl font-bold text-neutral-900">{displayValue}</div>
                        </div>
                        <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
                            <Icon className="h-4 w-4" />
                        </span>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-neutral-500">
                        {metric.key === 'storage_usage' && usageSummary && usageCapacity ? (
                            <div className="space-y-3">
                                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                                        style={{ width: `${Math.min(100, Math.max(0, metric.value))}%` }}
                                    />
                                </div>
                                <p className="font-medium text-neutral-600">
                                    {t('admin.storage.summary', `${usageSummary} / ${usageCapacity}`, {
                                        used: usageSummary,
                                        capacity: usageCapacity,
                                    })}
                                </p>
                            </div>
                        ) : null}
                        {deltaLabel ? (
                            <div className="flex items-center gap-1 text-[11px]">
                                {isPositive ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : null}
                                {isNegative ? <ArrowDownRight className="h-3 w-3 text-rose-500" /> : null}
                                {!isPositive && !isNegative ? <Minus className="h-3 w-3 text-neutral-400" /> : null}
                                <span className={cn('font-medium', {
                                    'text-emerald-600': isPositive,
                                    'text-rose-600': isNegative,
                                })}
                                >
                                    {deltaLabel}
                                </span>
                                <span className="text-neutral-500">
                                    {t('admin.metrics.delta_label', 'vs last week')}
                                </span>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            );
        })}
    </section>
);

const RecentActivities = ({
    activities,
    locale,
    t,
    tManage,
}: {
    activities: AdminDashboardActivity[];
    locale: string;
    t: TranslatorFn;
    tManage: TranslatorFn;
}) => (
    <Card className="border border-neutral-200/60 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
            <div className="flex flex-col">
                <CardTitle className="text-base font-bold text-neutral-900">
                    {t('admin.activities.title', 'Recent activity')}
                </CardTitle>
                <span className="text-xs text-neutral-500">
                    {t('admin.activities.subtitle', 'Latest announcements and contact messages.')}
                </span>
            </div>
            <Badge variant="outline" className="gap-2 text-xs text-neutral-500">
                <ActivityIcon className="h-3.5 w-3.5" />
                {t('common.quick_actions', 'Quick actions')}
            </Badge>
        </CardHeader>
        <CardContent>
            {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-200 bg-neutral-50/70 p-6 text-center">
                    <Inbox className="h-8 w-8 text-neutral-400" />
                    <p className="text-sm text-neutral-500">
                        {t('admin.activities.empty', 'No activity yet.')}
                    </p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {activities.map((activity) => {
                        const Icon = activityIconMap[activity.type] ?? ActivityIcon;
                        const statusLabel = activity.status
                            ? tManage(`posts.status.${activity.status}`, activity.status)
                            : null;

                        return (
                            <li key={activity.id} className="flex gap-3 rounded-lg border border-neutral-200/60 bg-neutral-50/50 p-3 transition-colors hover:bg-neutral-50">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <Icon className="h-4 w-4" />
                                </span>
                                <div className="flex flex-1 flex-col gap-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {activity.href ? (
                                            <Link
                                                href={activity.href}
                                                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                            >
                                                {activity.title}
                                            </Link>
                                        ) : (
                                            <span className="text-sm font-semibold text-neutral-900">{activity.title}</span>
                                        )}
                                        {statusLabel ? (
                                            <Badge variant="outline" className="text-xs capitalize text-neutral-500">
                                                {statusLabel}
                                            </Badge>
                                        ) : null}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                                        {activity.actor ? (
                                            <span>{activity.actor}</span>
                                        ) : null}
                                        {activity.timestamp ? (
                                            <span>{formatDateTime(activity.timestamp, locale)}</span>
                                        ) : null}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </CardContent>
    </Card>
);

const QuickActions = ({
    quickLinks,
    todos,
    abilities,
    locale,
    t,
}: {
    quickLinks: AdminDashboardQuickLink[];
    todos: AdminDashboardTodo[];
    abilities: ManageAbilityMap;
    locale: string;
    t: TranslatorFn;
}) => {
    const visibleQuickLinks = quickLinks.filter((link) => !link.ability || abilities[link.ability]);

    return (
        <Card className="border border-neutral-200/60 bg-white shadow-sm">
            <CardHeader className="flex flex-col gap-2 pb-4">
                <CardTitle className="text-base font-bold text-neutral-900">
                    {t('admin.quick_actions.title', 'Quick actions')}
                </CardTitle>
                <span className="text-xs text-neutral-500">
                    {t('admin.quick_actions.description', 'Recommended shortcuts based on your permissions.')}
                </span>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    {visibleQuickLinks.length === 0 ? (
                        <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50/70 p-4 text-center text-xs text-neutral-500">
                            {t('admin.quick_actions.empty', 'No quick actions available.')}
                        </div>
                    ) : (
                        visibleQuickLinks.map((link) => {
                            const Icon = quickLinkIconMap[link.key] ?? ActivityIcon;

                            return (
                                <Link
                                    key={link.key}
                                    href={link.href}
                                    className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200/60 bg-white px-4 py-3 text-sm text-neutral-700 transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="rounded-full bg-blue-50 p-2 text-blue-600">
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-neutral-900">
                                                {t(`admin.quick_actions.${link.key}.label`, link.label ?? link.key)}
                                            </span>
                                            <span className="text-xs text-neutral-500">
                                                {t(`admin.quick_actions.${link.key}.description`, link.description ?? '')}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-neutral-400" />
                                </Link>
                            );
                        })
                    )}
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        {t('admin.todos.title', 'Personal checklist')}
                    </p>
                    <ul className="space-y-2">
                        {todos.length === 0 ? (
                            <li className="rounded-md border border-dashed border-neutral-200 bg-neutral-50/70 p-3 text-center text-xs text-neutral-500">
                                {t('admin.todos.empty', 'All clear, nothing queued!')}
                            </li>
                        ) : (
                            todos.map((todo) => {
                                const statusKey = todo.completed ? 'completed' : 'pending';
                                const StatusIcon = emptyStateIconMap[statusKey];
                                const color = todo.completed ? 'text-emerald-600' : 'text-amber-500';
                                const label = t(`admin.todos.${todo.key}.label`, todo.label ?? todo.key);
                                const description = t(`admin.todos.${todo.key}.description`, todo.description ?? '', {
                                    count: todo.count ?? 0,
                                });

                                return (
                                    <li
                                        key={todo.key}
                                        className="flex items-start gap-3 rounded-lg border border-neutral-200/60 bg-white px-3 py-2 text-xs text-neutral-600"
                                    >
                                        <StatusIcon className={cn('mt-0.5 h-4 w-4', color)} />
                                        <div className="flex flex-1 flex-col">
                                            <span className="font-semibold text-neutral-900">{label}</span>
                                            {description ? <span>{description}</span> : null}
                                        </div>
                                        {typeof todo.count === 'number' ? (
                                            <span className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-500">
                                                {formatNumber(todo.count, locale)}
                                            </span>
                                        ) : null}
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>

                <Button variant="outline" size="sm" asChild>
                    <Link href={visibleQuickLinks[0]?.href ?? '/manage/dashboard'} className="gap-2">
                        <Clock3 className="h-4 w-4" />
                        {t('admin.quick_actions.manage', 'Go to management center')}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
};

export default function ManageAdminDashboard() {
    const page = usePage<AdminDashboardPageProps>();
    const dashboard = page.props.dashboard ?? null;
    const abilities = page.props.abilities ?? {};
    const locale = page.props.locale ?? 'zh-TW';

    const { t } = useTranslator('manage.dashboard');
    const { t: tManage } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: tManage('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: tManage('layout.breadcrumbs.admin_dashboard', '系統總覽'),
            href: '/manage/dashboard',
        },
    ];

    const pageTitle = t('admin.title', '系統總覽');
    const pageDescription = t('admin.description', '即時掌握公告、附件與聯絡訊息狀態，協助團隊快速行動。');

    return (
        <ManagePage title={pageTitle} description={pageDescription} breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />
            {!dashboard ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 p-10 text-center">
                    <Inbox className="h-10 w-10 text-neutral-400" />
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold text-neutral-800">{t('admin.empty.title', 'Dashboard data unavailable')}</h2>
                        <p className="text-sm text-neutral-500">{t('admin.empty.description', 'Ensure backend metrics are configured.')}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <OverviewCards metrics={dashboard.metrics} locale={locale} t={t} />
                    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                        <RecentActivities activities={dashboard.activities} locale={locale} t={t} tManage={tManage} />
                        <QuickActions quickLinks={dashboard.quickLinks} todos={dashboard.personalTodos} abilities={abilities} locale={locale} t={t} />
                    </div>
                </div>
            )}
        </ManagePage>
    );
}

ManageAdminDashboard.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
