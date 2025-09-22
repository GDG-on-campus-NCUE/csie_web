import AdminDashboard from '@/components/manage/admin/dashboard/admin-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ManageLayout from '@/layouts/manage/manage-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, LayoutGrid, Megaphone, NotebookPen, Settings, ShieldCheck, User } from 'lucide-react';
import { type ComponentType } from 'react';
import { useTranslator } from '@/hooks/use-translator';

type ManageRole = 'admin' | 'manager' | 'teacher' | 'user';

interface QuickAction {
    href: string;
    label: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
}

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const role = (auth?.user?.role ?? 'user') as ManageRole;
    const { t } = useTranslator('manage');

    if (role === 'admin' || role === 'manager') {
        const adminTitle = t('dashboard.admin.title', '系統總覽');
        const breadcrumbs = [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            { title: adminTitle, href: '/manage/dashboard' },
        ];

        return (
            <ManageLayout role={role} breadcrumbs={breadcrumbs}>
                <Head title={adminTitle} />
                <AdminDashboard />
            </ManageLayout>
        );
    }

    const { title, description, actions }: { title: string; description: string; actions: QuickAction[] } =
        role === 'teacher'
            ? {
                  title: t('dashboard.teacher.title'),
                  description: t('dashboard.teacher.description'),
                  actions: [
                      {
                          href: '/manage/teacher/posts',
                          label: t('dashboard.teacher.actions.posts.label'),
                          description: t('dashboard.teacher.actions.posts.description'),
                          icon: Megaphone,
                      },
                      {
                          href: '/manage/teacher/labs',
                          label: t('dashboard.teacher.actions.labs.label'),
                          description: t('dashboard.teacher.actions.labs.description'),
                          icon: NotebookPen,
                      },
                      {
                          href: '/manage/teacher/courses',
                          label: t('dashboard.teacher.actions.courses.label'),
                          description: t('dashboard.teacher.actions.courses.description'),
                          icon: BookOpen,
                      },
                      {
                          href: '/manage/settings/profile',
                          label: t('dashboard.teacher.actions.profile.label'),
                          description: t('dashboard.teacher.actions.profile.description'),
                          icon: Settings,
                      },
                  ],
              }
            : {
                  title: t('dashboard.user.title'),
                  description: t('dashboard.user.description'),
                  actions: [
                      {
                          href: '/manage/settings/profile',
                          label: t('dashboard.user.actions.profile.label'),
                          description: t('dashboard.user.actions.profile.description'),
                          icon: User,
                      },
                      {
                          href: '/manage/settings/password',
                          label: t('dashboard.user.actions.security.label'),
                          description: t('dashboard.user.actions.security.description'),
                          icon: ShieldCheck,
                      },
                  ],
              };

    const breadcrumbs = [{ title: t('layout.breadcrumbs.dashboard'), href: '/manage/dashboard' }];

    return (
        <ManageLayout role={role} breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <section className="space-y-6">
                <div className="rounded-3xl bg-white px-6 py-8 shadow-sm ring-1 ring-black/5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                <LayoutGrid className="h-4 w-4" />
                                {t('dashboard.common.manage_center')}
                            </span>
                            <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
                            <p className="max-w-2xl text-sm text-slate-600">{description}</p>
                        </div>
                        <Button asChild className="rounded-full px-6">
                            <Link href="/manage/dashboard">{t('dashboard.common.back_to_overview')}</Link>
                        </Button>
                    </div>
                </div>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-900">
                            {t('dashboard.common.quick_actions')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        {actions.map(({ href, label, description, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className="group flex flex-col gap-3 rounded-2xl border border-transparent bg-slate-50 px-5 py-4 text-left shadow-sm transition hover:border-slate-200 hover:bg-white"
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
            </section>
        </ManageLayout>
    );
}
