import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { useTranslator } from '@/hooks/use-translator';
import { formatDateTime, formatBytes } from '@/lib/shared/format';
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
import TableEmpty from '@/components/manage/table-empty';
import { StatCard } from '@/components/manage/stat-card';
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
    Mail,
    Megaphone,
    Minus,
    Paperclip,
    Newspaper,
    Pin,
    Server,
    Tag,
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

const activityToneMap: Record<string, { iconBg: string; iconColor: string; border: string }> = {
    post: {
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        border: 'border-blue-100',
    },
    contact: {
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        border: 'border-emerald-100',
    },
};

const postStatusBadgeClass: Record<string, string> = {
    draft: 'border-blue-200 bg-blue-50 text-blue-700',
    scheduled: 'border-amber-200 bg-amber-50 text-amber-700',
    published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    hidden: 'border-neutral-200 bg-neutral-100 text-neutral-600',
    archived: 'border-rose-200 bg-rose-50 text-rose-700',
};

const contactStatusBadgeClass: Record<string, string> = {
    new: 'border-rose-200 bg-rose-50 text-rose-700',
    in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
    resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    spam: 'border-neutral-200 bg-neutral-100 text-neutral-600',
};

const todoHighlightIconMap: Record<string, LucideIcon> = {
    review_drafts: FileText,
    review_scheduled: CalendarClock,
    reply_contact: Inbox,
};

const formatNumber = (value: number, locale: string) => new Intl.NumberFormat(locale).format(value);

const resolveDeltaLabel = (delta?: number | null) => {
    if (delta === undefined || delta === null) {
        return null;
    }

    return delta > 0 ? `+${delta}` : `${delta}`;
};

const OverviewCards = ({ metrics, locale, t }: { metrics: AdminDashboardMetric[]; locale: string; t: TranslatorFn }) => (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
            const Icon = metricIconMap[metric.key] ?? ActivityIcon;
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

const RecentActivities = ({
    activities,
    locale,
    t,
    tManage,
    tMessages,
}: {
    activities: AdminDashboardActivity[];
    locale: string;
    t: TranslatorFn;
    tManage: TranslatorFn;
    tMessages: TranslatorFn;
}) => (
    <Card className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
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
                <TableEmpty
                    icon={<Inbox className="h-7 w-7" aria-hidden="true" />}
                    title={t('admin.activities.empty', 'No activity yet.')}
                    description={t(
                        'admin.activities.empty_description',
                        '活動紀錄尚未建立，完成公告或回覆訊息後即可在此追蹤狀態。'
                    )}
                />
            ) : (
                <ul className="space-y-4">
                    {activities.map((activity) => {
                        const Icon = activityIconMap[activity.type] ?? ActivityIcon;
                        const tone = activityToneMap[activity.type] ?? {
                            iconBg: 'bg-blue-100',
                            iconColor: 'text-blue-600',
                            border: 'border-neutral-200/60',
                        };
                        const statusLabel = (() => {
                            if (!activity.status) {
                                return null;
                            }

                            if (activity.type === 'post') {
                                return tManage(`posts.status.${activity.status}`, activity.status);
                            }

                            if (activity.type === 'contact') {
                                return tMessages(`status.${activity.status}`, activity.status);
                            }

                            return activity.status;
                        })();
                        const statusClass = (() => {
                            if (!activity.status) {
                                return 'border-neutral-200 bg-neutral-100 text-neutral-600';
                            }

                            if (activity.type === 'post') {
                                return postStatusBadgeClass[activity.status] ?? 'border-neutral-200 bg-neutral-100 text-neutral-600';
                            }

                            if (activity.type === 'contact') {
                                return contactStatusBadgeClass[activity.status] ?? 'border-neutral-200 bg-neutral-100 text-neutral-600';
                            }

                            return 'border-neutral-200 bg-neutral-100 text-neutral-600';
                        })();

                        const metaItems: { icon: ReactElement; label: string; value: string }[] = [];

                        if (activity.type === 'post') {
                            const category = (activity.meta?.category as string) ?? null;
                            const attachments = Number(activity.meta?.attachments ?? 0);
                            const pinned = Boolean(activity.meta?.pinned);

                            if (category) {
                                metaItems.push({
                                    icon: <Tag className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />,
                                    label: t('admin.activities.category', '分類'),
                                    value: category,
                                });
                            }

                            if (attachments > 0) {
                                metaItems.push({
                                    icon: <Paperclip className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />,
                                    label: t('admin.activities.attachments', '附件'),
                                    value: `${attachments}`,
                                });
                            }

                            if (pinned) {
                                metaItems.push({
                                    icon: <Pin className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />,
                                    label: t('admin.activities.pinned', '置頂'),
                                    value: t('admin.activities.pinned_yes', '已置頂'),
                                });
                            }
                        }

                        if (activity.type === 'contact') {
                            const email = (activity.meta?.email as string) ?? null;
                            if (email) {
                                metaItems.push({
                                    icon: <Mail className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />,
                                    label: t('admin.activities.email', 'Email'),
                                    value: email,
                                });
                            }
                        }

                        return (
                            <li
                                key={activity.id}
                                className={cn(
                                    'flex gap-3 rounded-lg border bg-neutral-50/50 p-3 transition-colors hover:bg-white',
                                    tone.border
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm',
                                        tone.iconBg,
                                        tone.iconColor
                                    )}
                                >
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
                                            <Badge variant="outline" className={cn('text-xs capitalize', statusClass)}>
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
                                        {metaItems.length > 0 ? (
                                            <span className="hidden text-neutral-300 md:inline">•</span>
                                        ) : null}
                                        {metaItems.map((item, index) => (
                                            <span
                                                key={`${activity.id}-${index}`}
                                                className="flex items-center gap-1 text-neutral-500"
                                            >
                                                {item.icon}
                                                <span>{item.value}</span>
                                            </span>
                                        ))}
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

const resolveTodoCopy = (
    todo: AdminDashboardTodo,
    t: TranslatorFn
): { statusKey: 'completed' | 'pending'; label: string; description: string } => {
    const statusKey = todo.completed ? 'completed' : 'pending';
    const label = t(`admin.todos.${todo.key}.label`, todo.label ?? todo.key);
    const fallbackLegacyDescription = t(
        `admin.todos.${todo.key}.description`,
        todo.description ?? '',
        {
            count: todo.count ?? 0,
        }
    );
    const description = t(
        `admin.todos.${todo.key}.${statusKey}`,
        fallbackLegacyDescription,
        {
            count: todo.count ?? 0,
        }
    );

    return {
        statusKey,
        label,
        description,
    };
};

const KeyHighlights = ({
    todos,
    locale,
    t,
}: {
    todos: AdminDashboardTodo[];
    locale: string;
    t: TranslatorFn;
}) => {
    if (todos.length === 0) {
        return null;
    }

    return (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {todos.map((todo) => {
                const Icon = todoHighlightIconMap[todo.key] ?? ActivityIcon;
                const { statusKey, label, description } = resolveTodoCopy(todo, t);
                const palette = todo.completed
                    ? {
                          border: 'border-emerald-200/70',
                          background: 'bg-emerald-50/50',
                          icon: 'text-emerald-600',
                          badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
                      }
                    : {
                          border: 'border-amber-200/70',
                          background: 'bg-amber-50/50',
                          icon: 'text-amber-600',
                          badge: 'border-amber-200 bg-amber-50 text-amber-700',
                      };

                return (
                    <Card
                        key={todo.key}
                        className={cn(
                            'rounded-xl border shadow-sm transition-all hover:shadow-md',
                            palette.border,
                            palette.background
                        )}
                    >
                        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-semibold text-neutral-800">{label}</CardTitle>
                                <p className="text-xs text-neutral-600">{description}</p>
                            </div>
                            <span className={cn('rounded-full bg-white/80 p-2 shadow-sm', palette.icon)}>
                                <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-neutral-900">
                                {formatNumber(todo.count ?? 0, locale)}
                            </div>
                            <Badge variant="outline" className={cn('text-xs font-semibold capitalize', palette.badge)}>
                                {statusKey === 'completed'
                                    ? t('admin.todos.status.completed', '已完成')
                                    : t('admin.todos.status.pending', '待處理')}
                            </Badge>
                        </CardContent>
                    </Card>
                );
            })}
        </section>
    );
};

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
        <Card className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
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
                                    className="flex items-center justify-between gap-4 rounded-lg border border-blue-200/80 bg-gradient-to-r from-blue-50/80 to-blue-50/40 px-4 py-3 text-sm text-neutral-700 shadow-sm transition-all hover:border-blue-300 hover:from-blue-100/80 hover:to-blue-50/60 hover:shadow-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="rounded-full bg-blue-100 p-2 text-blue-600 shadow-sm">
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
                                const { statusKey, label, description } = resolveTodoCopy(todo, t);
                                const StatusIcon = emptyStateIconMap[statusKey];
                                const color = todo.completed ? 'text-emerald-600' : 'text-amber-500';

                                return (
                                    <li
                                        key={todo.key}
                                        className="flex items-start gap-3 rounded-lg border border-neutral-200/70 bg-white px-3 py-2 text-xs text-neutral-600"
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

                <Button
                    variant="default"
                    size="sm"
                    asChild
                    className="w-full bg-[#1E293B] text-white shadow-sm hover:bg-[#0F172A] hover:shadow-md"
                >
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
    const { t: tMessages } = useTranslator('manage.messages');

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
                    <KeyHighlights todos={dashboard.personalTodos} locale={locale} t={t} />
                    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                        <RecentActivities activities={dashboard.activities} locale={locale} t={t} tManage={tManage} tMessages={tMessages} />
                        <QuickActions quickLinks={dashboard.quickLinks} todos={dashboard.personalTodos} abilities={abilities} locale={locale} t={t} />
                    </div>
                </div>
            )}
        </ManagePage>
    );
}

ManageAdminDashboard.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
