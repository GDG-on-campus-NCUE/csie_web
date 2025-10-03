import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { AuthInput, AuthPasswordInput } from '@/components/auth/auth-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useTranslator } from '@/hooks/use-translator';
import {
    formButtonClass,
    formCheckboxLabelClass,
    formHelperTextClass,
    formLinkClass,
    formSectionClass,
    formStatusClass,
} from './styles';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { t } = useTranslator('auth');

    const copy = {
        title: t('pages.login.title', '登入系統'),
        description: t('pages.login.description', '請輸入您的帳號密碼以登入系統'),
        emailLabel: t('fields.email.label', '電子郵件'),
        emailPlaceholder: t('fields.email.placeholder', '請輸入電子郵件'),
        passwordLabel: t('fields.password.label', '密碼'),
        passwordPlaceholder: t('fields.password.placeholder', '請輸入密碼'),
        rememberMe: t('actions.remember_me', '記住我'),
        forgotPassword: t('pages.login.forgot_password', '忘記密碼？'),
        submit: t('pages.login.submit', '登入'),
        registerPrompt: t('pages.login.register_prompt', '還沒有帳號？'),
        registerLink: t('pages.login.register_link', '註冊新帳號'),
    };

    return (
        <AuthLayout title={copy.title} description={copy.description}>
            <Head title={copy.title} />

            {status && <div className={formStatusClass}>{status}</div>}

            <Form
                action={AuthenticatedSessionController.store().url}
                method={AuthenticatedSessionController.store().method}
                resetOnSuccess={['password']}
                className="space-y-8"
            >
                {({ processing, errors }) => (
                    <div className="space-y-8">
                        <div className={formSectionClass}>
                            <AuthInput
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                autoComplete="email"
                                label={copy.emailLabel}
                                placeholder={copy.emailPlaceholder}
                                error={errors.email}
                            />

                            <AuthPasswordInput
                                id="password"
                                name="password"
                                required
                                autoComplete="current-password"
                                label={copy.passwordLabel}
                                placeholder={copy.passwordPlaceholder}
                                error={errors.password}
                                labelSecondary={
                                    canResetPassword ? (
                                        <TextLink href={request()} className={`${formLinkClass} text-sm`}>
                                            {copy.forgotPassword}
                                        </TextLink>
                                    ) : undefined
                                }
                            />

                            <div className="flex items-center gap-3 pt-2">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                                />
                                <label htmlFor="remember" className={formCheckboxLabelClass}>
                                    {copy.rememberMe}
                                </label>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className={formButtonClass}
                            disabled={processing}
                            data-test="login-button"
                        >
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {copy.submit}
                        </Button>

                        <p className={`${formHelperTextClass} text-center`}>
                            {copy.registerPrompt}{' '}
                            <TextLink href={register()} className={formLinkClass}>
                                {copy.registerLink}
                            </TextLink>
                        </p>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
