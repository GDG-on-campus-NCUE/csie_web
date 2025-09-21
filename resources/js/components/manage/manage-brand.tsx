import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export type ManageRole = 'admin' | 'teacher' | 'user';

interface ManageBrandProps {
    role?: ManageRole;
}

const primaryLabels: Record<ManageRole, string> = {
    admin: 'CSIE Admin',
    teacher: 'CSIE Teacher',
    user: 'CSIE Member',
};

const secondaryLabels: Record<ManageRole, { zh: string; en: string }> = {
    admin: { zh: '系統後台', en: 'Management Console' },
    teacher: { zh: '教學後台', en: 'Teaching Console' },
    user: { zh: '會員中心', en: 'Member Area' },
};

export default function ManageBrand({ role: roleOverride }: ManageBrandProps) {
    const page = usePage<SharedData>();
    const { auth, locale } = page.props;
    const role = (roleOverride ?? auth?.user?.role ?? 'user') as ManageRole;
    const isZh = locale?.toLowerCase() === 'zh-tw';

    const primaryLabel = primaryLabels[role];
    const secondaryLabel = secondaryLabels[role][isZh ? 'zh' : 'en'];

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
