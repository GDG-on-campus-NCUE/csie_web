import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/shared/utils';
import type { AdminDashboardQuickLink, AdminDashboardTodo, ManageAbilityMap } from '@/types/manage';
import { Activity, AlertTriangle, ArrowUpRight, CheckCircle2, Clock3, Megaphone, Newspaper, UploadCloud, UserPlus } from 'lucide-react';
import { Link } from '@inertiajs/react';
import type { TranslatorFn } from '../types';

const quickLinkIconMap: Record<string, typeof Activity> = {
    create_post: Megaphone,
    view_posts: Newspaper,
    invite_teacher: UserPlus,
    upload_attachment: UploadCloud,
};

const emptyStateIconMap = {
    completed: CheckCircle2,
    pending: AlertTriangle,
} satisfies Record<'completed' | 'pending', typeof Activity>;

interface QuickActionsPanelProps {
    quickLinks: AdminDashboardQuickLink[];
    todos: AdminDashboardTodo[];
    abilities: ManageAbilityMap;
    locale: string;
    t: TranslatorFn;
}

const formatNumber = (value: number, locale: string) => new Intl.NumberFormat(locale).format(value);

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

export function QuickActionsPanel({ quickLinks, todos, abilities, locale, t }: QuickActionsPanelProps) {
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
                            const Icon = quickLinkIconMap[link.key] ?? Activity;

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
}
