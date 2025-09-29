import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TeacherForm from '@/components/manage/staff/TeacherForm';

// 模擬 Inertia useForm hook，提供最小可運作介面
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
    })),
}));

// 模擬共用 UI 元件，僅保留必要的 DOM 結構供查找
jest.mock('@/components/ui/input', () => ({
    Input: ({ id, value, onChange, ...props }: any) => (
        <input data-testid={`input-${id}`} id={id} value={value} onChange={onChange} {...props} />
    ),
}));

jest.mock('@/components/ui/textarea', () => ({
    Textarea: ({ id, value, onChange, ...props }: any) => (
        <textarea data-testid={`textarea-${id}`} id={id} value={value} onChange={onChange} {...props} />
    ),
}));

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: any) => (
        <button data-testid="button" {...props}>
            {children}
        </button>
    ),
}));

jest.mock('@/components/ui/card', () => ({
    Card: ({ children }: any) => <div data-testid="card">{children}</div>,
    CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
    CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
    CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
}));

jest.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({ id, checked, onCheckedChange }: any) => (
        <input
            data-testid={`checkbox-${id}`}
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckedChange?.(event.target.checked)}
        />
    ),
}));

jest.mock('@/components/ui/label', () => ({
    Label: ({ children, htmlFor }: any) => (
        <label data-testid={`label-${htmlFor}`} htmlFor={htmlFor}>
            {children}
        </label>
    ),
}));

// 多語系欄位改為最小的文字輸入控制
jest.mock('@/components/manage/staff/MultiLanguageInput', () => ({
    __esModule: true,
    default: ({ label, name, onChange }: any) => (
        <div data-testid={`multilang-${name}`}>
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

// 模擬語系 hook，回傳固定字串避免測試依賴翻譯檔
jest.mock('@/hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback ?? key,
        locale: 'zh-TW',
    }),
}));

describe('TeacherForm (staff version)', () => {
    const baseTeacher = {
        id: 1,
        name: { 'zh-TW': '張老師', en: 'Ms. Chang' },
        title: { 'zh-TW': '助理教授', en: 'Assistant Professor' },
        email: 'teacher@example.com',
        phone: '02-12345678',
        office: 'E301',
        job_title: '教學組長',
        bio: { 'zh-TW': '研究領域為人工智慧', en: 'Researching AI' },
        specialties: [
            { 'zh-TW': '人工智慧', en: 'Artificial Intelligence' },
            { 'zh-TW': '資料庫', en: 'Database Systems' },
        ],
        education: [
            { 'zh-TW': '台大資工博士', en: 'Ph.D. in CS, NTU' },
        ],
        sort_order: 3,
        visible: true,
        photo_url: null,
    } as any; // Use any to avoid readonly type issues

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders essential fields for teacher maintenance', () => {
        render(<TeacherForm teacher={baseTeacher} />);

        expect(screen.getByTestId('card')).toBeInTheDocument();
        expect(screen.getByTestId('input-name')).toBeInTheDocument();
        expect(screen.getByTestId('input-name_en')).toBeInTheDocument();
        expect(screen.getByTestId('input-title')).toBeInTheDocument();
        expect(screen.getByTestId('input-title_en')).toBeInTheDocument();
        expect(screen.getByTestId('textarea-bio')).toBeInTheDocument();
        expect(screen.getByTestId('textarea-bio_en')).toBeInTheDocument();
        expect(screen.getByTestId('textarea-expertise')).toBeInTheDocument();
        expect(screen.getByTestId('textarea-expertise_en')).toBeInTheDocument();
        expect(screen.getByTestId('textarea-education')).toBeInTheDocument();
        expect(screen.getByTestId('textarea-education_en')).toBeInTheDocument();
    });

    it('prefills existing teacher data correctly', () => {
        render(<TeacherForm teacher={baseTeacher} />);

        expect(screen.getByTestId('input-name')).toHaveValue('張老師');
        expect(screen.getByTestId('input-name_en')).toHaveValue('Ms. Chang');
        expect(screen.getByTestId('input-title')).toHaveValue('助理教授');
        expect(screen.getByTestId('input-title_en')).toHaveValue('Assistant Professor');
        expect(screen.getByTestId('input-email')).toHaveValue('teacher@example.com');
    });

    it('updates form state when user edits text inputs', async () => {
        render(<TeacherForm teacher={baseTeacher} />);
        const user = userEvent.setup();

        await user.clear(screen.getByTestId('input-email'));
        await user.type(screen.getByTestId('input-email'), 'new@mail.test');

        expect(mockSetData).toHaveBeenCalledWith('email', '');
        expect(mockSetData.mock.calls.filter(([field]) => field === 'email').length).toBeGreaterThan(1);
    });

    it('calls submit handler with current data', () => {
        const handleSubmit = jest.fn();
        render(<TeacherForm teacher={baseTeacher} onSubmit={handleSubmit} />);

        const form = screen.getByTestId('card').querySelector('form');
        expect(form).not.toBeNull();
        fireEvent.submit(form as HTMLFormElement);

        expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
            name: '張老師',
            name_en: 'Ms. Chang',
            title: '助理教授',
            title_en: 'Assistant Professor',
        }));
    });

    it('supports cancel callback for parent component', () => {
        const handleCancel = jest.fn();
        render(<TeacherForm teacher={baseTeacher} onCancel={handleCancel} />);

        const cancelButton = screen.getAllByTestId('button')[0];
        fireEvent.click(cancelButton);

        expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('shows error messages when provided via props', () => {
        render(
            <TeacherForm
                teacher={baseTeacher}
                errors={{ email: '電子郵件格式不正確', name: '姓名為必填' }}
            />,
        );

        expect(screen.getByText('電子郵件格式不正確')).toBeInTheDocument();
        expect(screen.getByText('姓名為必填')).toBeInTheDocument();
    });
});
