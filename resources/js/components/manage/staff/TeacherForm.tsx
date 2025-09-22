import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    teacher?: any;
    onSubmit: (data: TeacherFormData) => void;
    submitLabel?: string;
    isSubmitting?: boolean;
    users?: Array<{ id: number; name: string; email: string }>;
}

export default function TeacherForm({
    teacher,
    onSubmit,
    submitLabel = '儲存',
    isSubmitting = false,
    users = []
}: TeacherFormProps) {
    const { data, setData, processing, errors } = useForm<TeacherFormData>({
        name: teacher?.name || '',
        name_en: teacher?.name_en || '',
        title: teacher?.title || '',
        title_en: teacher?.title_en || '',
        email: teacher?.email || '',
        phone: teacher?.phone || '',
        office: teacher?.office || '',
        job_title: teacher?.job_title || '',
        bio: teacher?.bio || '',
        bio_en: teacher?.bio_en || '',
        expertise: teacher?.expertise || '',
        expertise_en: teacher?.expertise_en || '',
        education: teacher?.education || '',
        education_en: teacher?.education_en || '',
        sort_order: teacher?.sort_order || 0,
        visible: teacher?.visible ?? true,
        user_id: teacher?.user_id,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(data);
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
                        {teacher?.photo_url && (
                            <div className="mb-2">
                                <img
                                    src={`/storage/${teacher.photo_url}`}
                                    alt={teacher.name}
                                    className="h-20 w-20 rounded-full object-cover"
                                />
                            </div>
                        )}
                        <Input
                            id="photo"
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
                            onClick={() => window.history.back()}
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
