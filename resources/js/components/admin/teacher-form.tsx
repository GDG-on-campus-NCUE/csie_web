import RichTextEditor from '@/components/admin/rich-text-editor';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export interface TeacherFormData {
    user_id?: number | null;
    name: string;
    name_en: string;
    title: string;
    title_en: string;
    email?: string;
    phone?: string;
    office?: string;
    job_title?: string;
    photo_url?: string;
    bio?: string;
    bio_en?: string;
    expertise?: string;
    expertise_en?: string;
    education?: string;
    education_en?: string;
    sort_order: number;
    visible: boolean;
    _method?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Teacher {
    id?: number;
    user_id?: number | null;
    name: string;
    name_en?: string;
    title: string;
    title_en?: string;
    email?: string;
    phone?: string;
    office?: string;
    job_title?: string;
    photo_url?: string;
    bio?: string;
    bio_en?: string;
    expertise?: string;
    expertise_en?: string;
    education?: string;
    education_en?: string;
    sort_order: number;
    visible: boolean;
}

interface TeacherFormProps {
    teacher?: Teacher;
    users?: User[];
    onSubmit: (form: any) => void;
}

export default function TeacherForm({ teacher, users = [], onSubmit }: TeacherFormProps) {
    const [activeTab, setActiveTab] = useState<'zh-TW' | 'en'>('zh-TW');

    // 轉換現有資料格式為表單格式
    const transformTeacherData = (teacher?: Teacher): TeacherFormData => {
        if (!teacher) {
            return {
                name: '',
                name_en: '',
                title: '',
                title_en: '',
                bio: '',
                bio_en: '',
                expertise: '',
                expertise_en: '',
                education: '',
                education_en: '',
                sort_order: 0,
                visible: true,
            };
        }

        return {
            user_id: teacher.user_id,
            name: teacher.name || '',
            name_en: teacher.name_en || '',
            title: teacher.title || '',
            title_en: teacher.title_en || '',
            email: teacher.email || '',
            phone: teacher.phone || '',
            office: teacher.office || '',
            job_title: teacher.job_title || '',
            photo_url: teacher.photo_url || '',
            bio: teacher.bio || '',
            bio_en: teacher.bio_en || '',
            expertise: teacher.expertise || '',
            expertise_en: teacher.expertise_en || '',
            education: teacher.education || '',
            education_en: teacher.education_en || '',
            sort_order: teacher.sort_order || 0,
            visible: teacher.visible ?? true,
            ...(teacher.id ? { _method: 'put' } : {}),
        };
    };
    const form = useForm<TeacherFormData>(transformTeacherData(teacher));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    const renderRichTextField = (
        field: keyof TeacherFormData,
        label: string,
        placeholder: string,
        helpText: string
    ) => {
        const value = (form.data[field] as string) || '';

        return (
            <div className="space-y-2">
                <Label htmlFor={field as string}>{label}</Label>
                <RichTextEditor
                    id={field as string}
                    value={value}
                    placeholder={placeholder}
                    onChange={(html) => form.setData(field, html)}
                />
                <InputError message={form.errors[field]} />
                <p className="text-xs text-gray-500">{helpText}</p>
            </div>
        );
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* 左側：基本資訊 */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>基本資訊</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* 關聯使用者 */}
                            {users.length > 0 && (
                                <div>
                                    <Label htmlFor="user_id">關聯使用者</Label>
                                    <select
                                        id="user_id"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        value={form.data.user_id || ''}
                                        onChange={(e) => form.setData('user_id', e.target.value ? Number(e.target.value) : null)}
                                    >
                                        <option value="">選擇使用者（可選）</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={form.errors.user_id} />
                                </div>
                            )}

                            {/* 聯絡資訊 */}
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email || ''}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                />
                                <InputError message={form.errors.email} />
                            </div>

                            <div>
                                <Label htmlFor="phone">電話</Label>
                                <Input
                                    id="phone"
                                    value={form.data.phone || ''}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                />
                                <InputError message={form.errors.phone} />
                            </div>

                            <div>
                                <Label htmlFor="office">辦公室</Label>
                                <Input
                                    id="office"
                                    value={form.data.office || ''}
                                    onChange={(e) => form.setData('office', e.target.value)}
                                />
                                <InputError message={form.errors.office} />
                            </div>

                            <div>
                                <Label htmlFor="job_title">職務</Label>
                                <Input
                                    id="job_title"
                                    value={form.data.job_title || ''}
                                    onChange={(e) => form.setData('job_title', e.target.value)}
                                />
                                <InputError message={form.errors.job_title} />
                            </div>

                            <div>
                                <Label htmlFor="photo_url">照片 URL</Label>
                                <Input
                                    id="photo_url"
                                    type="url"
                                    value={form.data.photo_url || ''}
                                    onChange={(e) => form.setData('photo_url', e.target.value)}
                                />
                                <InputError message={form.errors.photo_url} />
                            </div>

                            <div>
                                <Label htmlFor="sort_order">排序</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={form.data.sort_order}
                                    onChange={(e) => form.setData('sort_order', Number(e.target.value))}
                                />
                                <InputError message={form.errors.sort_order} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="visible"
                                    checked={form.data.visible}
                                    onChange={(e) => form.setData('visible', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="visible">公開顯示</Label>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 右側：多語內容 */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>多語內容</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* 自製簡易 Tab */}
                            <div className="mb-4">
                                <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('zh-TW')}
                                        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'zh-TW'
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        繁體中文
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('en')}
                                        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'en'
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        English
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'zh-TW' && (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">姓名 *</Label>
                                        <Input
                                            id="name"
                                            required
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                        />
                                        <InputError message={form.errors.name} />
                                    </div>

                                    <div>
                                        <Label htmlFor="title">職稱 *</Label>
                                        <Input
                                            id="title"
                                            required
                                            value={form.data.title}
                                            onChange={(e) => form.setData('title', e.target.value)}
                                        />
                                        <InputError message={form.errors.title} />
                                    </div>

                                    {renderRichTextField(
                                        'bio',
                                        '個人簡介',
                                        '請輸入個人簡介...',
                                        '支援粗體、斜體、底線、項目符號與超連結。'
                                    )}
                                    {renderRichTextField(
                                        'expertise',
                                        '專長領域',
                                        '請輸入專長領域...',
                                        '建議以條列或段落形式說明，支援基本格式與連結。'
                                    )}
                                    {renderRichTextField(
                                        'education',
                                        '學歷',
                                        '請輸入學歷資訊...',
                                        '可使用段落或列表呈現學歷，支援基本格式與連結。'
                                    )}
                                </div>
                            )}

                            {activeTab === 'en' && (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name_en">Name</Label>
                                        <Input
                                            id="name_en"
                                            value={form.data.name_en}
                                            onChange={(e) => form.setData('name_en', e.target.value)}
                                        />
                                        <InputError message={form.errors.name_en} />
                                    </div>

                                    <div>
                                        <Label htmlFor="title_en">Title</Label>
                                        <Input
                                            id="title_en"
                                            value={form.data.title_en}
                                            onChange={(e) => form.setData('title_en', e.target.value)}
                                        />
                                        <InputError message={form.errors.title_en} />
                                    </div>

                                    {renderRichTextField(
                                        'bio_en',
                                        'Biography',
                                        'Enter biography...',
                                        'Supports bold, italic, underline, bullet list, and hyperlinks.'
                                    )}
                                    {renderRichTextField(
                                        'expertise_en',
                                        'Expertise',
                                        'Describe the areas of expertise...',
                                        'Use paragraphs or lists to highlight expertise. Basic formatting and links are supported.'
                                    )}
                                    {renderRichTextField(
                                        'education_en',
                                        'Education',
                                        'List academic background...',
                                        'Provide education history with paragraphs or bullet points. Formatting and links are supported.'
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 提交按鈕 */}
            <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    取消
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? '儲存中...' : (teacher ? '更新' : '建立')}
                </Button>
            </div>
        </form>
    );
}
