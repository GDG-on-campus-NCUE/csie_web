import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { AuthInput, AuthPasswordInput } from '@/components/auth/auth-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useTranslator } from '@/hooks/use-translator';
import {
    formButtonClass,
    formHelperTextClass,
    formLinkClass,
    formSectionClass,
} from './styles';

export default function Register() {
    const { t } = useTranslator('auth');

    const copy = {
        title: t('pages.register.title', '註冊新帳號'),
        description: t('pages.register.description', '請填寫以下資訊來建立您的帳號'),
        nameLabel: t('fields.name.label', '姓名'),
        namePlaceholder: t('fields.name.placeholder', '請輸入您的姓名'),
        emailLabel: t('fields.email.label', '電子郵件'),
        emailPlaceholder: t('fields.email.placeholder', '請輸入電子郵件'),
        passwordLabel: t('fields.password.label', '密碼'),
        passwordPlaceholder: t('fields.password.placeholder', '請輸入密碼'),
        confirmLabel: t('fields.password_confirmation.label', '確認密碼'),
        confirmPlaceholder: t('fields.password_confirmation.placeholder', '請再次輸入密碼'),
        submit: t('pages.register.submit', '建立帳號'),
        loginPrompt: t('pages.register.login_prompt', '已經有帳號了？'),
        loginLink: t('pages.register.login_link', '立即登入'),
    };

    return (
        <AuthLayout title={copy.title} description={copy.description}>
            <Head title={copy.title} />
            <Form
                {...RegisteredUserController.store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="space-y-8"
            >
                {({ processing, errors }) => (
                    <div className="space-y-8">
                        <div className={formSectionClass}>
                            <AuthInput
                                id="name"
                                type="text"
                                required
                                autoFocus
                                autoComplete="name"
                                name="name"
                                label={copy.nameLabel}
                                placeholder={copy.namePlaceholder}
                                error={errors.name}
                            />

                            <AuthInput
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                name="email"
                                label={copy.emailLabel}
                                placeholder={copy.emailPlaceholder}
                                error={errors.email}
                            />

                            <AuthPasswordInput
                                id="password"
                                required
                                autoComplete="new-password"
                                name="password"
                                label={copy.passwordLabel}
                                placeholder={copy.passwordPlaceholder}
                                error={errors.password}
                            />

                            <AuthPasswordInput
                                id="password_confirmation"
                                required
                                autoComplete="new-password"
                                name="password_confirmation"
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
                            data-test="register-user-button"
                        >
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {copy.submit}
                        </Button>

                        <p className={`${formHelperTextClass} text-center`}>
                            {copy.loginPrompt}{' '}
                            <TextLink href={login()} className={formLinkClass}>
                                {copy.loginLink}
                            </TextLink>
                        </p>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
