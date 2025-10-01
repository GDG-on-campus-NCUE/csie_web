import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app/app-logo-icon';

export default function AppLogo() {
    const page = usePage<any>();
    const { locale } = page.props;
    const isZh = locale?.toLowerCase() === 'zh-tw';

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-[#151f54] text-white">
                <AppLogoIcon className="size-5 fill-current" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {isZh ? "CSIE 管理系統" : "CSIE Admin"}
                </span>
            </div>
        </>
    );
}
