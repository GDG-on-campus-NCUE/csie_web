import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import TeacherForm from '@/components/manage/staff/TeacherForm';

// Mock Inertia.js
const mockPost = vi.fn();
const mockPut = vi.fn();

vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');
    return {
        ...actual,
        router: {
            post: mockPost,
            put: mockPut,
        },
        useForm: (initialData: any) => ({
            data: initialData,
            setData: vi.fn(),
            post: mockPost,
            put: mockPut,
            processing: false,
            errors: {},
            clearErrors: vi.fn(),
            setError: vi.fn(),
            reset: vi.fn(),
        }),
    };
});

// Mock UI components
vi.mock('@/components/ui/form', () => ({
    Form: ({ children }: any) => <form data-testid="teacher-form">{children}</form>,
    FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
    FormLabel: ({ children }: any) => <label data-testid="form-label">{children}</label>,
    FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
    FormMessage: ({ children }: any) => <span data-testid="form-message">{children}</span>,
    FormDescription: ({ children }: any) => <p data-testid="form-description">{children}</p>,
}));

vi.mock('@/components/ui/input', () => ({
    Input: ({ name, placeholder, type, ...props }: any) => (
        <input
            data-testid={`input-${name}`}
            name={name}
            placeholder={placeholder}
            type={type}
            {...props}
        />
    ),
}));

vi.mock('@/components/ui/textarea', () => ({
    Textarea: ({ name, placeholder, ...props }: any) => (
        <textarea
            data-testid={`textarea-${name}`}
            name={name}
            placeholder={placeholder}
            {...props}
        />
    ),
}));

vi.mock('@/components/ui/select', () => ({
    Select: ({ value, onValueChange, children }: any) => (
        <select data-testid="select" value={value} onChange={(e) => onValueChange(e.target.value)}>
            {children}
        </select>
    ),
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, type, disabled, ...props }: any) => (
        <button
            data-testid="button"
            onClick={onClick}
            type={type}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    ),
}));

vi.mock('@/components/ui/switch', () => ({
    Switch: ({ checked, onCheckedChange, ...props }: any) => (
        <input
            data-testid="switch-visible"
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
            {...props}
        />
    ),
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children }: any) => <div data-testid="card">{children}</div>,
    CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
    CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
    CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
}));

vi.mock('@/components/ui/tabs', () => ({
    Tabs: ({ value, onValueChange, children }: any) => (
        <div data-testid="tabs" data-value={value}>
            {children}
        </div>
    ),
    TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
    TabsTrigger: ({ value, children, onClick }: any) => (
        <button data-testid={`tab-${value}`} onClick={onClick}>
            {children}
        </button>
    ),
    TabsContent: ({ value, children }: any) => (
        <div data-testid={`tab-content-${value}`}>{children}</div>
    ),
}));

// Mock translation hook
vi.mock('@/hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'staff.form.teacher.fields.name_zh': '中文姓名',
                'staff.form.teacher.fields.name_en': '英文姓名',
                'staff.form.teacher.fields.title_zh': '中文職稱',
                'staff.form.teacher.fields.title_en': '英文職稱',
                'staff.form.teacher.fields.specialization_zh': '中文專長',
                'staff.form.teacher.fields.specialization_en': '英文專長',
                'staff.form.teacher.fields.email': '電子郵件',
                'staff.form.teacher.fields.phone': '聯絡電話',
                'staff.form.teacher.fields.extension': '分機號碼',
                'staff.form.teacher.fields.office': '辦公室',
                'staff.form.teacher.fields.status': '在職狀態',
                'staff.form.teacher.fields.bio_zh': '中文簡介',
                'staff.form.teacher.fields.bio_en': '英文簡介',
                'staff.form.teacher.fields.education_zh': '中文學歷',
                'staff.form.teacher.fields.education_en': '英文學歷',
                'staff.form.teacher.fields.user_id': '關聯使用者',
                'staff.form.actions.save': '儲存',
                'staff.form.actions.cancel': '取消',
                'staff.status.active': '在職',
                'staff.status.sabbatical': '休假',
                'staff.status.retired': '退休',
                'common.tabs.zh': '中文',
                'common.tabs.en': 'English',
                'common.required': '必填',
                'common.select_placeholder': '請選擇',
            };
            return translations[key] || key;
        },
        locale: 'zh-TW',
    }),
}));

describe('TeacherForm Component', () => {
    const mockTeacherData = {
        id: 1,
        user_id: 1,
        name: '陳教授',
        name_en: 'Prof. Chen',
        title: '副教授',
        title_en: 'Associate Professor',
        specialization: '資料庫系統,機器學習',
        specialization_en: 'Database Systems, Machine Learning',
        email: 'prof.chen@example.com',
        phone: '02-12345678',
        extension: '5678',
        office: 'E301',
        bio: '專精於資料庫系統研究',
        bio_en: 'Specializes in database systems research',
        education: '台灣大學資訊工程博士',
        education_en: 'Ph.D. in Computer Science, National Taiwan University',
        sort_order: 10,
        visible: true,
        photo_url: null,
    };

    const mockUsers = [
        { id: 1, name: '陳教授', email: 'prof.chen@example.com' },
        { id: 2, name: '李教授', email: 'prof.li@example.com' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /**
     * T021: Test form rendering with all teacher-specific fields
     */
    it('renders teacher form with all required fields', () => {
        render(<TeacherForm teacher={mockTeacherData} users={mockUsers} />);

        expect(screen.getByTestId('teacher-form')).toBeInTheDocument();
        expect(screen.getByTestId('input-name')).toBeInTheDocument();
        expect(screen.getByTestId('input-name_en')).toBeInTheDocument();
        expect(screen.getByTestId('input-title')).toBeInTheDocument();
        expect(screen.getByTestId('input-title_en')).toBeInTheDocument();
        expect(screen.getByTestId('input-specialization')).toBeInTheDocument();
        expect(screen.getByTestId('input-specialization_en')).toBeInTheDocument();
        expect(screen.getByTestId('input-email')).toBeInTheDocument();
        expect(screen.getByTestId('input-phone')).toBeInTheDocument();
        expect(screen.getByTestId('input-office')).toBeInTheDocument();
        expect(screen.getByTestId('textarea-bio')).toBeInTheDocument();
        expect(screen.getByTestId('textarea-bio_en')).toBeInTheDocument();
        expect(screen.getByTestId('textarea-education')).toBeInTheDocument();
        expect(screen.getByTestId('textarea-education_en')).toBeInTheDocument();
        expect(screen.getByTestId('select')).toBeInTheDocument(); // User select
        expect(screen.getByTestId('switch-visible')).toBeInTheDocument();
    });

    /**
     * T021: Test form populates with existing teacher data
     */
    it('populates form fields with existing teacher data', () => {
        render(<TeacherForm teacher={mockTeacherData} users={mockUsers} />);

        const nameInput = screen.getByTestId('input-name') as HTMLInputElement;
        const titleInput = screen.getByTestId('input-title') as HTMLInputElement;
        const emailInput = screen.getByTestId('input-email') as HTMLInputElement;
        const officeInput = screen.getByTestId('input-office') as HTMLInputElement;

        expect(nameInput.value).toBe('陳教授');
        expect(titleInput.value).toBe('副教授');
        expect(emailInput.value).toBe('prof.chen@example.com');
        expect(officeInput.value).toBe('E301');
    });

    /**
     * T021: Test user selection dropdown
     */
    it('displays available users in selection dropdown', () => {
        render(<TeacherForm teacher={mockTeacherData} users={mockUsers} />);

        const userSelect = screen.getByTestId('select');
        expect(userSelect).toBeInTheDocument();

        // Check if users are available as options
        expect(screen.getByText('陳教授')).toBeInTheDocument();
        expect(screen.getByText('李教授')).toBeInTheDocument();
    });

    /**
     * T021: Test multilingual tabs for teacher content
     */
    it('displays multilingual tabs for Chinese and English teacher content', () => {
        render(<TeacherForm teacher={mockTeacherData} users={mockUsers} />);

        expect(screen.getByTestId('tabs')).toBeInTheDocument();
        expect(screen.getByTestId('tab-zh')).toBeInTheDocument();
        expect(screen.getByTestId('tab-en')).toBeInTheDocument();
        expect(screen.getByText('中文')).toBeInTheDocument();
        expect(screen.getByText('English')).toBeInTheDocument();
    });

    /**
     * T021: Test tab switching for multilingual content
     */
    it('switches between Chinese and English tabs correctly', async () => {
        const user = userEvent.setup();
        render(<TeacherForm teacher={mockTeacherData} users={mockUsers} />);

        const englishTab = screen.getByTestId('tab-en');
        await user.click(englishTab);

        // Should display English content fields
        expect(screen.getByTestId('tab-content-en')).toBeInTheDocument();
    });

    /**
     * T021: Test validation for required teacher fields
     */
    it('validates required teacher fields', async () => {
        const user = userEvent.setup();
        render(<TeacherForm users={mockUsers} />);

        const nameInput = screen.getByTestId('input-name');
        const titleInput = screen.getByTestId('input-title');
        const saveButton = screen.getByText('儲存');

        // Leave required fields empty
        await user.clear(nameInput);
        await user.clear(titleInput);
        await user.click(saveButton);

        // Should show validation errors
        await waitFor(() => {
            expect(screen.getAllByText(/必填/)).toHaveLength(2);
        });
    });

    /**
     * T021: Test specialization field handling
     */
    it('handles specialization fields correctly', async () => {
        const user = userEvent.setup();
        render(<TeacherForm teacher={mockTeacherData} users={mockUsers} />);

        const specializationInput = screen.getByTestId('input-specialization');

        // Should display comma-separated specializations
        expect(specializationInput).toHaveValue('資料庫系統,機器學習');

        await user.clear(specializationInput);
        await user.type(specializationInput, '人工智慧,深度學習');

        expect(specializationInput).toHaveValue('人工智慧,深度學習');
    });

    /**
     * T021: Test education field in multilingual tabs
     */
    it('displays education fields in appropriate language tabs', () => {
        render(<TeacherForm teacher={mockTeacherData} users={mockUsers} />);

        // Should have education fields in both language sections
        expect(screen.getByTestId('textarea-education')).toBeInTheDocument();
        expect(screen.getByTestId('textarea-education_en')).toBeInTheDocument();
    });

    /**
     * T021: Test form submission for new teacher
     */
    it('submits form data correctly for new teacher creation', async () => {
        const user = userEvent.setup();
        render(<TeacherForm users={mockUsers} />);

        const nameInput = screen.getByTestId('input-name');
        const titleInput = screen.getByTestId('input-title');
        const emailInput = screen.getByTestId('input-email');
        const saveButton = screen.getByText('儲存');

        await user.type(nameInput, '新教授');
        await user.type(titleInput, '助理教授');
        await user.type(emailInput, 'new.prof@example.com');
        await user.click(saveButton);

        expect(mockPost).toHaveBeenCalledWith('/manage/teachers', expect.objectContaining({
            name: '新教授',
            title: '助理教授',
            email: 'new.prof@example.com',
        }));
    });

    /**
     * T021: Test form submission for teacher update
     */
    it('submits form data correctly for teacher update', async () => {
        const user = userEvent.setup();
        render(<TeacherForm teacher={mockTeacherData} users={mockUsers} />);

        const nameInput = screen.getByTestId('input-name');
        const saveButton = screen.getByText('儲存');

        await user.clear(nameInput);
        await user.type(nameInput, '更新教授');
        await user.click(saveButton);

        expect(mockPut).toHaveBeenCalledWith(`/manage/teachers/${mockTeacherData.id}`, expect.objectContaining({
            name: '更新教授',
        }));
    });

    /**
     * T021: Test user association functionality
     */
    it('handles user association changes', async () => {
        const user = userEvent.setup();
        render(<TeacherForm teacher={mockTeacherData} users={mockUsers} />);

        const userSelect = screen.getByTestId('select');

        await user.selectOptions(userSelect, '2');
        expect(userSelect).toHaveValue('2');
    });

    /**
     * T021: Test teacher status selection
     */
    it('displays teacher status options', () => {
        render(<TeacherForm teacher={mockTeacherData} users={mockUsers} />);

        // Should have status-related elements
        expect(screen.getByText('在職狀態')).toBeInTheDocument();
    });

    /**
     * T021: Test cancel functionality
     */
    it('handles cancel action correctly', async () => {
        const user = userEvent.setup();
        const mockOnCancel = vi.fn();
        render(<TeacherForm teacher={mockTeacherData} users={mockUsers} onCancel={mockOnCancel} />);

        const cancelButton = screen.getByText('取消');
        await user.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalled();
    });

    /**
     * T021: Test error display for teacher form
     */
    it('displays server validation errors', () => {
        const errors = {
            name: ['教師姓名為必填欄位'],
            title: ['職稱為必填欄位'],
            email: ['電子郵件格式不正確'],
        };

        render(<TeacherForm teacher={mockTeacherData} users={mockUsers} errors={errors} />);

        expect(screen.getByText('教師姓名為必填欄位')).toBeInTheDocument();
        expect(screen.getByText('職稱為必填欄位')).toBeInTheDocument();
        expect(screen.getByText('電子郵件格式不正確')).toBeInTheDocument();
    });

    /**
     * T021: Test form loading state
     */
    it('displays loading state during form submission', () => {
        render(<TeacherForm teacher={mockTeacherData} users={mockUsers} processing={true} />);

        const saveButton = screen.getByText('儲存');
        expect(saveButton).toBeDisabled();
    });

    /**
     * T021: Test photo upload functionality for teachers
     */
    it('handles teacher photo upload', async () => {
        const user = userEvent.setup();
        render(<TeacherForm teacher={mockTeacherData} users={mockUsers} />);

        const fileInput = screen.getByTestId('input-photo');
        const file = new File(['photo'], 'teacher.jpg', { type: 'image/jpeg' });

        await user.upload(fileInput, file);

        expect(fileInput).toHaveProperty('files', expect.arrayContaining([file]));
    });

    /**
     * T021: Test accessibility features
     */
    it('has proper accessibility attributes', () => {
        render(<TeacherForm teacher={mockTeacherData} users={mockUsers} />);

        // Check for proper labels
        expect(screen.getByLabelText('中文姓名')).toBeInTheDocument();
        expect(screen.getByLabelText('中文職稱')).toBeInTheDocument();
        expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();

        // Check for form structure
        expect(screen.getByTestId('teacher-form')).toHaveAttribute('role', 'form');
    });

    /**
     * T021: Test responsive design layout
     */
    it('applies responsive layout classes', () => {
        const { container } = render(<TeacherForm teacher={mockTeacherData} users={mockUsers} />);

        // Check for responsive grid classes
        expect(container.querySelector('.grid')).toBeInTheDocument();
        expect(container.querySelector('.md\\:grid-cols-2')).toBeInTheDocument();
    });

    /**
     * T021: Test empty users list handling
     */
    it('handles empty users list gracefully', () => {
        render(<TeacherForm teacher={mockTeacherData} users={[]} />);

        const userSelect = screen.getByTestId('select');
        expect(userSelect).toBeInTheDocument();
        // Should still render but with no options
    });
});
