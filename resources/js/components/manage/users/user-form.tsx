import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useTranslator } from '@/hooks/use-translator';
import { Link, useForm, type InertiaFormProps } from '@inertiajs/react';
import type { FormEventHandler } from 'react';

export interface SelectOption {
    value: string;
    label: string;
}

export interface UserFormValues {
    name: string;
    email: string;
    role: string;
    status: string;
    locale: string;
    password: string;
    password_confirmation: string;
    email_verified: boolean;
}

interface UserFormProps {
    mode: 'create' | 'edit';
    initialValues: UserFormValues;
    roleOptions: SelectOption[];
    statusOptions: SelectOption[];
    cancelUrl: string;
    onSubmit: (form: InertiaFormProps<UserFormValues>) => void;
    isDeleted?: boolean;
}

export default function UserForm({
    mode,
    initialValues,
    roleOptions,
    statusOptions,
    cancelUrl,
    onSubmit,
    isDeleted = false,
}: UserFormProps) {
    const { t, isZh } = useTranslator('manage');

    // 依據模式切換送出按鈕文案
    const submitLabel = mode === 'create'
        ? t('users.form.actions.create', isZh ? '建立使用者' : 'Create user')
        : t('users.form.actions.update', isZh ? '更新資料' : 'Update user');
    const processingLabel = mode === 'create'
        ? t('users.form.actions.creating', isZh ? '建立中…' : 'Creating…')
        : t('users.form.actions.updating', isZh ? '更新中…' : 'Updating…');

    const form = useForm<UserFormValues>({
        name: initialValues.name,
        email: initialValues.email,
        role: initialValues.role,
        status: initialValues.status,
        locale: initialValues.locale,
        password: initialValues.password,
        password_confirmation: initialValues.password_confirmation,
        email_verified: initialValues.email_verified,
    });

    const { data, setData, errors, processing } = form;

    const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        onSubmit(form);
    };

    const renderOptionLabel = (option: SelectOption, type: 'role' | 'status') => {
        if (type === 'role') {
            return t(`users.roles.${option.value}`, option.label);
        }

        return t(`users.status.${option.value}`, option.label);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {isDeleted && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {t(
                        'users.form.deleted_notice',
                        isZh ? '此帳號已被移至回收桶，儲存變更前請先於列表還原。' : 'This account is in the recycle bin. Restore it before saving changes.',
                    )}
                </div>
            )}

            <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                <CardHeader className="border-b border-neutral-100">
                    <CardTitle className="text-lg font-semibold text-[#151f54]">
                        {t('users.form.sections.profile', isZh ? '基本資料' : 'Profile')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 py-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="user-name" className="text-sm font-medium text-neutral-700">
                                {t('users.form.fields.name.label', isZh ? '姓名' : 'Name')}
                            </Label>
                            <Input
                                id="user-name"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                placeholder={t('users.form.fields.name.placeholder', isZh ? '請輸入姓名' : 'Enter full name')}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-email" className="text-sm font-medium text-neutral-700">
                                {t('users.form.fields.email.label', isZh ? '電子郵件' : 'Email')}
                            </Label>
                            <Input
                                id="user-email"
                                type="email"
                                value={data.email}
                                onChange={(event) => setData('email', event.target.value)}
                                placeholder={t('users.form.fields.email.placeholder', isZh ? 'name@example.com' : 'name@example.com')}
                                required
                            />
                            <InputError message={errors.email} />
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="user-role" className="text-sm font-medium text-neutral-700">
                                {t('users.form.fields.role.label', isZh ? '系統角色' : 'Role')}
                            </Label>
                            <Select
                                id="user-role"
                                value={data.role}
                                onChange={(event) => setData('role', event.target.value)}
                            >
                                {roleOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {renderOptionLabel(option, 'role')}
                                    </option>
                                ))}
                            </Select>
                            <InputError message={errors.role} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-status" className="text-sm font-medium text-neutral-700">
                                {t('users.form.fields.status.label', isZh ? '帳號狀態' : 'Status')}
                            </Label>
                            <Select
                                id="user-status"
                                value={data.status}
                                onChange={(event) => setData('status', event.target.value)}
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {renderOptionLabel(option, 'status')}
                                    </option>
                                ))}
                            </Select>
                            <InputError message={errors.status} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-locale" className="text-sm font-medium text-neutral-700">
                                {t('users.form.fields.locale.label', isZh ? '介面語系' : 'Locale preference')}
                            </Label>
                            <Select
                                id="user-locale"
                                value={data.locale}
                                onChange={(event) => setData('locale', event.target.value)}
                            >
                                <option value="">
                                    {t('users.form.fields.locale.system', isZh ? '跟隨系統預設' : 'System default')}
                                </option>
                                <option value="zh-TW">{t('users.form.fields.locale.zh', '繁體中文')}</option>
                                <option value="en">{t('users.form.fields.locale.en', 'English')}</option>
                            </Select>
                            <InputError message={errors.locale} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                <CardHeader className="border-b border-neutral-100">
                    <CardTitle className="text-lg font-semibold text-[#151f54]">
                        {t('users.form.sections.security', isZh ? '安全設定' : 'Security settings')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 py-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="user-password" className="text-sm font-medium text-neutral-700">
                                {t('users.form.fields.password.label', isZh ? '登入密碼' : 'Password')}
                            </Label>
                            <Input
                                id="user-password"
                                type="password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                placeholder={t(
                                    'users.form.fields.password.placeholder',
                                    isZh ? '至少 8 碼，英數混合最佳' : 'Minimum 8 characters',
                                )}
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password} />
                            <p className="text-xs text-neutral-500">
                                {mode === 'create'
                                    ? t('users.form.fields.password.help_create', isZh ? '建立新帳號時必填。' : 'Required for new accounts.')
                                    : t('users.form.fields.password.help_edit', isZh ? '若不需變更請留空。' : 'Leave blank to keep current password.')}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-password-confirm" className="text-sm font-medium text-neutral-700">
                                {t('users.form.fields.password_confirmation.label', isZh ? '確認密碼' : 'Confirm password')}
                            </Label>
                            <Input
                                id="user-password-confirm"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(event) => setData('password_confirmation', event.target.value)}
                                placeholder={t(
                                    'users.form.fields.password_confirmation.placeholder',
                                    isZh ? '再次輸入密碼' : 'Re-enter the password',
                                )}
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                        <Checkbox
                            id="user-email-verified"
                            checked={data.email_verified}
                            onCheckedChange={(checked) => setData('email_verified', Boolean(checked))}
                        />
                        <div className="space-y-1">
                            <Label htmlFor="user-email-verified" className="text-sm font-medium text-neutral-700">
                                {t('users.form.fields.email_verified.label', isZh ? '標記為已驗證信箱' : 'Mark email as verified')}
                            </Label>
                            <p className="text-xs text-neutral-500">
                                {t(
                                    'users.form.fields.email_verified.help',
                                    isZh
                                        ? '啟用後系統將視為已完成信箱驗證。'
                                        : 'Enable to treat this address as verified.',
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 border-t border-neutral-100 py-6 sm:flex-row sm:justify-between">
                    <Button asChild variant="outline" className="w-full rounded-full border-[#151f54]/30 text-[#151f54] sm:w-auto">
                        <Link href={cancelUrl}>{t('users.form.actions.cancel', isZh ? '返回列表' : 'Back to list')}</Link>
                    </Button>
                    <Button
                        type="submit"
                        className="w-full rounded-full bg-[#151f54] px-6 text-white hover:bg-[#1f2a6d] sm:w-auto"
                        disabled={processing}
                    >
                        {processing ? processingLabel : submitLabel}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
