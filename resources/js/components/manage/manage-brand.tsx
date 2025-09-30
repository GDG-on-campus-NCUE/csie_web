import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useTranslator } from '@/hooks/use-translator';
import { deriveManageRole } from '@/components/manage/utils/role-helpers';

export type ManageRole = 'admin' | 'teacher' | 'user';

interface ManageBrandProps {
    role?: ManageRole;
}

export default function ManageBrand({ role: roleOverride }: ManageBrandProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const { t } = useTranslator('manage');

    const role = deriveManageRole(auth?.user ?? null, roleOverride ?? null);

    const primaryLabel = t(`layout.brand.${role}.primary`);
    const secondaryLabel = t(`layout.brand.${role}.secondary`);

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-[#151f54] text-white">
                <AppLogoIcon className="size-5 fill-current" />
            </div>
            <div className="ml-1 grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">{primaryLabel}</span>
                <span className="truncate text-xs text-neutral-500">{secondaryLabel}</span>
            </div>
        </>
    );
}
