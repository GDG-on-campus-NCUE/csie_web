import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { UserPlus } from 'lucide-react';

const mockUsers = [
    { id: 1, name: '王小明', email: 'admin@example.com', role: 'admin' },
    { id: 2, name: '陳老師', email: 'teacher@example.com', role: 'teacher' },
    { id: 3, name: '林同學', email: 'student@example.com', role: 'user' },
];

export default function ManageAdminUsersIndex() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/admin/dashboard',
        },
        {
            title: t('sidebar.admin.users', '使用者'),
            href: '/manage/admin/users',
        },
    ];

    const pageTitle = t('sidebar.admin.users', '使用者');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('users.description', '管理使用者角色與登入權限。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    <Button size="sm" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        {t('users.invite', '邀請新成員')}
                    </Button>
                }
            >
                <section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-neutral-200/80">
                                <TableHead className="w-2/6 text-neutral-500">{t('users.table.name', '姓名')}</TableHead>
                                <TableHead className="w-2/6 text-neutral-500">{t('users.table.email', '電子郵件')}</TableHead>
                                <TableHead className="w-2/6 text-right text-neutral-500">{t('users.table.role', '角色')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockUsers.map((user) => (
                                <TableRow key={user.id} className="border-neutral-200/60">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-neutral-800">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-neutral-500">{user.email}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline" className="capitalize">
                                            {t(`users.roles.${user.role}`, user.role)}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            </ManagePage>
        </>
    );
}

ManageAdminUsersIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
