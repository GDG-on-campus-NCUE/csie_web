import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types/shared';
import { Head, Link, router } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Search, HelpCircle, ChevronRight } from 'lucide-react';

interface Faq {
    id: number;
    question: string;
    question_en: string;
    category: string;
    views: number;
    is_helpful: boolean;
}

interface FaqsByCategory {
    [category: string]: Faq[];
}

interface FaqsIndexPageProps {
    faqs: Faq[];
    faqsByCategory: FaqsByCategory;
    filters: {
        search?: string;
        category?: string;
    };
    categories: string[];
    [key: string]: unknown;
}

const categoryLabels: { [key: string]: string } = {
    account: '帳號相關',
    technical: '技術問題',
    feature: '功能使用',
    other: '其他',
};

export default function FaqsIndex({
    faqs,
    faqsByCategory,
    filters,
    categories,
}: FaqsIndexPageProps) {
    const { t } = useTranslator('manage');
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理後台'), href: '/manage/user/dashboard' },
        { title: '常見問題', href: '/manage/user/support/faqs' },
    ];

    const handleFilter = () => {
        router.get(
            '/manage/user/support/faqs',
            {
                search: search || undefined,
                category: category !== 'all' ? category : undefined,
            },
            { preserveState: true }
        );
    };

    return (
        <>
            <Head title="常見問題 FAQ" />
            <ManagePage
                title="常見問題 FAQ"
                description="快速找到您需要的答案"
                breadcrumbs={breadcrumbs}
            >
                {/* 搜尋與篩選 */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="搜尋問題..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    className="pl-9"
                                />
                            </div>

                            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="all">全部分類</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {categoryLabels[cat] || cat}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button onClick={handleFilter}>搜尋</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* FAQ 列表（依分類分組） */}
                {Object.keys(faqsByCategory).length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <HelpCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-lg font-medium text-muted-foreground">查無相關問題</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                請嘗試其他搜尋關鍵字或
                                <Link
                                    href="/manage/user/support/tickets/create"
                                    className="text-primary underline"
                                >
                                    建立支援工單
                                </Link>
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(faqsByCategory).map(([cat, items]) => (
                            <Card key={cat}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Badge className="bg-blue-100 text-blue-800">
                                            {categoryLabels[cat] || cat}
                                        </Badge>
                                        <span className="text-sm font-normal text-muted-foreground">
                                            {items.length} 個問題
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {items.map((faq) => (
                                            <Link
                                                key={faq.id}
                                                href={`/manage/user/support/faqs/${faq.id}`}
                                            >
                                                <div className="group flex items-center justify-between rounded-lg border p-4 transition-all hover:border-primary hover:bg-primary/5">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium group-hover:text-primary">
                                                            {faq.question}
                                                        </h3>
                                                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                                                            <span>瀏覽次數: {faq.views}</span>
                                                            {faq.is_helpful && (
                                                                <Badge className="bg-green-100 text-green-800">
                                                                    熱門
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* 還是找不到答案？ */}
                <Card className="mt-6">
                    <CardContent className="py-6 text-center">
                        <p className="mb-4 text-lg font-medium">找不到您需要的答案？</p>
                        <Link href="/manage/user/support/tickets/create">
                            <Button>建立支援工單</Button>
                        </Link>
                    </CardContent>
                </Card>
            </ManagePage>
        </>
    );
}

FaqsIndex.layout = (page: ReactElement) => <AppLayout children={page} />;
