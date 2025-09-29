import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ManageLayout from '@/layouts/manage/manage-layout';
import ManageSettingsLayout from '@/layouts/manage/settings-layout';
import { useTranslator } from '@/hooks/use-translator';

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.settings'), href: '/manage/settings/profile' },
        { title: t('layout.breadcrumbs.settings_profile'), href: '/manage/settings/profile' },
    ];

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.profile.head_title')} />

            <ManageSettingsLayout active="profile">
                <section className="space-y-6">
                    <HeadingSmall
                        title={t('settings.profile.title')}
                        description={t('settings.profile.description')}
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">{t('settings.profile.fields.name.label')}</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder={t('settings.profile.fields.name.placeholder')}
                                    />

                                    <InputError className="mt-2" message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">{t('settings.profile.fields.email.label')}</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder={t('settings.profile.fields.email.placeholder')}
                                    />

                                    <InputError className="mt-2" message={errors.email} />
                                </div>

                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-neutral-700">
                                            {t('settings.profile.verification.notice')}{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-neutral-900 underline decoration-neutral-400 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current hover:text-neutral-700 dark:decoration-neutral-500"
                                            >
                                                {t('settings.profile.verification.action')}
                                            </Link>
                                        </p>

                                        {status && (
                                            <div className="mt-2 text-sm font-medium text-green-600">{status}</div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing} data-test="update-profile-button">
                                        {t('settings.profile.actions.save')}
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-700 font-medium">{t('settings.profile.actions.saved')}</p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </section>

                <DeleteUser />
            </ManageSettingsLayout>
        </ManageLayout>
    );
}
