import NewPasswordController from '@/actions/App/Http/Controllers/Auth/NewPasswordController';
import { AuthInput, AuthPasswordInput } from '@/components/auth/auth-input';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useTranslator } from '@/hooks/use-translator';
import { formButtonClass, formSectionClass } from './styles';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { t } = useTranslator('auth');

    const copy = {
        title: t('pages.reset_password.title', '重設密碼'),
        description: t('pages.reset_password.description', '請輸入新的密碼以完成重設'),
        emailLabel: t('fields.email.label', '電子郵件'),
        passwordLabel: t('fields.new_password.label', '新密碼'),
        passwordPlaceholder: t('fields.new_password.placeholder', '請輸入新的密碼'),
        confirmLabel: t('fields.new_password_confirmation.label', '確認新密碼'),
        confirmPlaceholder: t('fields.new_password_confirmation.placeholder', '請再次輸入新的密碼'),
        submit: t('pages.reset_password.submit', '更新密碼'),
    };

    return (
        <AuthLayout title={copy.title} description={copy.description}>
            <Head title={copy.title} />

            <Form
                action={NewPasswordController.store().url}
                method={NewPasswordController.store().method}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="space-y-8"
            >
                {({ processing, errors }) => (
                    <div className="space-y-8">
                        <div className={formSectionClass}>
                            <AuthInput
                                id="email"
                                type="email"
                                name="email"
                                value={email}
                                readOnly
                                label={copy.emailLabel}
                                error={errors.email}
                            />

                            <AuthPasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                autoFocus
                                label={copy.passwordLabel}
                                placeholder={copy.passwordPlaceholder}
                                error={errors.password}
                            />

                            <AuthPasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                label={copy.confirmLabel}
                                placeholder={copy.confirmPlaceholder}
                                error={errors.password_confirmation}
                            />
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className={formButtonClass}
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {copy.submit}
                        </Button>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
