import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { PostFlashMessages, TranslatorFunction } from './post-types';

// 集中處理後端回傳的 flash 訊息，維持主頁面結構的整潔度。
interface PostFlashAlertsProps {
    messages: PostFlashMessages;
    t: TranslatorFunction;
}

export function PostFlashAlerts({ messages, t }: PostFlashAlertsProps) {
    const importErrors = messages.importErrors ?? [];

    return (
        <div className="space-y-3">
            {messages.success && (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                    <CheckCircle2 className="h-5 w-5" />
                    <AlertTitle>{t('posts.index.flash.success_title', '操作成功')}</AlertTitle>
                    <AlertDescription>{messages.success}</AlertDescription>
                </Alert>
            )}

            {messages.error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle>{t('posts.index.flash.error_title', '操作失敗')}</AlertTitle>
                    <AlertDescription>{messages.error}</AlertDescription>
                </Alert>
            )}

            {importErrors.length > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle>{t('posts.index.import.error_title', '部分資料未匯入')}</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc space-y-1 pl-4">
                            {importErrors.map((message, index) => (
                                <li key={`import-error-${index}`}>{message}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
