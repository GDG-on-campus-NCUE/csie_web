import UserForm, { type SelectOption, type UserFormValues } from '@/components/manage/users/user-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ManageLayout from '@/layouts/manage/manage-layout';
import { useTranslator } from '@/hooks/use-translator';
import { Head, Link, useForm } from '@inertiajs/react';
import type { InertiaFormProps } from '@inertiajs/react';

interface EditableUser {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'user';
    status: 'active' | 'suspended';
    locale: string | null;
    email_verified_at: string | null;
    deleted_at: string | null;
}

interface EditUserProps {
    user: EditableUser;
    roleOptions?: SelectOption[];
    statusOptions?: SelectOption[];
}

export default function EditUser({
    user,
    roleOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'teacher', label: 'Teacher' },
        { value: 'user', label: 'User' },
    ],
    statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'suspended', label: 'Suspended' },
    ],
}: EditUserProps) {
    const { t, isZh } = useTranslator('manage');
    const { post } = useForm({});

    const usersIndexUrl = '/manage/admin/users';
    const editUrl = `/manage/admin/users/${user.id}`;

    const breadcrumbs = [
        { title: t('layout.breadcrumbs.dashboard', isZh ? '管理首頁' : 'Management'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.users', isZh ? '使用者管理' : 'Users'), href: usersIndexUrl },
        { title: t('layout.breadcrumbs.users_edit', isZh ? '編輯使用者' : 'Edit user'), href: editUrl },
    ];

    const initialValues: UserFormValues = {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        locale: user.locale ?? '',
        password: '',
        password_confirmation: '',
        email_verified: Boolean(user.email_verified_at),
    };

    const handleSubmit = (form: InertiaFormProps<UserFormValues>) => {
        form.put(editUrl, {
            preserveScroll: true,
        });
    };

    const handleRestore = () => {
        post(`${editUrl}/restore`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <Head title={t('users.form.header.edit.title', isZh ? '編輯使用者' : 'Edit user')} />

            <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-0">
                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardContent className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-[#151f54]">
                                {t('users.form.header.edit.title', isZh ? '編輯使用者' : 'Edit user')}
                            </h1>
                            <p className="text-sm text-slate-600">
                                {t(
                                    'users.form.header.edit.description',
                                    isZh
                                        ? '調整帳號資訊、角色與狀態；留空密碼欄位即維持現有設定。'
                                        : 'Update account details, role, and status. Leave password fields blank to keep the current one.',
                                )}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            {user.deleted_at && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
                                    onClick={handleRestore}
                                >
                                    {t('users.form.actions.restore', isZh ? '還原帳號' : 'Restore user')}
                                </Button>
                            )}
                            <Button asChild variant="outline" className="rounded-full border-[#151f54]/30 text-[#151f54]">
                                <Link href={usersIndexUrl}>{t('users.form.actions.cancel', isZh ? '返回列表' : 'Back to list')}</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <UserForm
                    mode="edit"
                    initialValues={initialValues}
                    roleOptions={roleOptions}
                    statusOptions={statusOptions}
                    cancelUrl={usersIndexUrl}
                    onSubmit={handleSubmit}
                    isDeleted={Boolean(user.deleted_at)}
                />
            </section>
        </ManageLayout>
    );
}
