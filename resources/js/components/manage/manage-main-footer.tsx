import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslator } from '@/hooks/use-translator';
import type { ReactNode } from 'react';

interface ManageMainFooterProps {
    children?: ReactNode;
}

export default function ManageMainFooter({ children }: ManageMainFooterProps) {
    const { t } = useTranslator('manage');

    if (children) {
        return <footer className="flex flex-col gap-2 text-sm text-neutral-500">{children}</footer>;
    }

    return (
        <footer className="flex flex-col gap-4 rounded-xl border border-dashed border-neutral-200 bg-white/75 px-4 py-3 text-sm text-neutral-500">
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                    {t('layout.footer', 'CSIE Admin')}
                </Badge>
                <span>{t('access.denied_role', '目前角色：:role', { role: t('sidebar.admin.nav_label', 'Administration') })}</span>
            </div>
            <Separator />
            <p className="text-xs leading-relaxed text-neutral-500">
                {t('settings.description', '管理個人資訊、安全性設定與介面外觀。')}
            </p>
        </footer>
    );
}
