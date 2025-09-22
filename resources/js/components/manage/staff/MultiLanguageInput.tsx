import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface MultiLanguageInputProps {
    label: string;
    name: string;
    type?: 'input' | 'textarea';
    required?: boolean;
    values: {
        'zh-TW': string;
        'en': string;
    };
    onChange: (locale: 'zh-TW' | 'en', value: string) => void;
    errors?: {
        'zh-TW'?: string;
        'en'?: string;
    };
    placeholder?: {
        'zh-TW'?: string;
        'en'?: string;
    };
    rows?: number;
}

export default function MultiLanguageInput({
    label,
    name,
    type = 'input',
    required = false,
    values,
    onChange,
    errors,
    placeholder,
    rows = 4,
}: MultiLanguageInputProps) {
    const InputComponent = type === 'textarea' ? Textarea : Input;

    return (
        <div className="space-y-2">
            <Label htmlFor={`${name}-zh-TW`}>
                {label} {required && <span className="text-red-500">*</span>}
            </Label>

            <Tabs defaultValue="zh-TW" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="zh-TW">中文</TabsTrigger>
                    <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>

                <TabsContent value="zh-TW" className="space-y-2">
                    <InputComponent
                        id={`${name}-zh-TW`}
                        name={`${name}[zh-TW]`}
                        value={values['zh-TW']}
                        onChange={(e) => onChange('zh-TW', e.target.value)}
                        placeholder={placeholder?.['zh-TW']}
                        required={required}
                        rows={type === 'textarea' ? rows : undefined}
                    />
                    {errors?.['zh-TW'] && (
                        <p className="text-sm text-red-600">{errors['zh-TW']}</p>
                    )}
                </TabsContent>

                <TabsContent value="en" className="space-y-2">
                    <InputComponent
                        id={`${name}-en`}
                        name={`${name}[en]`}
                        value={values['en']}
                        onChange={(e) => onChange('en', e.target.value)}
                        placeholder={placeholder?.['en']}
                        required={required}
                        rows={type === 'textarea' ? rows : undefined}
                    />
                    {errors?.['en'] && (
                        <p className="text-sm text-red-600">{errors['en']}</p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
