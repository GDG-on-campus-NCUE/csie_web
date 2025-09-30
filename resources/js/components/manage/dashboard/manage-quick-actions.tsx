import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RoleGuard from '@/components/manage/guards/role-guard';
import { usePermission, useRoleInfo } from '@/components/manage/utils/permission-utils';
import { QuickActionSection, type QuickActionItem } from '@/components/manage/dashboard/quick-action-section';
import { useTranslator } from '@/hooks/use-translator';
import { Users, Megaphone, Beaker, School, Settings, FileText, Mail, GraduationCap, NotebookPen } from 'lucide-react';

export default function ManageQuickActions() {
    const { t } = useTranslator('manage');
    const { role } = useRoleInfo();

    const canManageUsers = usePermission('MANAGE_USERS');
    const canManagePosts = usePermission('MANAGE_POSTS');
    const canManageLabs = usePermission('MANAGE_LABS');
    const canManageClassrooms = usePermission('MANAGE_CLASSROOMS');
    const canManageAcademics = usePermission('MANAGE_ACADEMICS');
    const canManageProjects = usePermission('MANAGE_PROJECTS');

    const adminActions: QuickActionItem[] = [
        {
            label: t('sidebar.admin.users'),
            icon: Users,
            href: '/manage/users',
            permission: 'MANAGE_USERS',
        },
        {
            label: t('sidebar.admin.classrooms'),
            icon: School,
            href: '/manage/classrooms',
            permission: 'MANAGE_CLASSROOMS',
        },
        {
            label: t('sidebar.admin.messages'),
            icon: Mail,
            href: '/manage/contact-messages',
            permission: 'MANAGE_CONTACT_MESSAGES',
        },
        {
            label: t('sidebar.admin.attachments'),
            icon: FileText,
            href: '/manage/attachments',
            permission: 'MANAGE_ATTACHMENTS',
        },
    ];

    const teachingActions: QuickActionItem[] = [
        {
            label: role === 'admin' ? t('sidebar.admin.posts') : t('sidebar.teacher.posts'),
            icon: Megaphone,
            href: '/manage/posts',
            permission: 'MANAGE_POSTS',
        },
        {
            label: role === 'admin' ? t('sidebar.admin.labs') : t('sidebar.teacher.labs'),
            icon: Beaker,
            href: '/manage/labs',
            permission: 'MANAGE_LABS',
        },
        ...(role === 'admin'
            ? [
                  {
                      label: t('sidebar.admin.academics'),
                      icon: GraduationCap,
                      href: '/manage/academics',
                      permission: 'MANAGE_ACADEMICS',
                  } satisfies QuickActionItem,
              ]
            : [
                  {
                      label: t('sidebar.teacher.projects'),
                      icon: NotebookPen,
                      href: '/manage/projects',
                      permission: 'MANAGE_PROJECTS',
                  } satisfies QuickActionItem,
              ]),
    ];

    const personalActions: QuickActionItem[] = [
        {
            label: t('sidebar.user.profile'),
            icon: Settings,
            href: '/manage/settings/profile',
            permission: 'MANAGE_PROFILE',
        },
        {
            label: t('sidebar.user.security'),
            icon: Settings,
            href: '/manage/settings/password',
            permission: 'MANAGE_PASSWORD',
        },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        {t(`dashboard.${role}.title`)}
                    </CardTitle>
                    <CardDescription>{t(`dashboard.${role}.description`)}</CardDescription>
                </CardHeader>
            </Card>

            <RoleGuard allowedRoles={['admin']}>
                <QuickActionSection role={role} title="管理功能" description="系統管理與維護功能" actions={adminActions} />
            </RoleGuard>

            <RoleGuard allowedRoles={['admin', 'teacher']}>
                <QuickActionSection role={role} title="教學管理" description="內容與學術資源管理" actions={teachingActions} />
            </RoleGuard>

            <QuickActionSection role={role} title="個人設定" description="帳戶與安全設定管理" actions={personalActions} />

            {process.env.NODE_ENV === 'development' && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                        <CardTitle className="text-yellow-900">偵錯資訊</CardTitle>
                        <CardDescription className="text-yellow-800">
                            目前身份：{role} · 功能權限：
                            {[
                                canManageUsers && '使用者管理',
                                canManagePosts && '公告管理',
                                canManageLabs && '實驗室管理',
                                canManageClassrooms && '教室管理',
                                canManageAcademics && '學程管理',
                                canManageProjects && '專案管理',
                            ]
                                .filter(Boolean)
                                .join('、') || '無'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-yellow-800">
                        若需測試權限組合，可至使用者管理頁面調整角色。
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
