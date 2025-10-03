import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types/shared';
import type { ManageProjectDetail, ManageProjectFormData } from '@/types/manage/teacher';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

interface ProjectSpace {
    id: number;
    name: string;
}

interface TagOption {
    id: number;
    name: string;
}

interface ManageTeacherProjectsEditPageProps {
    auth: { user: { id: number; name: string; email: string; role: string } };
    flash: { success?: string; error?: string };
    locale: string;
    project: ManageProjectDetail;
    spaces: ProjectSpace[];
    tagOptions: TagOption[];
    [key: string]: unknown;
}

export default function ManageTeacherProjectsEdit() {
    const page = usePage<ManageTeacherProjectsEditPageProps>();
    const { project, spaces } = page.props;
    const { t } = useTranslator('manage');

    const { data, setData, put, processing, errors } = useForm<ManageProjectFormData>({
        title: project.title,
        title_en: project.title_en || '',
        sponsor: project.sponsor,
        principal_investigator: project.principal_investigator,
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        total_budget: project.total_budget || undefined,
        summary: project.summary || '',
        tags: project.tags?.map((tag) => tag.name) || [],
        space_id: project.space_id || undefined,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.teacher.projects', '研究計畫'),
            href: '/manage/teacher/projects',
        },
        {
            title: project.title,
            href: `/manage/teacher/projects/${project.id}`,
        },
        {
            title: t('teacher.projects.edit', '編輯計畫'),
            href: `/manage/teacher/projects/${project.id}/edit`,
        },
    ];

    const pageTitle = `${t('teacher.projects.edit', '編輯')} - ${project.title}`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/manage/teacher/projects/${project.id}`);
    };

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('teacher.projects.edit_description', '修改研究計畫資訊。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    <Button variant="ghost" size="sm" className="gap-2" asChild>
                        <Link href={`/manage/teacher/projects/${project.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                            {t('layout.back', '返回詳情')}
                        </Link>
                    </Button>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 基本資訊 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('teacher.projects.form.basic_info', '基本資訊')}</CardTitle>
                            <CardDescription>
                                {t('teacher.projects.form.basic_info_description', '計畫的基本資料與識別資訊。')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* 計畫名稱 */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="required">
                                        {t('teacher.projects.form.title', '計畫名稱')}
                                    </Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder={t('teacher.projects.form.title_placeholder', '輸入計畫中文名稱')}
                                        className={errors.title ? 'border-destructive' : ''}
                                    />
                                    {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="title_en">{t('teacher.projects.form.title_en', '計畫英文名稱')}</Label>
                                    <Input
                                        id="title_en"
                                        value={data.title_en || ''}
                                        onChange={(e) => setData('title_en', e.target.value)}
                                        placeholder={t('teacher.projects.form.title_en_placeholder', '輸入計畫英文名稱')}
                                    />
                                </div>
                            </div>

                            {/* 執行單位與主持人 */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="sponsor" className="required">
                                        {t('teacher.projects.form.sponsor', '執行單位')}
                                    </Label>
                                    <Input
                                        id="sponsor"
                                        value={data.sponsor}
                                        onChange={(e) => setData('sponsor', e.target.value)}
                                        placeholder={t('teacher.projects.form.sponsor_placeholder', '例：科技部、教育部')}
                                        className={errors.sponsor ? 'border-destructive' : ''}
                                    />
                                    {errors.sponsor && <p className="text-sm text-destructive">{errors.sponsor}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="principal_investigator" className="required">
                                        {t('teacher.projects.form.principal', '計畫主持人')}
                                    </Label>
                                    <Input
                                        id="principal_investigator"
                                        value={data.principal_investigator}
                                        onChange={(e) => setData('principal_investigator', e.target.value)}
                                        className={errors.principal_investigator ? 'border-destructive' : ''}
                                    />
                                    {errors.principal_investigator && (
                                        <p className="text-sm text-destructive">{errors.principal_investigator}</p>
                                    )}
                                </div>
                            </div>

                            {/* 期間與經費 */}
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date" className="required">
                                        {t('teacher.projects.form.start_date', '開始日期')}
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className={errors.start_date ? 'border-destructive' : ''}
                                    />
                                    {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">{t('teacher.projects.form.end_date', '結束日期')}</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date || ''}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                    />
                                    {errors.end_date && <p className="text-sm text-destructive">{errors.end_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="total_budget">{t('teacher.projects.form.budget', '總經費（元）')}</Label>
                                    <Input
                                        id="total_budget"
                                        type="number"
                                        min="0"
                                        value={data.total_budget || ''}
                                        onChange={(e) => setData('total_budget', e.target.value ? Number(e.target.value) : undefined)}
                                        placeholder="1000000"
                                    />
                                    {errors.total_budget && <p className="text-sm text-destructive">{errors.total_budget}</p>}
                                </div>
                            </div>

                            {/* 計畫摘要 */}
                            <div className="space-y-2">
                                <Label htmlFor="summary">{t('teacher.projects.form.summary', '計畫摘要')}</Label>
                                <Textarea
                                    id="summary"
                                    value={data.summary || ''}
                                    onChange={(e) => setData('summary', e.target.value)}
                                    placeholder={t('teacher.projects.form.summary_placeholder', '簡述計畫目標、方法與預期成果...')}
                                    rows={5}
                                />
                                {errors.summary && <p className="text-sm text-destructive">{errors.summary}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 其他設定 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('teacher.projects.form.additional_info', '其他設定')}</CardTitle>
                            <CardDescription>
                                {t('teacher.projects.form.additional_info_description', '標籤分類與資源連結。')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* 標籤 */}
                            <div className="space-y-2">
                                <Label htmlFor="tags">{t('teacher.projects.form.tags', '標籤')}</Label>
                                <Input
                                    id="tags"
                                    value={data.tags?.join(', ') || ''}
                                    onChange={(e) => setData('tags', e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))}
                                    placeholder={t('teacher.projects.form.tags_placeholder', '輸入標籤，以逗號分隔（例：AI, Machine Learning）')}
                                />
                                <p className="text-sm text-neutral-500">
                                    {t('teacher.projects.form.tags_hint', '標籤有助於分類與搜尋，以逗號分隔多個標籤。')}
                                </p>
                            </div>

                            {/* Space 綁定 */}
                            <div className="space-y-2">
                                <Label htmlFor="space_id">{t('teacher.projects.form.space', '關聯 Space 資源')}</Label>
                                <Select
                                    id="space_id"
                                    value={data.space_id?.toString() || ''}
                                    onChange={(e) => setData('space_id', e.target.value ? Number(e.target.value) : undefined)}
                                >
                                    <option value="">{t('teacher.projects.form.no_space', '不綁定')}</option>
                                    {spaces.map((space) => (
                                        <option key={space.id} value={space.id}>
                                            {space.name}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 操作按鈕 */}
                    <div className="flex items-center justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/manage/teacher/projects/${project.id}`}>{t('layout.cancel', '取消')}</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="h-4 w-4" />
                            {processing ? t('layout.saving', '儲存中...') : t('layout.save', '儲存')}
                        </Button>
                    </div>
                </form>
            </ManagePage>
        </>
    );
}

ManageTeacherProjectsEdit.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
