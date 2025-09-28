import { FormEvent } from 'react';
import type { InertiaFormProps } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import AssignableMultiSelect, { AssignableOption } from '@/components/manage/admin/shared/assignable-multi-select';
import TagSelector, { TagSelectorOption } from '@/components/manage/tag-selector';

export interface ClassroomFormData {
    code: string;
    name: string;
    name_en: string;
    location: string;
    capacity: number | null;
    equipment_summary: string;
    description: string;
    description_en: string;
    tags: string[];
    sort_order: number | null;
    visible: boolean;
    staff_ids: number[];
}

interface ClassroomFormProps {
    form: InertiaFormProps<ClassroomFormData>;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    submitLabel: string;
    staffOptions: AssignableOption[];
    tagOptions: TagSelectorOption[];
}

export default function ClassroomForm({ form, onSubmit, submitLabel, staffOptions, tagOptions }: ClassroomFormProps) {
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

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>職員連動</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-neutral-600">
                        教室可指派多位職員負責維護或管理，這些資訊會同步顯示在教室詳情中，並可供前台查詢。
                    </p>
                    <AssignableMultiSelect
                        options={staffOptions}
                        selectedIds={data.staff_ids}
                        onChange={(ids) => setData('staff_ids', ids)}
                        helperText="可選擇多位職員，提交後會立即同步至資料庫。"
                        emptyLabel="目前沒有職員資料，請先建立職員資訊。"
                        searchPlaceholder="搜尋職員姓名或職稱"
                        errorMessage={Array.isArray(errors.staff_ids) ? errors.staff_ids.join('\n') : errors.staff_ids}
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
                            {errors.sort_order && <p className="text-sm text-red-600">{errors.sort_order}</p>}
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
