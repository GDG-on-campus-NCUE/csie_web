import ManageLogo from '@/components/manage/manage-logo';
import { Select } from '@/components/ui/select';
import { useTranslator } from '@/hooks/use-translator';
import type { ChangeEvent } from 'react';

interface ManageSidebarHeaderProps {
    brand: {
        primary: string;
        secondary?: string;
    };
    locales: string[];
    currentLocale: string;
    onLocaleChange: (locale: string) => void;
}

export default function ManageSidebarHeader({ brand, locales, currentLocale, onLocaleChange }: ManageSidebarHeaderProps) {
    const { t } = useTranslator('manage');

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        onLocaleChange(event.target.value);
    };

    const getLocaleLabel = (locale: string) => {
        switch (locale) {
            case 'zh-TW':
                return '繁體中文';
            case 'en':
                return 'English';
            default:
                return locale;
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center gap-3">
                <ManageLogo />
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{brand.primary}</p>
                    {brand.secondary && (
                        <p className="truncate text-xs text-white/70">{brand.secondary}</p>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs font-medium uppercase tracking-wide text-white/70">
                    {t('access.back_to_dashboard', '介面語言')}
                </label>
                <Select value={currentLocale} onChange={handleChange} className="bg-white/95 text-sm">
                    {locales.map((locale) => (
                        <option key={locale} value={locale}>
                            {getLocaleLabel(locale)}
                        </option>
                    ))}
                </Select>
            </div>
        </div>
    );
}
