import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MultiLanguageInput from '../staff/MultiLanguageInput';
import { Lab, Teacher, TeacherFormData } from '@/types/staff';

interface TeacherFormProps {
    teacher?: Teacher;
    onSubmit: (data: TeacherFormData) => void;
    submitLabel?: string;
    isSubmitting?: boolean;
    labs?: Lab[];
}

export const TeacherForm: React.FC<TeacherFormProps> = ({
    teacher,
    onSubmit,
    submitLabel = '保存',
    isSubmitting = false,
    labs = []
}) => {
    const { data, setData, processing, errors, reset } = useForm<TeacherFormData>({
        name: {
            'zh-TW': teacher?.name?.['zh-TW'] || '',
            'en': teacher?.name?.['en'] || ''
        },
        title: {
            'zh-TW': teacher?.title?.['zh-TW'] || '',
            'en': teacher?.title?.['en'] || ''
        },
        bio: {
            'zh-TW': teacher?.bio?.['zh-TW'] || '',
            'en': teacher?.bio?.['en'] || ''
        },
        specialties: teacher?.specialties || [],
        education: teacher?.education || [],
        email: teacher?.email || '',
        phone: teacher?.phone || '',
        office: teacher?.office || '',
        website: teacher?.website || '',
        lab_id: teacher?.lab_id,
        sort_order: teacher?.sort_order || 0,
        visible: teacher?.visible ?? true
    } as TeacherFormData);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(data);
    };

    const handleNameChange = (locale: 'zh-TW' | 'en', value: string) => {
        setData('name', {
            ...data.name,
            [locale]: value
        });
    };

    const handleTitleChange = (locale: 'zh-TW' | 'en', value: string) => {
        setData('title', {
            ...data.title,
            [locale]: value
        });
    };

    const handleBioChange = (locale: 'zh-TW' | 'en', value: string) => {
        if (data.bio) {
            setData('bio', {
                'zh-TW': locale === 'zh-TW' ? value : data.bio['zh-TW'] || '',
                'en': locale === 'en' ? value : data.bio['en'] || ''
            });
        } else {
            setData('bio', {
                'zh-TW': locale === 'zh-TW' ? value : '',
                'en': locale === 'en' ? value : ''
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>基本資訊 / Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 姓名 */}
                    <MultiLanguageInput
                        label="姓名 / Name"
                        name="name"
                        required
                        values={{
                            'zh-TW': data.name['zh-TW'],
                            'en': data.name['en'] || ''
                        }}
                        onChange={handleNameChange}
                        placeholder={{
                            'zh-TW': '請輸入姓名',
                            'en': 'Enter name'
                        }}
                        errors={{
                            'zh-TW': errors['name.zh-TW'],
                            'en': errors['name.en']
                        }}
                    />

                    {/* 職稱 */}
                    <MultiLanguageInput
                        label="職稱 / Title"
                        name="title"
                        required
                        values={{
                            'zh-TW': data.title['zh-TW'],
                            'en': data.title['en'] || ''
                        }}
                        onChange={handleTitleChange}
                        placeholder={{
                            'zh-TW': '請輸入職稱',
                            'en': 'Enter title'
                        }}
                        errors={{
                            'zh-TW': errors['title.zh-TW'],
                            'en': errors['title.en']
                        }}
                    />

                    {/* 電子信箱 */}
                    <div>
                        <Label htmlFor="email">電子信箱 / Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>聯絡資訊 / Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 電話 */}
                    <div>
                        <Label htmlFor="phone">電話 / Phone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="+886-2-1234-5678"
                        />
                        {errors.phone && (
                            <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                        )}
                    </div>

                    {/* 辦公室 */}
                    <div>
                        <Label htmlFor="office">辦公室 / Office</Label>
                        <Input
                            id="office"
                            type="text"
                            value={data.office}
                            onChange={(e) => setData('office', e.target.value)}
                            placeholder="例: 德田館 123 室"
                        />
                        {errors.office && (
                            <p className="text-sm text-red-600 mt-1">{errors.office}</p>
                        )}
                    </div>

                    {/* 個人網站 */}
                    <div>
                        <Label htmlFor="website">個人網站 / Website</Label>
                        <Input
                            id="website"
                            type="url"
                            value={data.website}
                            onChange={(e) => setData('website', e.target.value)}
                            placeholder="https://example.com"
                        />
                        {errors.website && (
                            <p className="text-sm text-red-600 mt-1">{errors.website}</p>
                        )}
                    </div>

                    {/* 頭像 */}
                    <div>
                        <Label htmlFor="avatar">頭像 / Avatar</Label>
                        <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('avatar', e.target.files?.[0])}
                        />
                        {errors.avatar && (
                            <p className="text-sm text-red-600 mt-1">{errors.avatar}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>詳細資訊 / Detailed Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 個人簡介 */}
                    <MultiLanguageInput
                        label="個人簡介 / Bio"
                        name="bio"
                        type="textarea"
                        values={{
                            'zh-TW': data.bio?.['zh-TW'] || '',
                            'en': data.bio?.['en'] || ''
                        }}
                        onChange={handleBioChange}
                        placeholder={{
                            'zh-TW': '請輸入個人簡介',
                            'en': 'Enter bio'
                        }}
                        errors={{
                            'zh-TW': errors['bio.zh-TW'],
                            'en': errors['bio.en']
                        }}
                        rows={6}
                    />

                    {/* 排序和顯示 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="sort_order">排序 / Sort Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                min="0"
                            />
                            {errors.sort_order && (
                                <p className="text-sm text-red-600 mt-1">{errors.sort_order}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 mt-6">
                            <Checkbox
                                id="visible"
                                checked={data.visible}
                                onCheckedChange={(checked) => setData('visible', checked as boolean)}
                            />
                            <Label htmlFor="visible">顯示 / Visible</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 提交按鈕 */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={processing || isSubmitting}
                    className="px-8"
                >
                    {(processing || isSubmitting) ? '保存中...' : submitLabel}
                </Button>
            </div>
        </form>
    );
};

export default TeacherForm;
