import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocalizedContent, Teacher } from '@/types/staff';

type LocalizedList = {
    'zh-TW'?: string[] | string | null;
    en?: string[] | string | null;
};

type TeacherFormTeacher = Omit<Teacher, 'education' | 'specialties' | 'bio' | 'avatar'> & {
    education?: LocalizedContent[] | LocalizedList | null;
    specialties?: LocalizedContent[] | LocalizedList | null;
    expertise?: LocalizedContent[] | LocalizedList | null;
    bio?: LocalizedContent | null;
    avatar?: string | null;
    photo_url?: string | null;
    job_title?: string | null;
};

const getLocalizedValue = (
    value: string | LocalizedContent | null | undefined,
    locale: 'zh-TW' | 'en'
): string => {
    if (!value) {
        return '';
    }

    if (typeof value === 'string') {
        return locale === 'zh-TW' ? value : '';
    }

    if (locale === 'en') {
        return value.en ?? '';
    }

    return value['zh-TW'] ?? value.en ?? '';
};

const formatLocalizedList = (
    value: LocalizedContent[] | LocalizedList | string[] | string | null | undefined,
    locale: 'zh-TW' | 'en'
): string => {
    if (!value) {
        return '';
    }

    if (typeof value === 'string') {
        return value;
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => (typeof item === 'string' ? item : getLocalizedValue(item, locale)))
            .filter((item) => item.length > 0)
            .join(',');
    }

    const localeValue = value[locale];

    if (Array.isArray(localeValue)) {
        return localeValue
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            .join(',');
    }

    if (typeof localeValue === 'string') {
        return localeValue;
    }

    return '';
};

const resolveAvatarUrl = (value: string | null | undefined): string | null => {
    if (!value) {
        return null;
    }

    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
        return value;
    }

    return `/storage/${value}`;
};

interface TeacherFormData {
    name: string;
    name_en: string;
    title: string;
    title_en: string;
    email?: string;
    phone?: string;
    office?: string;
    job_title?: string;
    photo?: File;
    bio?: string;
    bio_en?: string;
    expertise?: string;
    expertise_en?: string;
    education?: string;
    education_en?: string;
    sort_order?: number;
    visible: boolean;
    user_id?: number;
}

interface TeacherFormProps {
    teacher?: TeacherFormTeacher | null;
    onSubmit?: (data: TeacherFormData) => void;
    submitLabel?: string;
    isSubmitting?: boolean;
    users?: Array<{ id: number; name: string; email: string }>;
    onCancel?: () => void;
    errors?: Record<string, string | string[]>;
    processing?: boolean;
}

export default function TeacherForm({
    teacher,
    onSubmit,
    submitLabel = '儲存',
    isSubmitting = false,
    users = [],
    onCancel,
    errors: externalErrors,
    processing: externalProcessing
}: TeacherFormProps) {
    const specialtiesSource = teacher?.specialties ?? teacher?.expertise ?? null;
    const educationSource = teacher?.education ?? null;

    const { data, setData, processing: formProcessing, errors: formErrors } = useForm<TeacherFormData>({
        name: getLocalizedValue(teacher?.name, 'zh-TW'),
        name_en: getLocalizedValue(teacher?.name, 'en'),
        title: getLocalizedValue(teacher?.title, 'zh-TW'),
        title_en: getLocalizedValue(teacher?.title, 'en'),
        email: teacher?.email || '',
        phone: teacher?.phone || '',
        office: teacher?.office || '',
        job_title: teacher?.job_title || '',
        bio: getLocalizedValue(teacher?.bio ?? null, 'zh-TW'),
        bio_en: getLocalizedValue(teacher?.bio ?? null, 'en'),
        expertise: formatLocalizedList(specialtiesSource, 'zh-TW'),
        expertise_en: formatLocalizedList(specialtiesSource, 'en'),
        education: formatLocalizedList(educationSource, 'zh-TW'),
        education_en: formatLocalizedList(educationSource, 'en'),
        sort_order: teacher?.sort_order ?? 0,
        visible: teacher?.visible ?? true,
        user_id: teacher?.user_id ?? undefined,
    });

    const avatarUrl = resolveAvatarUrl(teacher?.photo_url ?? teacher?.avatar ?? null);
    const teacherNameZh = getLocalizedValue(teacher?.name, 'zh-TW');

    const processing = externalProcessing ?? formProcessing;

    const errors = React.useMemo(() => {
        const source = externalErrors ?? formErrors ?? {};
        const normalized: Record<string, string> = {};

        Object.entries(source).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                normalized[key] = value.join('\n');
            } else if (value) {
                normalized[key] = value;
            }
        });

        return normalized;
    }, [externalErrors, formErrors]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{teacher ? '編輯教師資料' : '新增教師資料'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 基本資訊 */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">姓名 (中文) *</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name_en">姓名 (英文) *</Label>
                            <Input
                                id="name_en"
                                name="name_en"
                                type="text"
                                value={data.name_en}
                                onChange={(e) => setData('name_en', e.target.value)}
                                required
                            />
                            {errors.name_en && (
                                <p className="text-sm text-red-600">{errors.name_en}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">職稱 (中文) *</Label>
                            <Input
                                id="title"
                                name="title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                required
                            />
                            {errors.title && (
                                <p className="text-sm text-red-600">{errors.title}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title_en">職稱 (英文) *</Label>
                            <Input
                                id="title_en"
                                name="title_en"
                                type="text"
                                value={data.title_en}
                                onChange={(e) => setData('title_en', e.target.value)}
                                required
                            />
                            {errors.title_en && (
                                <p className="text-sm text-red-600">{errors.title_en}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">電子郵件</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">電話</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="office">辦公室</Label>
                            <Input
                                id="office"
                                name="office"
                                type="text"
                                value={data.office}
                                onChange={(e) => setData('office', e.target.value)}
                            />
                            {errors.office && (
                                <p className="text-sm text-red-600">{errors.office}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="job_title">職務</Label>
                            <Input
                                id="job_title"
                                name="job_title"
                                type="text"
                                value={data.job_title}
                                onChange={(e) => setData('job_title', e.target.value)}
                            />
                            {errors.job_title && (
                                <p className="text-sm text-red-600">{errors.job_title}</p>
                            )}
                        </div>
                    </div>

                    {/* 使用者關聯 */}
                    {users.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="user_id">關聯使用者帳號</Label>
                            <select
                                id="user_id"
                                value={data.user_id || ''}
                                onChange={(e) => setData('user_id', e.target.value ? parseInt(e.target.value) : undefined)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">請選擇...</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                            {errors.user_id && (
                                <p className="text-sm text-red-600">{errors.user_id}</p>
                            )}
                        </div>
                    )}

                    {/* 照片上傳 */}
                    <div className="space-y-2">
                        <Label htmlFor="photo">照片</Label>
                        {avatarUrl && (
                            <div className="mb-2">
                                <img
                                    src={avatarUrl}
                                    alt={teacherNameZh || '教師頭像'}
                                    className="h-20 w-20 rounded-full object-cover"
                                />
                            </div>
                        )}
                        <Input
                            id="photo"
                            name="photo"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('photo', e.target.files?.[0])}
                        />
                        {errors.photo && (
                            <p className="text-sm text-red-600">{errors.photo}</p>
                        )}
                    </div>

                    {/* 簡介 */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="bio">簡介 (中文)</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                value={data.bio}
                                onChange={(e) => setData('bio', e.target.value)}
                                rows={4}
                            />
                            {errors.bio && (
                                <p className="text-sm text-red-600">{errors.bio}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio_en">簡介 (英文)</Label>
                            <Textarea
                                id="bio_en"
                                name="bio_en"
                                value={data.bio_en}
                                onChange={(e) => setData('bio_en', e.target.value)}
                                rows={4}
                            />
                            {errors.bio_en && (
                                <p className="text-sm text-red-600">{errors.bio_en}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expertise">專長 (中文)</Label>
                            <Textarea
                                id="expertise"
                                name="expertise"
                                value={data.expertise}
                                onChange={(e) => setData('expertise', e.target.value)}
                                rows={3}
                            />
                            {errors.expertise && (
                                <p className="text-sm text-red-600">{errors.expertise}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expertise_en">專長 (英文)</Label>
                            <Textarea
                                id="expertise_en"
                                name="expertise_en"
                                value={data.expertise_en}
                                onChange={(e) => setData('expertise_en', e.target.value)}
                                rows={3}
                            />
                            {errors.expertise_en && (
                                <p className="text-sm text-red-600">{errors.expertise_en}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="education">學歷 (中文)</Label>
                            <Textarea
                                id="education"
                                name="education"
                                value={data.education}
                                onChange={(e) => setData('education', e.target.value)}
                                rows={3}
                            />
                            {errors.education && (
                                <p className="text-sm text-red-600">{errors.education}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="education_en">學歷 (英文)</Label>
                            <Textarea
                                id="education_en"
                                name="education_en"
                                value={data.education_en}
                                onChange={(e) => setData('education_en', e.target.value)}
                                rows={3}
                            />
                            {errors.education_en && (
                                <p className="text-sm text-red-600">{errors.education_en}</p>
                            )}
                        </div>
                    </div>

                    {/* 設定 */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="sort_order">排序</Label>
                            <Input
                                id="sort_order"
                                name="sort_order"
                                type="number"
                                min="0"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                            />
                            {errors.sort_order && (
                                <p className="text-sm text-red-600">{errors.sort_order}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="visible"
                                checked={data.visible}
                                onCheckedChange={(checked) => setData('visible', checked as boolean)}
                            />
                            <Label htmlFor="visible">顯示於前台</Label>
                        </div>
                    </div>

                    {/* 提交按鈕 */}
                    <div className="flex justify-end space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                if (onCancel) {
                                    onCancel();
                                } else {
                                    window.history.back();
                                }
                            }}
                        >
                            取消
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || isSubmitting}
                        >
                            {processing || isSubmitting ? '處理中...' : submitLabel}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
