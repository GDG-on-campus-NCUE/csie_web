import UserForm, { type SelectOption, type UserFormValues } from '@/components/manage/users/user-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ManageLayout from '@/layouts/manage/manage-layout';
import { useTranslator } from '@/hooks/use-translator';
import { Head, Link } from '@inertiajs/react';
import type { InertiaFormProps } from '@inertiajs/react';

interface CreateUserProps {
    roleOptions?: SelectOption[];
    statusOptions?: SelectOption[];
}

export default function CreateUser({
    roleOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'teacher', label: 'Teacher' },
        { value: 'user', label: 'User' },
    ],
    statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'suspended', label: 'Suspended' },
    ],
}: CreateUserProps) {
    const { t, isZh } = useTranslator('manage');

    const usersIndexUrl = '/manage/admin/users';

    const breadcrumbs = [
        { title: t('layout.breadcrumbs.dashboard', isZh ? '管理首頁' : 'Management'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.users', isZh ? '使用者管理' : 'Users'), href: usersIndexUrl },
        { title: t('layout.breadcrumbs.users_create', isZh ? '新增使用者' : 'Create user'), href: '/manage/admin/users/create' },
    ];

    const defaultRole = roleOptions[0]?.value ?? 'user';
    const defaultStatus = statusOptions[0]?.value ?? 'active';

    const initialValues: UserFormValues = {
        name: '',
        email: '',
        role: defaultRole,
        status: defaultStatus,
        locale: '',
        password: '',
        password_confirmation: '',
        email_verified: false,
    };

    const handleSubmit = (form: InertiaFormProps<UserFormValues>) => {
        form.post(usersIndexUrl, {
            preserveScroll: true,
        });
    };

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <Head title={t('users.form.header.create.title', isZh ? '建立使用者' : 'Create user')} />

            <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-0">
                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardContent className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-[#151f54]">
                                {t('users.form.header.create.title', isZh ? '建立使用者' : 'Create user')}
                            </h1>
                            <p className="text-sm text-slate-600">
                                {t(
                                    'users.form.header.create.description',
                                    isZh
                                        ? '建立新帳號並指派角色，必要時可預先標記信箱為已驗證。'
                                        : 'Create a new account, assign a role, and optionally mark the email as verified.',
                                )}
                            </p>
                        </div>
                        <Button asChild variant="outline" className="rounded-full border-[#151f54]/30 text-[#151f54]">
                            <Link href={usersIndexUrl}>{t('users.form.actions.cancel', isZh ? '返回列表' : 'Back to list')}</Link>
                        </Button>
                    </CardContent>
                </Card>

                <UserForm
                    mode="create"
                    initialValues={initialValues}
                    roleOptions={roleOptions}
                    statusOptions={statusOptions}
                    cancelUrl={usersIndexUrl}
                    onSubmit={handleSubmit}
                />
            </section>
        </ManageLayout>
    );
}
