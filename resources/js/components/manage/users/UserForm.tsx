import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import type { OptionItem, UserFormPayload, UserRole, UserStatus } from './user-types';

interface UserFormProps {
    mode: 'create' | 'edit';
    user?: UserFormPayload | null;
    roleOptions: OptionItem[];
    statusOptions: OptionItem[];
}

export default function UserForm({ mode, user, roleOptions, statusOptions }: UserFormProps) {
    // 使用 Inertia 表單管理狀態與驗證錯誤，統一處理送出流程。
    const form = useForm<{
        name: string;
        email: string;
        roles: UserRole[];
        status: UserStatus;
        password: string;
        password_confirmation: string;
        email_verified: boolean;
    }>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        roles:
            user?.roles && user.roles.length > 0
                ? (user.roles as UserRole[])
                : roleOptions.length > 0
                    ? [(roleOptions[0]?.value as UserRole) ?? 'user']
                    : ['user'],
        status: user?.status ?? ((statusOptions[0]?.value as UserStatus) ?? 'active'),
        password: '',
        password_confirmation: '',
        email_verified: Boolean(user?.email_verified_at ?? false),
    });

    const roleErrors = Object.entries(form.errors)
        .filter(([key]) => key === 'roles' || key.startsWith('roles.'))
        .map(([, value]) => value)
        .filter((message): message is string => Boolean(message));

    const toggleRole = (role: UserRole, checked: boolean) => {
        const current = Array.isArray(form.data.roles) ? form.data.roles : [];

        if (checked) {
            if (current.includes(role)) {
                return;
            }

            form.setData('roles', [...current, role]);
            return;
        }

        form.setData(
            'roles',
            current.filter((item) => item !== role),
        );
    };

    // 表單送出時依模式決定呼叫新增或更新 API，並避免頁面重新整理。
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'create') {
            form.post('/manage/users', {
                preserveScroll: true,
            });
        } else if (user?.id) {
            form.put(`/manage/users/${user.id}`, {
                preserveScroll: true,
            });
        }
    };

    const title = mode === 'create' ? '新增使用者' : `編輯帳號：${user?.name ?? ''}`;
    const description =
        mode === 'create'
            ? '建立新的後台帳號並設定角色與權限。'
            : '調整使用者基本資訊、角色與狀態。';

    return (
        <Card className="border-none shadow-lg ring-1 ring-black/5">
            <CardHeader>
                <CardTitle className="text-xl text-neutral-900">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <section className="grid gap-6 lg:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">姓名</Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                placeholder="請輸入姓名"
                                required
                                aria-invalid={Boolean(form.errors.name)}
                            />
                            {form.errors.name && (
                                <p className="text-sm text-red-500">{form.errors.name}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">電子郵件</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                                placeholder="name@example.com"
                                required
                                aria-invalid={Boolean(form.errors.email)}
                                autoComplete="username"
                            />
                            {form.errors.email && (
                                <p className="text-sm text-red-500">{form.errors.email}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>角色</Label>
                            <div className="flex flex-wrap gap-3 rounded-lg border border-neutral-200 p-3">
                                {roleOptions.map((option) => {
                                    const value = option.value as UserRole;
                                    const checked = form.data.roles.includes(value);

                                    return (
                                        <label
                                            key={option.value}
                                            className="flex items-center gap-2 text-sm text-neutral-700"
                                        >
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={(state) =>
                                                    toggleRole(value, state === true)
                                                }
                                            />
                                            <span>{option.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            {roleErrors.length > 0 && (
                                <div className="space-y-1">
                                    {roleErrors.map((error, index) => (
                                        <p key={index} className="text-sm text-red-500">
                                            {error}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="status">狀態</Label>
                            <Select
                                id="status"
                                value={form.data.status}
                                onChange={(event) => form.setData('status', event.target.value as UserFormPayload['status'])}
                                aria-invalid={Boolean(form.errors.status)}
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                            {form.errors.status && (
                                <p className="text-sm text-red-500">{form.errors.status}</p>
                            )}
                        </div>
                    </section>

                    <section className="grid gap-6 lg:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">密碼</Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                placeholder={mode === 'create' ? '請設定登入密碼' : '若不更改可留空'}
                                aria-invalid={Boolean(form.errors.password)}
                                autoComplete={mode === 'create' ? 'new-password' : 'off'}
                            />
                            {form.errors.password && (
                                <p className="text-sm text-red-500">{form.errors.password}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password_confirmation">密碼確認</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(event) =>
                                    form.setData('password_confirmation', event.target.value)
                                }
                                placeholder={mode === 'create' ? '再次輸入密碼' : '若不更改可留空'}
                                aria-invalid={Boolean(form.errors.password_confirmation)}
                                autoComplete={mode === 'create' ? 'new-password' : 'off'}
                            />
                            {form.errors.password_confirmation && (
                                <p className="text-sm text-red-500">{form.errors.password_confirmation}</p>
                            )}
                        </div>
                    </section>

                    <section className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50/70 p-4">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="email_verified"
                                checked={form.data.email_verified}
                                onCheckedChange={(value) => form.setData('email_verified', value === true)}
                            />
                            <div>
                                <Label htmlFor="email_verified" className="text-sm font-medium text-neutral-800">
                                    電子郵件已驗證
                                </Label>
                                <p className="text-xs text-neutral-500">
                                    啟用後代表此帳號的電子郵件已完成驗證流程。
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Button type="button" variant="ghost" asChild>
                            <Link href="/manage/users">取消返回</Link>
                        </Button>
                        <Button type="submit" className="min-w-[120px]" disabled={form.processing}>
                            {form.processing
                                ? '處理中…'
                                : mode === 'create'
                                    ? '建立使用者'
                                    : '儲存變更'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
