import ManageLayout from '@/layouts/manage/manage-layout';
import { useTranslator } from '@/hooks/use-translator';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';

interface Option {
    value: string;
    label: string;
}

interface UsersCreateProps {
    roleOptions: Option[];
    statusOptions: Option[];
}

export default function AdminUsersCreate({ roleOptions, statusOptions }: UsersCreateProps) {
    const { t, isZh } = useTranslator('manage');
    const defaultRole = roleOptions[0]?.value ?? 'user';
    const defaultStatus = statusOptions[0]?.value ?? 'active';

    const form = useForm({
        name: '',
        email: '',
        role: defaultRole,
        status: defaultStatus,
        locale: '',
        password: '',
        password_confirmation: '',
        email_verified: false,
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post('/manage/admin/users');
    };

    const breadcrumbs = [
        { title: t('layout.breadcrumbs.dashboard', isZh ? '管理首頁' : 'Management'), href: '/manage/dashboard' },
        { title: t('sidebar.admin.users', isZh ? '使用者管理' : 'User management'), href: '/manage/admin/users' },
        { title: t('users.create.title', isZh ? '新增使用者' : 'Create user'), href: '/manage/admin/users/create' },
    ];

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <Head title={t('users.create.title', isZh ? '新增使用者' : 'Create user')} />

            <section className="space-y-6 px-4 py-8 sm:px-6 lg:px-0">
                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl font-semibold text-[#151f54]">
                            {t('users.create.title', isZh ? '新增使用者' : 'Create user')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="user-name" className="text-sm font-medium text-neutral-700">
                                    {t('users.form.name', isZh ? '姓名' : 'Name')}
                                </label>
                                <Input
                                    id="user-name"
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    placeholder={isZh ? '輸入姓名' : 'Enter name'}
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="user-email" className="text-sm font-medium text-neutral-700">
                                    Email
                                </label>
                                <Input
                                    id="user-email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) => form.setData('email', event.target.value)}
                                    placeholder="name@example.com"
                                />
                                <InputError message={form.errors.email} />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="user-role" className="text-sm font-medium text-neutral-700">
                                    {t('users.form.role', isZh ? '角色' : 'Role')}
                                </label>
                                <Select
                                    id="user-role"
                                    value={form.data.role}
                                    onChange={(event) => form.setData('role', event.target.value)}
                                >
                                    {roleOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                                <InputError message={form.errors.role} />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="user-status" className="text-sm font-medium text-neutral-700">
                                    {t('users.form.status', isZh ? '狀態' : 'Status')}
                                </label>
                                <Select
                                    id="user-status"
                                    value={form.data.status}
                                    onChange={(event) => form.setData('status', event.target.value)}
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                                <InputError message={form.errors.status} />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="user-locale" className="text-sm font-medium text-neutral-700">
                                    {t('users.form.locale', isZh ? '介面語系' : 'Locale')}
                                </label>
                                <Input
                                    id="user-locale"
                                    value={form.data.locale}
                                    onChange={(event) => form.setData('locale', event.target.value)}
                                    placeholder={isZh ? '如 zh-TW' : 'e.g. en'}
                                />
                                <InputError message={form.errors.locale} />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="user-password" className="text-sm font-medium text-neutral-700">
                                    {t('users.form.password', isZh ? '密碼' : 'Password')}
                                </label>
                                <Input
                                    id="user-password"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(event) => form.setData('password', event.target.value)}
                                    placeholder={isZh ? '至少 8 碼' : 'Minimum 8 characters'}
                                />
                                <InputError message={form.errors.password} />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="user-password-confirm" className="text-sm font-medium text-neutral-700">
                                    {t('users.form.password_confirmation', isZh ? '確認密碼' : 'Confirm password')}
                                </label>
                                <Input
                                    id="user-password-confirm"
                                    type="password"
                                    value={form.data.password_confirmation}
                                    onChange={(event) => form.setData('password_confirmation', event.target.value)}
                                />
                                <InputError message={form.errors.password_confirmation} />
                            </div>

                            <div className="lg:col-span-2">
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700" htmlFor="user-email-verified">
                                    <Checkbox
                                        id="user-email-verified"
                                        checked={form.data.email_verified}
                                        onCheckedChange={(checked) => form.setData('email_verified', Boolean(checked))}
                                    />
                                    <span>{t('users.form.email_verified', isZh ? '標記為已驗證' : 'Mark as verified')}</span>
                                </label>
                                <InputError message={form.errors.email_verified} />
                            </div>

                            <div className="lg:col-span-2 flex flex-wrap items-center justify-end gap-3 pt-4">
                                <Button type="button" variant="secondary" disabled={form.processing} asChild>
                                    <Link href="/manage/admin/users">
                                        {t('users.form.cancel', isZh ? '返回列表' : 'Cancel')}
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={form.processing} className="bg-[#151f54] text-white hover:bg-[#1f2a6d]">
                                    {t('users.form.submit_create', isZh ? '建立帳號' : 'Create account')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </section>
        </ManageLayout>
    );
}

