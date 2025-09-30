import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const page = usePage<any>();
    const { locale } = page.props;
    const isZh = locale?.toLowerCase() === 'zh-tw';

    const universityName = isZh ? "彰化師範大學" : "NCUE";
    const departmentName = isZh ? "資訊工程系" : "Computer Science & Info. Eng.";

    return (
        <div className="flex items-center">
            <AppLogoIcon className="h-10 w-10 object-contain" />
            <div className="ml-3 flex flex-col justify-center">
                <span className="mb-0.5 truncate leading-tight font-black text-[clamp(0.875rem,2.5vw,1.125rem)] text-[#181f56] transition-all duration-200 hover:drop-shadow-lg">
                    {universityName}
                </span>
                <span className="truncate text-[clamp(0.75rem,2vw,0.875rem)] text-[#181f56]/70 font-black transition-all duration-200 hover:drop-shadow-lg">
                    {departmentName}
                </span>
            </div>
        </div>
    );
}
