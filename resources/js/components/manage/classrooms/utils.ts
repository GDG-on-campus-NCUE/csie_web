import { ClassroomStaff } from './types';

export const resolveLocalizedText = (
    value: ClassroomStaff['name'] | ClassroomStaff['position'],
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

export const formatCapacity = (value?: number | null): string => {
    if (value === null || value === undefined) {
        return '未設定容量';
    }

    if (Number.isNaN(value)) {
        return '未設定容量';
    }

    return `可容納 ${value} 人`;
};

export const formatLocation = (location?: string | null): string => {
    if (!location) {
        return '尚未提供地點資訊';
    }

    return location;
};
