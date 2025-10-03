import EmailVerificationNotificationController from '@/actions/App/Http/Controllers/Auth/EmailVerificationNotificationController';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useTranslator } from '@/hooks/use-translator';
import { formButtonClass, formLinkClass, formStatusClass } from './styles';

// 使用常數避免 Wayfinder 尚未生成時造成匯入錯誤
const LOGOUT_ROUTE = '/logout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslator('auth');

    const copy = {
        title: t('pages.verify_email.title', '驗證電子郵件'),
        description: t('pages.verify_email.description', '請透過點擊我們剛寄給您的驗證連結來完成設定'),
        submit: t('pages.verify_email.submit', '重新發送驗證郵件'),
        logout: t('actions.logout', '登出'),
    };

    return (
        <AuthLayout title={copy.title} description={copy.description}>
            <Head title={copy.title} />

            {status && <div className={formStatusClass}>{status}</div>}

            <Form action={EmailVerificationNotificationController.store().url} method={EmailVerificationNotificationController.store().method} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} size="lg" className={`${formButtonClass} w-full`}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {copy.submit}
                        </Button>

                        <TextLink
                            href={LOGOUT_ROUTE}
                            method="post"
                            as="button"
                            className={`${formLinkClass} text-sm font-semibold`}
                        >
                            {copy.logout}
                        </TextLink>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
