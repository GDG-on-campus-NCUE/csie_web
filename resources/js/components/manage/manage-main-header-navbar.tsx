import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslator } from '@/hooks/use-translator';
import { Download, Filter, PlusCircle } from 'lucide-react';
import type { MouseEventHandler } from 'react';

interface ManageMainHeaderNavbarProps {
    onCreate?: MouseEventHandler<HTMLButtonElement>;
    onFilter?: MouseEventHandler<HTMLButtonElement>;
    onExport?: MouseEventHandler<HTMLButtonElement>;
}

export default function ManageMainHeaderNavbar({ onCreate, onFilter, onExport }: ManageMainHeaderNavbarProps) {
    const { t } = useTranslator('manage');

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" className="gap-2" onClick={onCreate}>
                <PlusCircle className="h-4 w-4" />
                {t('sidebar.admin.posts_create', '新增公告')}
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={onFilter}>
                <Filter className="h-4 w-4" />
                {t('sidebar.admin.tags', '條件篩選')}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={onExport}>
                <Download className="h-4 w-4" />
                {t('sidebar.admin.attachments', '匯出資料')}
            </Button>
            <Badge variant="outline" className="hidden rounded-full px-3 py-1 text-xs text-neutral-500 sm:inline-flex">
                {t('layout.sidebar.admin.dashboard', '儀表板')}
            </Badge>
        </div>
    );
}
