import { LabTeacher } from './types';

export const resolveLocalizedText = (
    value: LabTeacher['name'] | LabTeacher['title'],
    fallback = ''
): string => {
    if (!value) {
        return fallback;
    }

    if (typeof value === 'string') {
        return value;
    }

    return value['zh-TW'] ?? value.en ?? fallback;
};

export const fallbackInitials = (name: string): string => {
    if (!name) {
        return 'LAB';
    }

    const trimmed = name.replace(/\s+/g, '');
    return trimmed.slice(0, 2).toUpperCase();
};
