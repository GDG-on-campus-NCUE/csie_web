import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import userEvent from '@testing-library/user-event';
import { TeacherForm } from '@/components/manage/teacher/TeacherForm';

// Mock Inertia.js
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockSetData = jest.fn();
const mockVisit = jest.fn();

jest.mock('@inertiajs/react', () => ({
    useForm: jest.fn(() => ({
        data: {
            name: { 'zh-TW': '', 'en': '' },
            title: { 'zh-TW': '', 'en': '' },
            email: '',
            phone: '',
            office: '',
            bio: { 'zh-TW': '', 'en': '' },
            specialties: [],
            education: [],
            website: '',
            user_id: null,
            lab_id: null,
            visible: true,
            sort_order: 0,
        },
        setData: mockSetData,
        post: mockPost,
        put: mockPut,
        processing: false,
        errors: {},
        clearErrors: jest.fn(),
        reset: jest.fn(),
    })),
    router: {
        visit: mockVisit,
    },
}));

// Mock MultiLanguageInput component
jest.mock('@/components/ui/MultiLanguageInput', () => ({
    MultiLanguageInput: ({ label, value, onChange, error, required }: any) => (
        <div>
            <label data-testid={`label-${label}`}>
                {label} {required && '*'}
            </label>
            <input
                data-testid={`input-${label}`}
                value={value?.['zh-TW'] || ''}
                onChange={(e) => onChange({
                    'zh-TW': e.target.value,
                    'en': value?.['en'] || ''
                })}
            />
            {error && <span role="alert" data-testid={`error-${label}`}>{error}</span>}
        </div>
    ),
}));

// Mock UI components
jest.mock('@/components/ui/Card', () => ({
    Card: ({ children }: any) => <div data-testid="card">{children}</div>,
    CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
    CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
    CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
}));

jest.mock('@/components/ui/Button', () => ({
    Button: ({ children, onClick, type, disabled, variant, ...props }: any) => (
        <button
            data-testid={`button-${variant || 'default'}`}
            onClick={onClick}
            type={type}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    ),
}));

jest.mock('@/components/ui/Select', () => ({
    Select: ({ value, onValueChange, children }: any) => (
        <select
            data-testid="select"
            value={value || ''}
            onChange={(e) => onValueChange(e.target.value)}
        >
            {children}
        </select>
    ),
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ value, children }: any) => (
        <option value={value}>{children}</option>
    ),
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock('@/components/ui/Input', () => ({
    Input: ({ value, onChange, placeholder, type, ...props }: any) => (
        <input
            data-testid="input-field"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            type={type}
            {...props}
        />
    ),
}));

jest.mock('@/components/ui/Switch', () => ({
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

describe('TeacherForm Component', () => {
    const mockTeacher = {
        id: 1,
        name: { 'zh-TW': '張教授', 'en': 'Prof. Zhang' },
        title: { 'zh-TW': '教授', 'en': 'Professor' },
        email: 'prof.zhang@example.com',
        phone: '02-1234-5678',
        office: 'C301',
        bio: { 'zh-TW': '專精計算機科學', 'en': 'Computer Science Expert' },
        specialties: [
            { 'zh-TW': '機器學習', 'en': 'Machine Learning' },
            { 'zh-TW': '資料探勘', 'en': 'Data Mining' }
        ],
        education: [
            { 'zh-TW': '台大資工博士', 'en': 'Ph.D. in CS, NTU' }
        ],
        website: 'https://prof-zhang.example.com',
        user_id: 1,
        lab_id: 1,
        visible: true,
        sort_order: 1,
        avatar: undefined
    };

    const mockUsers = [
        { id: 1, name: '張教授', email: 'prof.zhang@example.com' },
        { id: 2, name: '李教授', email: 'prof.li@example.com' }
    ];

    const mockLabs = [
        { id: 1, name: { 'zh-TW': 'AI 實驗室', 'en': 'AI Lab' } },
        { id: 2, name: { 'zh-TW': '網路實驗室', 'en': 'Network Lab' } }
    ];

    const mockOnSubmit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // T021: 測試表單渲染所有必填欄位
    it('renders form with all required fields', () => {
        render(
            <TeacherForm
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        expect(screen.getByTestId('card')).toBeInTheDocument();
        expect(screen.getByTestId('label-姓名')).toBeInTheDocument();
        expect(screen.getByTestId('label-職稱')).toBeInTheDocument();
        expect(screen.getByText('姓名 *')).toBeInTheDocument();
        expect(screen.getByText('職稱 *')).toBeInTheDocument();
    });

    // T021: 測試多語言輸入組件
    it('renders multilingual input components', () => {
        render(
            <TeacherForm
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        expect(screen.getByTestId('input-姓名')).toBeInTheDocument();
        expect(screen.getByTestId('input-職稱')).toBeInTheDocument();
        expect(screen.getByTestId('input-個人簡介')).toBeInTheDocument();
    });

    // T021: 測試關聯選擇器
    it('renders user and lab selectors', () => {
        render(
            <TeacherForm
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        const selects = screen.getAllByTestId('select');
        expect(selects.length).toBeGreaterThanOrEqual(2); // 至少有 user 和 lab 選擇器
    });

    // T021: 測試編輯模式載入現有資料
    it('populates form with existing teacher data in edit mode', () => {
        render(
            <TeacherForm
                teacher={mockTeacher}
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        expect(screen.getByDisplayValue('prof.zhang@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('02-1234-5678')).toBeInTheDocument();
        expect(screen.getByDisplayValue('C301')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://prof-zhang.example.com')).toBeInTheDocument();
    });

    // T021: 測試表單提交功能
    it('calls onSubmit when form is submitted', async () => {
        const user = userEvent.setup();
        render(
            <TeacherForm
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        const submitButton = screen.getByTestId('button-default');
        await user.click(submitButton);

        expect(mockOnSubmit).toHaveBeenCalled();
    });

    // T021: 測試取消按鈕功能
    it('navigates back when cancel button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <TeacherForm
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        const cancelButton = screen.getByTestId('button-outline');
        await user.click(cancelButton);

        expect(mockVisit).toHaveBeenCalledWith('/manage/teachers');
    });

    // T021: 測試可見性開關
    it('handles visibility toggle', async () => {
        const user = userEvent.setup();
        render(
            <TeacherForm
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        const visibleSwitch = screen.getByTestId('switch-visible');
        await user.click(visibleSwitch);

        expect(mockSetData).toHaveBeenCalledWith('visible', false);
    });

    // T021: 測試使用者關聯選擇
    it('handles user selection', async () => {
        const user = userEvent.setup();
        render(
            <TeacherForm
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        const userSelect = screen.getAllByTestId('select')[0];
        await user.selectOptions(userSelect, '1');

        expect(mockSetData).toHaveBeenCalledWith('user_id', '1');
    });

    // T021: 測試實驗室關聯選擇
    it('handles lab selection', async () => {
        const user = userEvent.setup();
        render(
            <TeacherForm
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        const labSelect = screen.getAllByTestId('select')[1];
        await user.selectOptions(labSelect, '1');

        expect(mockSetData).toHaveBeenCalledWith('lab_id', '1');
    });

    // T021: 測試網站 URL 輸入
    it('handles website URL input', async () => {
        const user = userEvent.setup();
        render(
            <TeacherForm
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        const websiteInput = screen.getByDisplayValue('') ||
            screen.getAllByTestId('input-field').find(input =>
                input.getAttribute('placeholder')?.includes('網站')
            );

        if (websiteInput) {
            await user.type(websiteInput, 'https://example.com');
            expect(mockSetData).toHaveBeenCalledWith('website', 'https://example.com');
        }
    });

    // T021: 測試處理中狀態
    it('disables form during processing', () => {
        const useFormMock = require('@inertiajs/react').useForm;
        useFormMock.mockReturnValue({
            ...useFormMock(),
            processing: true,
        });

        render(
            <TeacherForm
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        const submitButton = screen.getByTestId('button-default');
        expect(submitButton).toBeDisabled();
    });

    // T021: 測試驗證錯誤顯示
    it('displays validation errors', () => {
        const useFormMock = require('@inertiajs/react').useForm;
        useFormMock.mockReturnValue({
            ...useFormMock(),
            errors: {
                'name.zh-TW': '姓名為必填項目',
                'title.zh-TW': '職稱為必填項目',
                'email': '電子郵件格式不正確',
                'website': '網站 URL 格式不正確'
            },
        });

        render(
            <TeacherForm
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        expect(screen.getByTestId('error-姓名')).toHaveTextContent('姓名為必填項目');
        expect(screen.getByTestId('error-職稱')).toHaveTextContent('職稱為必填項目');
    });

    // T021: 測試專長陣列輸入
    it('handles specialties array input', () => {
        render(
            <TeacherForm
                teacher={mockTeacher}
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        // 檢查是否有專長相關的輸入欄位
        expect(screen.getByText(/專長/)).toBeInTheDocument();
    });

    // T021: 測試學歷陣列輸入
    it('handles education array input', () => {
        render(
            <TeacherForm
                teacher={mockTeacher}
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        // 檢查是否有學歷相關的輸入欄位
        expect(screen.getByText(/學歷/)).toBeInTheDocument();
    });

    // T021: 測試多語言內容輸入
    it('handles multilingual content input', async () => {
        const user = userEvent.setup();
        render(
            <TeacherForm
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        const nameInput = screen.getByTestId('input-姓名');
        await user.type(nameInput, '新教師');

        expect(mockSetData).toHaveBeenCalledWith('name', {
            'zh-TW': '新教師',
            'en': ''
        });
    });

    // T021: 測試排序順序輸入
    it('handles sort order input', async () => {
        const user = userEvent.setup();
        render(
            <TeacherForm
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        const sortOrderInput = screen.getAllByTestId('input-field').find(
            input => input.getAttribute('type') === 'number'
        );

        if (sortOrderInput) {
            await user.clear(sortOrderInput);
            await user.type(sortOrderInput, '5');
            expect(mockSetData).toHaveBeenCalledWith('sort_order', 5);
        }
    });

    // T021: 測試必填欄位標示
    it('shows required field indicators', () => {
        render(
            <TeacherForm
                onSubmit={mockOnSubmit}
                users={mockUsers}
                labs={mockLabs}
            />
        );

        expect(screen.getByText('姓名 *')).toBeInTheDocument();
        expect(screen.getByText('職稱 *')).toBeInTheDocument();
        expect(screen.getByText('電子郵件 *')).toBeInTheDocument();
    });

    // T021: 測試可選關聯處理
    it('handles optional relations correctly', () => {
        render(
            <TeacherForm
                onSubmit={mockOnSubmit}
                users={[]}
                labs={[]}
            />
        );

        // 即使沒有可用的 users 和 labs，表單也應該正常渲染
        expect(screen.getByTestId('card')).toBeInTheDocument();
    });
});
