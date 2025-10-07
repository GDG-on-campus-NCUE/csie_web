import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CalendarClock, FileText, Inbox } from 'lucide-react';
import type { AdminDashboardTodo } from '@/types/manage';
import { cn } from '@/lib/shared/utils';
import type { TranslatorFn } from '../types';

const todoHighlightIconMap: Record<string, typeof Activity> = {
    review_drafts: FileText,
    review_scheduled: CalendarClock,
    reply_contact: Inbox,
};

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

interface TodoHighlightGridProps {
    todos: AdminDashboardTodo[];
    locale: string;
    t: TranslatorFn;
}

export function TodoHighlightGrid({ todos, locale, t }: TodoHighlightGridProps) {
    if (todos.length === 0) {
        return null;
    }

    return (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {todos.map((todo) => {
                const Icon = todoHighlightIconMap[todo.key] ?? Activity;
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
}
