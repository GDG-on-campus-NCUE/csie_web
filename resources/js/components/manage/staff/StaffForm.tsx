import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import MultiLanguageInput from './MultiLanguageInput';
import { LocalizedContent, Staff } from '@/types/staff';

const extractStaffLocalizedField = (
    staff: Staff | undefined,
    field: 'name' | 'position' | 'bio'
): { 'zh-TW': string; en: string } => {
    const baseRecord = staff as unknown as Record<string, string | LocalizedContent | undefined> | undefined;
    const fallbackRecord = staff as unknown as Record<string, string | undefined> | undefined;

    const value = baseRecord?.[field];
    const fallbackEn = fallbackRecord?.[`${field}_en`] ?? '';

    if (value && typeof value === 'object') {
        const localized = value as LocalizedContent;
        return {
            'zh-TW': localized['zh-TW'] ?? '',
            en: localized.en ?? fallbackEn,
        };
    }

    if (typeof value === 'string') {
        return {
            'zh-TW': value,
            en: fallbackEn,
        };
    }

    return {
        'zh-TW': '',
        en: fallbackEn,
    };
};

interface StaffFormData {
    name: {
        'zh-TW': string;
        'en': string;
    };
    position: {
        'zh-TW': string;
        'en': string;
    };
    bio: {
        'zh-TW': string;
        'en': string;
    };
    email?: string;
    phone?: string;
    avatar?: File;
    sort_order?: number;
    visible: boolean;
}

interface StaffFormProps {
    staff?: Staff;
    onSubmit: (data: StaffFormData) => void;
    submitLabel?: string;
    isSubmitting?: boolean;
}

export const StaffForm: React.FC<StaffFormProps> = ({
    staff,
    onSubmit,
    submitLabel = '保存',
    isSubmitting = false
}) => {
    const [isUploading, setIsUploading] = useState(false);

    const nameValues = extractStaffLocalizedField(staff, 'name');
    const positionValues = extractStaffLocalizedField(staff, 'position');
    const bioValues = extractStaffLocalizedField(staff, 'bio');

    const { data, setData, processing, errors, reset } = useForm<StaffFormData>({
        name: nameValues,
        position: positionValues,
        bio: bioValues,
        email: staff?.email || '',
        phone: staff?.phone || '',
        sort_order: staff?.sort_order || 0,
        visible: staff?.visible ?? true
    });

    const isFormSubmitting = processing || isSubmitting || isUploading;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(data);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 檢查檔案大小 (最大 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('檔案大小不能超過 5MB');
                return;
            }

            // 檢查檔案類型
            if (!file.type.startsWith('image/')) {
                alert('請上傳圖片檔案');
                return;
            }

            setIsUploading(true);
            setData('avatar', file);

            // 模擬上傳延遲
            setTimeout(() => {
                setIsUploading(false);
            }, 1000);
        }
    };

    const handleNameChange = (locale: 'zh-TW' | 'en', value: string) => {
        setData('name', {
            ...data.name,
            [locale]: value
        });
    };

    const handlePositionChange = (locale: 'zh-TW' | 'en', value: string) => {
        setData('position', {
            ...data.position,
            [locale]: value
        });
    };

    const handleBioChange = (locale: 'zh-TW' | 'en', value: string) => {
        setData('bio', {
            'zh-TW': locale === 'zh-TW' ? value : data.bio['zh-TW'],
            'en': locale === 'en' ? value : data.bio['en']
        });
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
                        values={data.name}
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

                    {/* 職位 */}
                    <MultiLanguageInput
                        label="職位 / Position"
                        name="position"
                        required
                        values={data.position}
                        onChange={handlePositionChange}
                        placeholder={{
                            'zh-TW': '請輸入職位',
                            'en': 'Enter position'
                        }}
                        errors={{
                            'zh-TW': errors['position.zh-TW'],
                            'en': errors['position.en']
                        }}
                    />

                    {/* 電子信箱 */}
                    <div>
                        <Label htmlFor="email">電子信箱 / Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="name@example.com"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                        )}
                    </div>

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

                    {/* 頭像 */}
                    <div>
                        <Label htmlFor="avatar">頭像 / Avatar</Label>
                        <div className="mt-2 space-y-3">
                            {/* 現有頭像預覽 */}
                            {staff?.photo_url && (
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={staff.photo_url}
                                        alt="當前頭像"
                                        className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                                    />
                                    <div className="text-sm text-gray-600">
                                        當前頭像
                                    </div>
                                </div>
                            )}

                            {/* 檔案上傳 */}
                            <div className="flex items-center space-x-4">
                                <Input
                                    id="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    disabled={isFormSubmitting}
                                    className="flex-1"
                                />
                                {isUploading && (
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                )}
                            </div>

                            {/* 上傳提示 */}
                            <div className="text-xs text-gray-500">
                                支援 JPG、PNG、GIF 格式，檔案大小不超過 5MB
                            </div>
                        </div>
                        {errors.avatar && (
                            <p className="text-sm text-red-600 mt-1">{errors.avatar}</p>
                        )}
                    </div>

                    {/* 個人簡介 */}
                    <MultiLanguageInput
                        label="個人簡介 / Bio"
                        name="bio"
                        type="textarea"
                        values={data.bio}
                        onChange={handleBioChange}
                        placeholder={{
                            'zh-TW': '請輸入個人簡介',
                            'en': 'Enter bio'
                        }}
                        errors={{
                            'zh-TW': errors['bio.zh-TW'],
                            'en': errors['bio.en']
                        }}
                        rows={4}
                    />

                    {/* 排序 */}
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

                    {/* 顯示狀態 */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="visible"
                            checked={data.visible}
                            onCheckedChange={(checked) => setData('visible', checked as boolean)}
                        />
                        <Label htmlFor="visible">顯示 / Visible</Label>
                    </div>
                </CardContent>
            </Card>

            {/* 提交按鈕 */}
            <div className="flex justify-end space-x-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    disabled={isFormSubmitting}
                >
                    取消
                </Button>
                <Button
                    type="submit"
                    disabled={isFormSubmitting}
                    className="px-8"
                >
                    {isFormSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isFormSubmitting ? '處理中...' : submitLabel}
                </Button>
            </div>
        </form>
    );
};

export default StaffForm;
