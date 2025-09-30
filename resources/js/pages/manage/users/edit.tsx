import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';

import ManageLayout from '@/layouts/manage/manage-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import UserForm from '@/components/manage/users/UserForm';
import type { OptionItem, UserFormPayload } from '@/components/manage/users/user-types';
import type { BreadcrumbItem, SharedData } from '@/types';
import { useTranslator } from '@/hooks/use-translator';
import { deriveManageRole } from '@/components/manage/utils/role-helpers';

interface ManageUserEditProps {
    mode: 'create' | 'edit';
    user: UserFormPayload | null;
    roleOptions: OptionItem[];
    statusOptions: OptionItem[];
}

export default function ManageUserEdit({ mode, user, roleOptions, statusOptions }: ManageUserEditProps) {
    const { auth } = usePage<SharedData>().props;
    const { t } = useTranslator('manage');

    const layoutRole = deriveManageRole(auth?.user ?? null, null);

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            { title: t('layout.breadcrumbs.users', '使用者管理'), href: '/manage/users' },
            mode === 'edit'
                ? {
                      title:
                          user?.name ?? t('users.form.breadcrumb.edit', '編輯使用者'),
                      href: user?.id ? `/manage/users/${user.id}/edit` : '/manage/users',
                  }
                : { title: t('users.form.breadcrumb.create', '新增使用者'), href: '/manage/users/create' },
        ],
        [mode, t, user?.id, user?.name],
    );

    const pageTitle =
        mode === 'create'
            ? t('users.form.title.create', '新增使用者')
            : t('users.form.title.edit', '編輯使用者');
    const pageDescription =
        mode === 'create'
            ? t('users.form.description.create', '建立新的後台帳號並設定角色與狀態。')
            : t('users.form.description.edit', '調整帳號基本資訊、權限與登入設定。');

    return (
        <ManageLayout role={layoutRole} breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-slate-900">{pageTitle}</h1>
                            <p className="text-sm text-slate-600">{pageDescription}</p>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-full"
                        >
                            <Link href="/manage/users" className="inline-flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                {t('users.form.actions.back_to_index', '返回列表')}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <UserForm mode={mode} user={user ?? undefined} roleOptions={roleOptions} statusOptions={statusOptions} />
            </section>
        </ManageLayout>
    );
}
