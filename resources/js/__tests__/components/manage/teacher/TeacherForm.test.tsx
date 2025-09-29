import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TeacherForm } from '@/components/manage/teacher/TeacherForm';

const mockSetData = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();

jest.mock('@inertiajs/react', () => ({
    useForm: jest.fn((initialData: unknown) => ({
        data: initialData,
        setData: mockSetData,
        post: mockPost,
        put: mockPut,
        processing: false,
        errors: {},
        clearErrors: jest.fn(),
        reset: jest.fn(),
    })),
    router: {
        visit: jest.fn(),
    },
}));

jest.mock('@/components/manage/staff/MultiLanguageInput', () => ({
    __esModule: true,
    default: ({ label, name, onChange }: any) => (
        <div data-testid={`multi-${name}`}>
            <span>{label}</span>
            <input
                data-testid={`input-${name}-zh`}
                onChange={(event) => onChange('zh-TW', event.target.value)}
            />
            <input
                data-testid={`input-${name}-en`}
                onChange={(event) => onChange('en', event.target.value)}
            />
        </div>
    ),
}));

jest.mock('@/components/ui/card', () => ({
    Card: ({ children }: any) => <div data-testid="card">{children}</div>,
    CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
    CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
    CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
}));

jest.mock('@/components/ui/input', () => ({
    Input: ({ id, value, onChange, ...props }: any) => (
        <input data-testid={`input-${id}`} id={id} value={value} onChange={onChange} {...props} />
    ),
}));

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: any) => (
        <button data-testid="button" {...props}>
            {children}
        </button>
    ),
}));

jest.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({ id, checked, onCheckedChange }: any) => (
        <input
            data-testid={`checkbox-${id}`}
            type="checkbox"
            checked={checked ?? false}
            onChange={(event) => onCheckedChange?.(event.target.checked)}
        />
    ),
}));

jest.mock('@/components/ui/label', () => ({
    Label: ({ children, htmlFor }: any) => (
        <label data-testid={`label-${htmlFor}`}>{children}</label>
    ),
}));

jest.mock('@/hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback ?? key,
        locale: 'zh-TW',
    }),
}));

describe('TeacherForm (teacher namespace)', () => {
    const teacher = {
        id: 1,
        name: { 'zh-TW': '王教授', en: 'Prof. Wang' },
        title: { 'zh-TW': '教授', en: 'Professor' },
        bio: { 'zh-TW': '專長為資料探勘', en: 'Data mining specialist' },
        specialties: [
            { 'zh-TW': '資料探勘', en: 'Data Mining' },
            { 'zh-TW': '雲端運算', en: 'Cloud Computing' },
        ],
        education: [{ 'zh-TW': '交大電機博士', en: 'Ph.D. in EE, NCTU' }],
        email: 'prof.wang@example.com',
        phone: '02-99998888',
        office: 'E201',
        website: 'https://example.com',
        lab_id: 2,
        sort_order: 5,
        visible: true,
    } as any; // Use any to avoid readonly type issues

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders multilingual inputs and essential fields', () => {
        render(<TeacherForm teacher={teacher} labs={[]} onSubmit={jest.fn()} />);

        expect(screen.getByTestId('multi-name')).toBeInTheDocument();
        expect(screen.getByTestId('multi-title')).toBeInTheDocument();
        expect(screen.getByTestId('input-email')).toBeInTheDocument();
        expect(screen.getByTestId('input-phone')).toBeInTheDocument();
        expect(screen.getByTestId('input-office')).toBeInTheDocument();
        expect(screen.getByTestId('multi-bio')).toBeInTheDocument();
        expect(screen.getByTestId('checkbox-visible')).toBeInTheDocument();
    });

    it('updates form state when fields change', async () => {
        render(<TeacherForm teacher={teacher} labs={[]} onSubmit={jest.fn()} />);
        const user = userEvent.setup();

        await user.clear(screen.getByTestId('input-email'));
        await user.type(screen.getByTestId('input-email'), 'new@example.com');

        expect(mockSetData).toHaveBeenCalledWith('email', '');
        expect(mockSetData.mock.calls.filter(([field]) => field === 'email').length).toBeGreaterThan(1);
    });

    it('triggers submit callback with form data', () => {
        const handleSubmit = jest.fn();
        render(<TeacherForm teacher={teacher} labs={[]} onSubmit={handleSubmit} />);

        const form = document.querySelector('form');
        expect(form).not.toBeNull();
        fireEvent.submit(form as HTMLFormElement);

        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('handles visibility toggle', () => {
        render(<TeacherForm teacher={teacher} labs={[]} onSubmit={jest.fn()} />);

        fireEvent.click(screen.getByTestId('checkbox-visible'));
        expect(mockSetData).toHaveBeenCalledWith('visible', false);
    });
});
