import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RoleGuard from '@/components/manage/guards/role-guard';
import { usePermission, useRoleInfo } from '@/components/manage/utils/permission-utils';
import { QuickActionSection, type QuickActionItem } from '@/components/manage/dashboard/quick-action-section';
import { useTranslator } from '@/hooks/use-translator';
import {
    Users,
    Megaphone,
    Beaker,
    School,
    Settings,
    FileText,
    Mail,
    UserCheck,
    GraduationCap,
    NotebookPen,
} from 'lucide-react';

/**
 * 管理頁面快速操作組件
 * 根據使用者角色動態顯示可用的管理功能
 */
export default function ManageQuickActions() {
    const { t } = useTranslator('manage');
    const { role } = useRoleInfo();

    // 使用權限 Hook 檢查功能權限
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
            label: t('sidebar.admin.staff'),
            icon: UserCheck,
            href: '/manage/staff',
            permission: 'MANAGE_STAFF',
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
            href: (currentRole) => (currentRole === 'admin' ? '/manage/posts' : '/manage/teacher/posts'),
            permission: 'MANAGE_POSTS',
        },
        {
            label: role === 'admin' ? t('sidebar.admin.labs') : t('sidebar.teacher.labs'),
            icon: Beaker,
            href: (currentRole) => (currentRole === 'admin' ? '/manage/labs' : '/manage/teacher/labs'),
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
            {/* 角色資訊卡片 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        {t(`dashboard.${role}.title`)}
                    </CardTitle>
                    <CardDescription>
                        {t(`dashboard.${role}.description`)}
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* 管理員專用功能 */}
            <RoleGuard allowedRoles={['admin']}>
                <QuickActionSection
                    role={role}
                    title="管理功能"
                    description="系統管理與維護功能"
                    actions={adminActions}
                />
            </RoleGuard>

            {/* 教師和管理員共用功能 */}
            <RoleGuard allowedRoles={['admin', 'teacher']}>
                <QuickActionSection
                    role={role}
                    title="教學管理"
                    description="內容與學術資源管理"
                    actions={teachingActions}
                />
            </RoleGuard>

            {/* 個人設定（所有角色共用） */}
            <QuickActionSection
                role={role}
                title="個人設定"
                description="帳戶與安全設定管理"
                actions={personalActions}
            />

            {/* 除錯資訊（僅開發環境顯示） */}
            {process.env.NODE_ENV === 'development' && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                        <CardTitle className="text-yellow-800">除錯資訊</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-yellow-700">
                        <p>目前角色: {role}</p>
                        <p>可管理使用者: {canManageUsers ? '是' : '否'}</p>
                        <p>可管理公告: {canManagePosts ? '是' : '否'}</p>
                        <p>可管理實驗室: {canManageLabs ? '是' : '否'}</p>
                        <p>可管理教室: {canManageClassrooms ? '是' : '否'}</p>
                        <p>可管理學制: {canManageAcademics ? '是' : '否'}</p>
                        <p>可管理研究專案: {canManageProjects ? '是' : '否'}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
