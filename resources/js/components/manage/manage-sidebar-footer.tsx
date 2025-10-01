import { Button } from '@/components/ui/button';
import { useTranslator } from '@/hooks/use-translator';
import { ExternalLink, Github, Settings } from 'lucide-react';

export default function ManageSidebarFooter() {
    const { t } = useTranslator('manage');

    return (
        <div className="flex flex-col gap-2 p-4 text-sm text-white/80">
            <Button variant="ghost" size="sm" className="justify-start gap-2 text-white/80 hover:bg-white/10 hover:text-white">
                <Settings className="h-4 w-4" />
                {t('sidebar.footer.settings', '系統設定')}
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2 text-white/80 hover:bg-white/10 hover:text-white"
                asChild
            >
                <a href="https://csie.ncku.edu.tw" target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    {t('sidebar.footer.docs', '操作手冊')}
                </a>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2 text-white/80 hover:bg-white/10 hover:text-white"
                asChild
            >
                <a href="https://github.com" target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4" />
                    {t('sidebar.footer.repo', '程式碼倉庫')}
                </a>
            </Button>
        </div>
    );
}
