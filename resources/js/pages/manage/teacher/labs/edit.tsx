import { useState } from 'react';
import type { FormEvent, ReactElement, ChangeEvent } from 'react';

import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import type { ManageLabDetail } from '@/types/manage/teacher';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Save, X } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

type ManageTeacherLabsEditPageProps = SharedData & {
    lab: ManageLabDetail;
    users: User[];
};

export default function ManageTeacherLabsEdit() {
    const page = usePage<ManageTeacherLabsEditPageProps>();
    const { lab, users } = page.props;

    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.teacher.labs', '實驗室'),
            href: '/manage/teacher/labs',
        },
        {
            title: lab.name,
            href: `/manage/teacher/labs/${lab.id}`,
        }
    ];

    // 初始化表單資料
    const initialMembers = (lab.members || []).map(m => m.id);

    const { data, setData, put, processing, errors } = useForm({
        name: lab.name || '',
        name_en: lab.name_en || '',
        field: lab.field || '',
        location: lab.location || '',
        capacity: lab.capacity,
        description: lab.description || '',
        description_en: lab.description_en || '',
        equipment_summary: lab.equipment_summary || '',
        website_url: lab.website_url || '',
        contact_email: lab.contact_email || '',
        contact_phone: lab.contact_phone || '',
        cover_image_url: lab.cover_image_url || '',
        visible: lab.visible,
        sort_order: lab.sort_order || 0,
        principal_investigator_id: lab.principal_investigator_id,
        members: initialMembers,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/manage/teacher/labs/${lab.id}`);
    };

    const handleCancel = () => {
        if (confirm(t('common.confirm_cancel', '確定要取消嗎？未儲存的變更將遺失。'))) {
            router.visit(`/manage/teacher/labs/${lab.id}`);
        }
    };

    const toggleMember = (userId: number) => {
        const current = data.members || [];
        const updated = current.includes(userId)
            ? current.filter((id: number) => id !== userId)
            : [...current, userId];
        setData('members', updated);
    };

    const teachers = users.filter(u => u.role === 'teacher');
    const students = users.filter(u => u.role === 'user');

    const pageTitle = t('common.edit', '編輯') + ' - ' + lab.name;

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('teacher.labs.edit_description', '修改實驗室資訊與成員。')}
                breadcrumbs={breadcrumbs}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 基本資訊 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('teacher.labs.section.basic', '基本資訊')}</CardTitle>
                            <CardDescription>
                                {t('teacher.labs.section.basic_desc', '實驗室名稱、研究領域等基本資訊')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="required">
                                        {t('teacher.labs.field.name', '實驗室名稱')}
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                        placeholder={t('teacher.labs.placeholder.name', '例：人工智慧與機器學習實驗室')}
                                        required
                                        aria-invalid={!!errors.name}
                                    />
                                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name_en">
                                        {t('teacher.labs.field.name_en', '英文名稱')}
                                    </Label>
                                    <Input
                                        id="name_en"
                                        value={data.name_en || ''}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('name_en', e.target.value)}
                                        placeholder="AI and Machine Learning Lab"
                                    />
                                    {errors.name_en && <p className="text-sm text-red-600">{errors.name_en}</p>}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="field" className="required">
                                        {t('teacher.labs.field.field', '研究領域')}
                                    </Label>
                                    <Input
                                        id="field"
                                        value={data.field || ''}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('field', e.target.value)}
                                        placeholder={t('teacher.labs.placeholder.field', '例：人工智慧、網路安全、資料科學')}
                                        required
                                        aria-invalid={!!errors.field}
                                    />
                                    {errors.field && <p className="text-sm text-red-600">{errors.field}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="principal_investigator_id">
                                        {t('teacher.labs.field.pi', '主持人')}
                                    </Label>
                                    <Select
                                        id="principal_investigator_id"
                                        value={data.principal_investigator_id?.toString() || ''}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                            const value = e.target.value;
                                            setData('principal_investigator_id', value ? Number(value) : null);
                                        }}
                                    >
                                        <option value="">{t('common.select_none', '無')}</option>
                                        {teachers.map(teacher => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.name} ({teacher.email})
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="location">
                                        {t('teacher.labs.field.location', '位置')}
                                    </Label>
                                    <Input
                                        id="location"
                                        value={data.location || ''}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('location', e.target.value)}
                                        placeholder={t('teacher.labs.placeholder.location', '例：資訊大樓 5 樓 503 室')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="capacity">
                                        {t('teacher.labs.field.capacity', '容量')}
                                    </Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={data.capacity?.toString() || ''}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                            const value = e.target.value;
                                            setData('capacity', value ? Number(value) : null);
                                        }}
                                        placeholder="30"
                                    />
                                    {errors.capacity && <p className="text-sm text-red-600">{errors.capacity}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    {t('teacher.labs.field.description', '描述')}
                                </Label>
                                <Textarea
                                    id="description"
                                    rows={4}
                                    value={data.description || ''}
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                    placeholder={t('teacher.labs.placeholder.description', '實驗室的研究方向、目標等...')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description_en">
                                    {t('teacher.labs.field.description_en', '英文描述')}
                                </Label>
                                <Textarea
                                    id="description_en"
                                    rows={4}
                                    value={data.description_en || ''}
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setData('description_en', e.target.value)}
                                    placeholder="Lab research focus and objectives..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 聯絡資訊與網站 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('teacher.labs.section.contact', '聯絡資訊')}</CardTitle>
                            <CardDescription>
                                {t('teacher.labs.section.contact_desc', '實驗室的聯絡方式與相關連結')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_email">
                                        {t('teacher.labs.field.email', '聯絡 Email')}
                                    </Label>
                                    <Input
                                        id="contact_email"
                                        type="email"
                                        value={data.contact_email || ''}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('contact_email', e.target.value)}
                                        placeholder="lab@example.edu.tw"
                                    />
                                    {errors.contact_email && <p className="text-sm text-red-600">{errors.contact_email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_phone">
                                        {t('teacher.labs.field.phone', '聯絡電話')}
                                    </Label>
                                    <Input
                                        id="contact_phone"
                                        type="tel"
                                        value={data.contact_phone || ''}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('contact_phone', e.target.value)}
                                        placeholder="02-1234-5678"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website_url">
                                    {t('teacher.labs.field.website', '網站網址')}
                                </Label>
                                <Input
                                    id="website_url"
                                    type="url"
                                    value={data.website_url || ''}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setData('website_url', e.target.value)}
                                    placeholder="https://lab.example.edu.tw"
                                />
                                {errors.website_url && <p className="text-sm text-red-600">{errors.website_url}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cover_image_url">
                                    {t('teacher.labs.field.cover_image', '封面圖片網址')}
                                </Label>
                                <Input
                                    id="cover_image_url"
                                    type="url"
                                    value={data.cover_image_url || ''}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setData('cover_image_url', e.target.value)}
                                    placeholder="https://example.com/images/lab-cover.jpg"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="equipment_summary">
                                    {t('teacher.labs.field.equipment', '設備概要')}
                                </Label>
                                <Textarea
                                    id="equipment_summary"
                                    rows={3}
                                    value={data.equipment_summary || ''}
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setData('equipment_summary', e.target.value)}
                                    placeholder={t('teacher.labs.placeholder.equipment', '主要設備與儀器清單...')}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 成員選擇 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('teacher.labs.section.members', '實驗室成員')}</CardTitle>
                            <CardDescription>
                                {t('teacher.labs.section.members_desc', '選擇加入此實驗室的成員')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {students.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {students.map(user => (
                                        <label
                                            key={user.id}
                                            className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3 cursor-pointer hover:bg-neutral-50 transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={(data.members || []).includes(user.id)}
                                                onChange={() => toggleMember(user.id)}
                                                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm text-neutral-900">{user.name}</div>
                                                <div className="text-xs text-neutral-500 truncate">{user.email}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-500 text-center py-8">
                                    {t('teacher.labs.no_students', '目前沒有可選擇的學生')}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* 其他設定 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('teacher.labs.section.settings', '其他設定')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <input
                                    id="visible"
                                    type="checkbox"
                                    checked={data.visible}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setData('visible', e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <div className="space-y-0.5">
                                    <Label htmlFor="visible">
                                        {t('teacher.labs.field.visible', '公開顯示')}
                                    </Label>
                                    <p className="text-sm text-neutral-500">
                                        {t('teacher.labs.field.visible_desc', '是否在前台網站顯示此實驗室')}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sort_order">
                                    {t('teacher.labs.field.sort_order', '排序順序')}
                                </Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    min="0"
                                    value={data.sort_order?.toString() || '0'}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        const value = e.target.value;
                                        setData('sort_order', value ? Number(value) : 0);
                                    }}
                                />
                                <p className="text-xs text-neutral-500">
                                    {t('teacher.labs.field.sort_order_desc', '數字越小排序越前面')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 操作按鈕 */}
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={processing}
                        >
                            <X className="mr-2 h-4 w-4" />
                            {t('common.cancel', '取消')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? t('common.saving', '儲存中...') : t('common.save', '儲存')}
                        </Button>
                    </div>
                </form>
            </ManagePage>
        </>
    );
}

ManageTeacherLabsEdit.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
