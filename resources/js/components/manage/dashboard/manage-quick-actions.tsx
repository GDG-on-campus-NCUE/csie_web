import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RoleGuard, { useCurrentRole, useRolePermission } from '@/components/manage/guards/role-guard';
import { PermissionGuard, usePermission, useRoleInfo } from '@/components/manage/utils/permission-utils';
import { useTranslator } from '@/hooks/use-translator';
import { Link } from '@inertiajs/react';
import {
    Users,
    Megaphone,
    Beaker,
    School,
    Settings,
    FileText,
    Mail,
    UserCheck
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
                <Card>
                    <CardHeader>
                        <CardTitle>管理功能</CardTitle>
                        <CardDescription>
                            系統管理與維護功能
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* 使用者管理 */}
                            <PermissionGuard permission="MANAGE_USERS">
                                <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                                    <Link href="/manage/users">
                                        <Users className="h-6 w-6" />
                                        <span>{t('sidebar.admin.users')}</span>
                                    </Link>
                                </Button>
                            </PermissionGuard>

                            {/* 師資管理 */}
                            <PermissionGuard permission="MANAGE_STAFF">
                                <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                                    <Link href="/manage/staff">
                                        <UserCheck className="h-6 w-6" />
                                        <span>{t('sidebar.admin.staff')}</span>
                                    </Link>
                                </Button>
                            </PermissionGuard>

                            {/* 教室管理 */}
                            <PermissionGuard permission="MANAGE_CLASSROOMS">
                                <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                                    <Link href="/manage/classrooms">
                                        <School className="h-6 w-6" />
                                        <span>{t('sidebar.admin.classrooms')}</span>
                                    </Link>
                                </Button>
                            </PermissionGuard>

                            {/* 聯絡訊息 */}
                            <PermissionGuard permission="MANAGE_CONTACT_MESSAGES">
                                <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                                    <Link href="/manage/contact-messages">
                                        <Mail className="h-6 w-6" />
                                        <span>{t('sidebar.admin.messages')}</span>
                                    </Link>
                                </Button>
                            </PermissionGuard>

                            {/* 附件管理 */}
                            <PermissionGuard permission="MANAGE_ATTACHMENTS">
                                <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                                    <Link href="/manage/attachments">
                                        <FileText className="h-6 w-6" />
                                        <span>{t('sidebar.admin.attachments')}</span>
                                    </Link>
                                </Button>
                            </PermissionGuard>
                        </div>
                    </CardContent>
                </Card>
            </RoleGuard>

            {/* 教師和管理員共用功能 */}
            <RoleGuard allowedRoles={['admin', 'teacher']}>
                <Card>
                    <CardHeader>
                        <CardTitle>教學管理</CardTitle>
                        <CardDescription>
                            內容與學術資源管理
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* 公告管理 */}
                            <PermissionGuard permission="MANAGE_POSTS">
                                <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                                    <Link href="/manage/posts">
                                        <Megaphone className="h-6 w-6" />
                                        <span>{t('sidebar.teacher.posts')}</span>
                                    </Link>
                                </Button>
                            </PermissionGuard>

                            {/* 實驗室管理 */}
                            <PermissionGuard permission="MANAGE_LABS">
                                <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                                    <Link href={role === 'admin' ? '/manage/labs' : '/manage/teacher/labs'}>
                                        <Beaker className="h-6 w-6" />
                                        <span>{t('sidebar.teacher.labs')}</span>
                                    </Link>
                                </Button>
                            </PermissionGuard>

                            {/* 學程管理 */}
                            <PermissionGuard permission="MANAGE_ACADEMICS">
                                <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                                    <Link href="/manage/academics">
                                        <School className="h-6 w-6" />
                                        <span>{t('sidebar.admin.academics')}</span>
                                    </Link>
                                </Button>
                            </PermissionGuard>
                        </div>
                    </CardContent>
                </Card>
            </RoleGuard>

            {/* 個人設定（所有角色共用） */}
            <Card>
                <CardHeader>
                    <CardTitle>個人設定</CardTitle>
                    <CardDescription>
                        帳戶與安全設定管理
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                            <Link href="/manage/settings/profile">
                                <Settings className="h-6 w-6" />
                                <span>{t('sidebar.user.profile')}</span>
                            </Link>
                        </Button>

                        <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                            <Link href="/manage/settings/password">
                                <Settings className="h-6 w-6" />
                                <span>{t('sidebar.user.security')}</span>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

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
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
