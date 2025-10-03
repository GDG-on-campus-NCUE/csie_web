import PasswordResetLinkController from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import { AuthInput } from '@/components/auth/auth-input';
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
    formStatusClass,
} from './styles';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslator('auth');

    const copy = {
        title: t('pages.forgot_password.title', '忘記密碼'),
        description: t('pages.forgot_password.description', '輸入電子郵件以接收重設密碼信'),
        emailLabel: t('fields.email.label', '電子郵件'),
        emailPlaceholder: t('fields.email.placeholder', '請輸入電子郵件'),
        submit: t('pages.forgot_password.submit', '寄送密碼重設連結'),
        backPrefix: t('actions.back_to_login_prefix', '或者，'),
        backLink: t('actions.back_to_login_link', '返回登入頁面'),
    };

    return (
        <AuthLayout title={copy.title} description={copy.description}>
            <Head title={copy.title} />

            {status && <div className={formStatusClass}>{status}</div>}

            <Form action={PasswordResetLinkController.store().url} method={PasswordResetLinkController.store().method} className={formSectionClass}>
                {({ processing, errors }) => (
                    <>
                        <AuthInput
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            autoFocus
                            label={copy.emailLabel}
                            placeholder={copy.emailPlaceholder}
                            error={errors.email}
                        />

                        <Button
                            type="submit"
                            size="lg"
                            className={formButtonClass}
                            disabled={processing}
                            data-test="email-password-reset-link-button"
                        >
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {copy.submit}
                        </Button>
                    </>
                )}
            </Form>

            <p className={`${formHelperTextClass} text-center`}>
                <span>{copy.backPrefix}</span>{' '}
                <TextLink href={login()} className={formLinkClass}>
                    {copy.backLink}
                </TextLink>
            </p>
        </AuthLayout>
    );
}
