import { type FormEvent } from 'react';
import type { InertiaFormProps } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import AssignableMultiSelect, { AssignableOption } from '@/components/manage/admin/shared/assignable-multi-select';
import TagSelector, { TagSelectorOption } from '@/components/manage/tag-selector';

export interface LabFormData {
    code: string;
    website_url: string;
    email: string;
    phone: string;
    name: string;
    name_en: string;
    description: string;
    description_en: string;
    tags: string[];
    sort_order: number | null;
    visible: boolean;
    cover_image: File | null;
    teacher_ids: number[];
}

interface LabFormProps {
    form: InertiaFormProps<LabFormData>;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    submitLabel: string;
    existingCoverUrl?: string | null;
    teacherOptions: AssignableOption[];
    tagOptions: TagSelectorOption[];
}

export default function LabForm({ form, onSubmit, submitLabel, existingCoverUrl, teacherOptions, tagOptions }: LabFormProps) {
    const { data, setData, processing, errors } = form;

    return (
        <form onSubmit={onSubmit} className="space-y-6">
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

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>師資連動</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-neutral-600">
                        為了呈現實驗室與教師的對應關係，可於此選擇一位或多位教師成員；後續將同步儲存於多對多關聯。
                    </p>
                    <AssignableMultiSelect
                        options={teacherOptions}
                        selectedIds={data.teacher_ids}
                        onChange={(ids) => setData('teacher_ids', ids)}
                        helperText="勾選後會立即更新表單資料，提交前仍可隨時調整。"
                        emptyLabel="目前沒有教師資料，請先至師資管理建立教師。"
                        searchPlaceholder="搜尋教師姓名或職稱"
                        errorMessage={Array.isArray(errors.teacher_ids) ? errors.teacher_ids.join('\n') : errors.teacher_ids}
                    />
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>顯示設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="sort_order">排序</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                value={data.sort_order ?? ''}
                                onChange={(event) => {
                                    const value = Number(event.target.value);
                                    setData('sort_order', Number.isNaN(value) ? null : value);
                                }}
                                min="0"
                                placeholder="數字越小越優先"
                            />
                            {errors.sort_order && (
                                <p className="text-sm text-red-600">{errors.sort_order}</p>
                            )}
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
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="visible"
                            checked={data.visible}
                            onCheckedChange={(checked) => setData('visible', Boolean(checked))}
                        />
                        <Label htmlFor="visible">顯示於前台列表</Label>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    取消
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? '處理中…' : submitLabel}
                </Button>
            </div>
        </form>
    );
}
