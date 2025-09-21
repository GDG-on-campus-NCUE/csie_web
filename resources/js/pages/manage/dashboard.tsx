import AdminDashboard from '@/components/admin/dashboard/admin-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ManageLayout from '@/layouts/manage/manage-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, LayoutGrid, Megaphone, NotebookPen, Settings, ShieldCheck, User } from 'lucide-react';
import { type ComponentType } from 'react';
import { useTranslator } from '@/hooks/use-translator';

type ManageRole = 'admin' | 'teacher' | 'user';

interface QuickAction {
    href: string;
    label: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
}

export default function Dashboard() {
    const { auth, locale } = usePage<SharedData>().props;
    const role = (auth?.user?.role ?? 'user') as ManageRole;
    const isZh = locale?.toLowerCase() === 'zh-tw';
    const { t } = useTranslator('manage');

    if (role === 'admin') {
        const breadcrumbs = [
            { title: t('layout.breadcrumbs.dashboard', isZh ? '管理首頁' : 'Management'), href: '/manage/dashboard' },
            { title: t('layout.breadcrumbs.admin_dashboard', isZh ? '系統總覽' : 'System overview'), href: '/manage/admin/dashboard' },
        ];

        return (
            <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
                <AdminDashboard />
            </ManageLayout>
        );
    }

    const { title, description, actions }: { title: string; description: string; actions: QuickAction[] } =
        role === 'teacher'
            ? {
                  title: t('dashboard.teacher.title', isZh ? '教學管理首頁' : 'Teaching workspace'),
                  description: t('dashboard.teacher.description',
                      isZh
                          ? '快速進入公告、研究與課程管理，掌握日常教學事項。'
                          : 'Access announcements, research updates, and course tools in one place.'
                  ),
                  actions: [
                      {
                          href: '/manage/teacher/posts',
                          label: t('dashboard.teacher.actions.posts.label', isZh ? '公告管理' : 'Announcements'),
                          description: t(
                              'dashboard.teacher.actions.posts.description',
                              isZh ? '發布與維護系上公告與活動資訊' : 'Publish and maintain department updates',
                          ),
                          icon: Megaphone,
                      },
                      {
                          href: '/manage/teacher/labs',
                          label: t('dashboard.teacher.actions.labs.label', isZh ? '研究管理' : 'Research overview'),
                          description: t(
                              'dashboard.teacher.actions.labs.description',
                              isZh ? '調整實驗室介紹與研究成果' : 'Update lab profiles and research highlights',
                          ),
                          icon: NotebookPen,
                      },
                      {
                          href: '/manage/teacher/courses',
                          label: t('dashboard.teacher.actions.courses.label', isZh ? '課程與活動' : 'Courses & events'),
                          description: t(
                              'dashboard.teacher.actions.courses.description',
                              isZh ? '管理課程資訊與活動排程' : 'Organise course details and timelines',
                          ),
                          icon: BookOpen,
                      },
                      {
                          href: '/settings/profile',
                          label: t('dashboard.teacher.actions.profile.label', isZh ? '個人設定' : 'Profile settings'),
                          description: t(
                              'dashboard.teacher.actions.profile.description',
                              isZh ? '更新聯絡方式與公開資訊' : 'Update contact and public information',
                          ),
                          icon: Settings,
                      },
                  ],
              }
            : {
                  title: t('dashboard.user.title', isZh ? '會員專區' : 'Member dashboard'),
                  description: t(
                      'dashboard.user.description',
                      isZh ? '集中管理個人資料、外觀偏好與安全設定。' : 'Manage your profile, appearance preferences, and security in one view.',
                  ),
                  actions: [
                      {
                          href: '/settings/profile',
                          label: t('dashboard.user.actions.profile.label', isZh ? '更新個人資料' : 'Update profile'),
                          description: t(
                              'dashboard.user.actions.profile.description',
                              isZh ? '調整基本資料與聯絡方式' : 'Edit your personal and contact details',
                          ),
                          icon: User,
                      },
                      {
                          href: '/settings/password',
                          label: t('dashboard.user.actions.security.label', isZh ? '安全設定' : 'Security settings'),
                          description: t(
                              'dashboard.user.actions.security.description',
                              isZh ? '更新密碼並檢視登入紀錄' : 'Update your password and review login history',
                          ),
                          icon: ShieldCheck,
                      },
                  ],
              };

    const breadcrumbs = [{ title: t('layout.breadcrumbs.dashboard', isZh ? '管理首頁' : 'Management'), href: '/manage/dashboard' }];

    return (
        <ManageLayout role={role} breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <section className="space-y-6">
                <div className="rounded-3xl bg-white px-6 py-8 shadow-sm ring-1 ring-black/5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#151f54]/10 px-3 py-1 text-xs font-semibold text-[#151f54]">
                                <LayoutGrid className="h-4 w-4" />
                                {t('dashboard.common.manage_center', isZh ? '管理中心' : 'Manage Center')}
                            </span>
                            <h1 className="text-3xl font-semibold text-[#151f54]">{title}</h1>
                            <p className="max-w-2xl text-sm text-slate-600">{description}</p>
                        </div>
                        <Button asChild className="rounded-full bg-[#151f54] px-6 text-white shadow-sm hover:bg-[#1f2a6d]">
                            <Link href="/manage/dashboard">{t('dashboard.common.back_to_overview', isZh ? '回到管理首頁' : 'Back to overview')}</Link>
                        </Button>
                    </div>
                </div>

                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-[#151f54]">
                            {t('dashboard.common.quick_actions', isZh ? '常用操作' : 'Quick actions')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        {actions.map(({ href, label, description, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className="group flex flex-col gap-3 rounded-2xl border border-transparent bg-[#f7f8fc] px-5 py-4 text-left shadow-sm transition hover:border-[#151f54]/20 hover:bg-white"
                            >
                                <span className="inline-flex items-center gap-2 text-sm font-medium text-[#151f54]">
                                    <span className="inline-flex size-8 items-center justify-center rounded-xl bg-white text-[#151f54] shadow-sm">
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
