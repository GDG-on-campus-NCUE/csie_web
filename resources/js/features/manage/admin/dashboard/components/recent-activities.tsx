import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TableEmpty from '@/components/manage/table-empty';
import { formatDateTime } from '@/lib/shared/format';
import { cn } from '@/lib/shared/utils';
import type { AdminDashboardActivity } from '@/types/manage';
import type { TranslatorFn } from '../types';
import { Activity as ActivityIcon, Inbox, Mail, Megaphone, Paperclip, Pin, Tag } from 'lucide-react';
import { Link } from '@inertiajs/react';
import type { ReactElement } from 'react';

const activityIconMap: Record<string, typeof ActivityIcon> = {
    post: Megaphone,
    contact: Inbox,
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

interface RecentActivitiesProps {
    activities: AdminDashboardActivity[];
    locale: string;
    t: TranslatorFn;
    tManage: TranslatorFn;
    tMessages: TranslatorFn;
}

export function RecentActivities({ activities, locale, t, tManage, tMessages }: RecentActivitiesProps) {
    return (
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
                <Badge variant="outline" className="gap-2 text-xs text-neutral-100">
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
}
