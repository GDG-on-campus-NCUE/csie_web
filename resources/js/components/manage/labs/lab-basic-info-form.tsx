import type { InertiaFormProps } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import TagSelector from '@/components/manage/tag-selector';
import { LabFormData } from './types';

export interface TagSelectorOption {
    value: string;
    label: string;
}

interface LabBasicInfoFormProps {
    form: InertiaFormProps<LabFormData>;
    existingCoverUrl?: string | null;
    tagOptions: TagSelectorOption[];
}

export function LabBasicInfoForm({ form, existingCoverUrl, tagOptions }: LabBasicInfoFormProps) {
    const { data, setData, processing, errors } = form;

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>基本資料</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">實驗室名稱（中文）*</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            required
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name_en">實驗室名稱（英文）</Label>
                        <Input
                            id="name_en"
                            type="text"
                            value={data.name_en}
                            onChange={(event) => setData('name_en', event.target.value)}
                        />
                        {errors.name_en && (
                            <p className="text-sm text-red-600">{errors.name_en}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="code">代碼</Label>
                        <Input
                            id="code"
                            type="text"
                            value={data.code}
                            onChange={(event) => setData('code', event.target.value)}
                            placeholder="例如：AI-LAB"
                        />
                        {errors.code && (
                            <p className="text-sm text-red-600">{errors.code}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website_url">網站連結</Label>
                        <Input
                            id="website_url"
                            type="url"
                            value={data.website_url}
                            onChange={(event) => setData('website_url', event.target.value)}
                            placeholder="https://example.com"
                        />
                        {errors.website_url && (
                            <p className="text-sm text-red-600">{errors.website_url}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">聯絡信箱</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            placeholder="lab@example.com"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">聯絡電話</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(event) => setData('phone', event.target.value)}
                        />
                        {errors.phone && (
                            <p className="text-sm text-red-600">{errors.phone}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="description">中文介紹</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            rows={5}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description_en">英文介紹</Label>
                        <Textarea
                            id="description_en"
                            value={data.description_en}
                            onChange={(event) => setData('description_en', event.target.value)}
                            rows={5}
                        />
                        {errors.description_en && (
                            <p className="text-sm text-red-600">{errors.description_en}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cover_image">封面圖片</Label>
                    <Input
                        id="cover_image"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            setData('cover_image', file);
                        }}
                    />
                    {existingCoverUrl && (
                        <p className="text-sm text-gray-500">
                            目前封面：
                            <a
                                href={existingCoverUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1 text-blue-600 underline"
                            >
                                開啟預覽
                            </a>
                        </p>
                    )}
                    {errors.cover_image && (
                        <p className="text-sm text-red-600">{errors.cover_image}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lab-tags">實驗室標籤</Label>
                    <TagSelector
                        id="lab-tags"
                        value={data.tags}
                        onChange={(next) => setData('tags', next)}
                        options={tagOptions}
                        placeholder="輸入後按 Enter 新增標籤或從建議清單挑選"
                        helperText="標籤會顯示於卡片上，凸顯實驗室領域或設備特色。"
                        disabled={processing}
                    />
                    {errors.tags && <p className="text-sm text-red-600">{String(errors.tags)}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
