import type { InertiaFormProps } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import TagSelector from '@/components/manage/tag-selector';
import { ClassroomFormData } from './types';

export interface TagSelectorOption {
    value: string;
    label: string;
}

interface ClassroomBasicInfoFormProps {
    form: InertiaFormProps<ClassroomFormData>;
    tagOptions: TagSelectorOption[];
}

export function ClassroomBasicInfoForm({ form, tagOptions }: ClassroomBasicInfoFormProps) {
    const { data, setData, processing, errors } = form;

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>基本資料</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">教室名稱（中文）*</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            required
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name_en">教室名稱（英文）</Label>
                        <Input
                            id="name_en"
                            type="text"
                            value={data.name_en}
                            onChange={(event) => setData('name_en', event.target.value)}
                        />
                        {errors.name_en && <p className="text-sm text-red-600">{errors.name_en}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="code">教室代碼</Label>
                        <Input
                            id="code"
                            type="text"
                            value={data.code}
                            onChange={(event) => setData('code', event.target.value)}
                            placeholder="如：EC-301"
                        />
                        {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">地點</Label>
                        <Input
                            id="location"
                            type="text"
                            value={data.location}
                            onChange={(event) => setData('location', event.target.value)}
                            placeholder="教學大樓三樓"
                        />
                        {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="capacity">容納人數</Label>
                        <Input
                            id="capacity"
                            type="number"
                            value={data.capacity ?? ''}
                            onChange={(event) => {
                                const value = Number(event.target.value);
                                setData('capacity', Number.isNaN(value) ? null : value);
                            }}
                            min="0"
                        />
                        {errors.capacity && <p className="text-sm text-red-600">{errors.capacity}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="equipment_summary">主要設備</Label>
                        <Input
                            id="equipment_summary"
                            type="text"
                            value={data.equipment_summary}
                            onChange={(event) => setData('equipment_summary', event.target.value)}
                            placeholder="例如：投影機、視訊錄播"
                        />
                        {errors.equipment_summary && (
                            <p className="text-sm text-red-600">{errors.equipment_summary}</p>
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
                        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description_en">英文介紹</Label>
                        <Textarea
                            id="description_en"
                            value={data.description_en}
                            onChange={(event) => setData('description_en', event.target.value)}
                            rows={5}
                        />
                        {errors.description_en && <p className="text-sm text-red-600">{errors.description_en}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="classroom-tags">教室標籤</Label>
                    <TagSelector
                        id="classroom-tags"
                        value={data.tags}
                        onChange={(next) => setData('tags', next)}
                        options={tagOptions}
                        placeholder="輸入後按 Enter 新增標籤或從建議清單挑選"
                        helperText="標籤會顯示於資源卡片上，方便快速辨識教室特色。"
                        disabled={processing}
                    />
                    {errors.tags && <p className="text-sm text-red-600">{String(errors.tags)}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
