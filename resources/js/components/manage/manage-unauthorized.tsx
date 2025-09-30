import { useMemo } from 'react';

import { AlertTriangle } from 'lucide-react';
import { Link } from '@inertiajs/react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslator } from '@/hooks/use-translator';
import type { ManageRole } from '@/components/manage/manage-brand';

interface ManageUnauthorizedProps {
    role: ManageRole;
}

/**
 * 沒有權限時統一顯示的提示區塊
 */
export default function ManageUnauthorized({ role }: ManageUnauthorizedProps) {
    const { t } = useTranslator('manage');
    const roleLabel = useMemo(
        () =>
            (
                {
                    admin: t('layout.brand.admin.primary'),
                    teacher: t('layout.brand.teacher.primary'),
                    user: t('layout.brand.user.primary'),
                } satisfies Record<ManageRole, string>
            )[role],
        [role, t],
    );

    return (
        <Card className="border border-rose-200 bg-white/70 shadow-sm">
            <CardContent className="flex flex-col gap-6 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <AlertTriangle className="h-8 w-8" aria-hidden />
                </div>
                <div className="space-y-2">
                    <p className="text-sm font-medium text-rose-500">
                        {t('access.denied_role', undefined, { role: roleLabel })}
                    </p>
                    <h2 className="text-2xl font-semibold text-slate-900">
                        {t('access.denied_title')}
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-600">
                        {t('access.denied_description')}
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button asChild variant="default">
                        <Link href="/manage/dashboard">{t('access.back_to_dashboard')}</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

