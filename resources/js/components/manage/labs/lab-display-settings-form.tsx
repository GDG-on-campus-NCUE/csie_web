import type { InertiaFormProps } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LabFormData } from './types';

interface LabDisplaySettingsFormProps {
    form: InertiaFormProps<LabFormData>;
}

export function LabDisplaySettingsForm({ form }: LabDisplaySettingsFormProps) {
    const { data, setData, errors } = form;

    return (
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
    );
}
