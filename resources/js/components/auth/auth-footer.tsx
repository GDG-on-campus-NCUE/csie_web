import TextLink from '@/components/text-link';
import { home } from '@/routes';
import { cn } from '@/lib/shared/utils';
import { useTranslator } from '@/hooks/use-translator';

export interface AuthFooterLink {
    label: string;
    href: string;
    external?: boolean;
}

interface AuthFooterProps {
    links?: AuthFooterLink[];
    className?: string;
}

export function AuthFooter({ links, className = '' }: AuthFooterProps) {
    const { t } = useTranslator('auth');

    const defaultLinks: AuthFooterLink[] = links ?? [
        { label: t('footer.home', '回首頁'), href: home.url() },
        { label: t('footer.contact', '聯絡我們'), href: 'mailto:csie@ncue.edu.tw', external: true },
        {
            label: t('footer.privacy', '隱私政策'),
            href: 'https://www.csie.ncue.edu.tw/privacy',
            external: true,
        },
    ];

    return (
        <div className={cn('flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500', className)}>
            {defaultLinks.map((link) =>
                link.external ? (
                    <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="transition hover:text-blue-600"
                    >
                        {link.label}
                    </a>
                ) : (
                    <TextLink key={link.label} href={link.href} className="font-medium text-slate-500 hover:text-blue-600">
                        {link.label}
                    </TextLink>
                ),
            )}
        </div>
    );
}
