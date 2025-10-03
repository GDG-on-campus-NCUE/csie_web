import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types/shared';
import { Head, Link } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { Eye, ThumbsUp, ArrowLeft } from 'lucide-react';

interface Faq {
    id: number;
    question: string;
    question_en: string;
    answer: string;
    answer_en: string;
    category: string;
    views: number;
    is_helpful: boolean;
}

interface FaqShowPageProps {
    faq: Faq;
    relatedFaqs: Faq[];
    [key: string]: unknown;
}

const categoryLabels: { [key: string]: string } = {
    account: '帳號相關',
    technical: '技術問題',
    feature: '功能使用',
    other: '其他',
};

export default function FaqShow({ faq, relatedFaqs }: FaqShowPageProps) {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理後台'), href: '/manage/user/dashboard' },
        { title: '常見問題', href: '/manage/user/support/faqs' },
        { title: faq.question, href: `/manage/user/support/faqs/${faq.id}` },
    ];

    return (
        <>
            <Head title={faq.question} />
            <ManagePage
                title={faq.question}
                description={`分類：${categoryLabels[faq.category] || faq.category}`}
                breadcrumbs={breadcrumbs}
                actions={
                    <Link href="/manage/user/support/faqs">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            返回列表
                        </Button>
                    </Link>
                }
            >
                {/* 問題與答案 */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{faq.question}</CardTitle>
                            <div className="flex gap-2">
                                <Badge className="bg-blue-100 text-blue-800">
                                    {categoryLabels[faq.category] || faq.category}
                                </Badge>
                                {faq.is_helpful && (
                                    <Badge className="bg-green-100 text-green-800">熱門</Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {faq.views} 次瀏覽
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="prose max-w-none">
                            <div
                                className="whitespace-pre-wrap rounded-lg bg-muted p-6"
                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                            />
                        </div>

                        {/* 英文版本（如有） */}
                        {faq.answer_en && (
                            <div className="mt-6">
                                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                                    English Version
                                </h3>
                                <div className="prose max-w-none">
                                    <div
                                        className="whitespace-pre-wrap rounded-lg bg-muted p-6"
                                        dangerouslySetInnerHTML={{ __html: faq.answer_en }}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 這篇文章有幫助嗎？ */}
                <Card className="mb-6">
                    <CardContent className="py-6 text-center">
                        <p className="mb-4 text-lg font-medium">這篇文章有幫助嗎？</p>
                        <div className="flex justify-center gap-4">
                            <Button variant="outline" className="gap-2">
                                <ThumbsUp className="h-4 w-4" />
                                有幫助
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <ThumbsUp className="h-4 w-4 rotate-180" />
                                沒幫助
                            </Button>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            如果這篇文章無法解決您的問題，
                            <Link
                                href="/manage/user/support/tickets/create"
                                className="text-primary underline"
                            >
                                建立支援工單
                            </Link>
                        </p>
                    </CardContent>
                </Card>

                {/* 相關問題 */}
                {relatedFaqs && relatedFaqs.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>相關問題</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {relatedFaqs.map((relatedFaq) => (
                                    <Link
                                        key={relatedFaq.id}
                                        href={`/manage/user/support/faqs/${relatedFaq.id}`}
                                    >
                                        <div className="group flex items-center justify-between rounded-lg border p-4 transition-all hover:border-primary hover:bg-primary/5">
                                            <div className="flex-1">
                                                <h3 className="font-medium group-hover:text-primary">
                                                    {relatedFaq.question}
                                                </h3>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <Badge className="bg-blue-100 text-blue-800">
                                                        {categoryLabels[relatedFaq.category] ||
                                                            relatedFaq.category}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {relatedFaq.views} 次瀏覽
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </ManagePage>
        </>
    );
}

FaqShow.layout = (page: ReactElement) => <AppLayout children={page} />;
