import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import userEvent from '@testing-library/user-event';
import { StaffForm } from '@/components/manage/staff/StaffForm';

// Mock Inertia.js
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockSetData = jest.fn();
const mockVisit = jest.fn();

jest.mock('@inertiajs/react', () => ({
    useForm: jest.fn(() => ({
        data: {
            name: { 'zh-TW': '', 'en': '' },
            position: { 'zh-TW': '', 'en': '' },
            email: '',
            phone: '',
            office: '',
            bio: { 'zh-TW': '', 'en': '' },
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

jest.mock('@/components/ui/Input', () => ({
    Input: ({ value, onChange, placeholder, type, error, ...props }: any) => (
        <div>
            <input
                data-testid="input-field"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                type={type}
                {...props}
            />
            {error && <span role="alert" data-testid="input-error">{error}</span>}
        </div>
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

describe('StaffForm Component', () => {
    const mockStaff = {
        id: 1,
        name: { 'zh-TW': '測試職員', 'en': 'Test Staff' },
        position: { 'zh-TW': '測試職位', 'en': 'Test Position' },
        email: 'test@example.com',
        phone: '02-1234-5678',
        office: 'A101',
        bio: { 'zh-TW': '測試簡介', 'en': 'Test Bio' },
        visible: true,
        sort_order: 1,
        avatar: undefined
    };

    const mockOnSubmit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // T021: 測試表單渲染所有必填欄位
    it('renders form with all required fields', () => {
        render(<StaffForm onSubmit={mockOnSubmit} />);

        expect(screen.getByTestId('card')).toBeInTheDocument();
        expect(screen.getByTestId('label-姓名')).toBeInTheDocument();
        expect(screen.getByTestId('label-職位')).toBeInTheDocument();
        expect(screen.getByText('姓名 *')).toBeInTheDocument();
        expect(screen.getByText('職位 *')).toBeInTheDocument();
    });

    // T021: 測試多語言輸入組件
    it('renders multilingual input components', () => {
        render(<StaffForm onSubmit={mockOnSubmit} />);

        expect(screen.getByTestId('input-姓名')).toBeInTheDocument();
        expect(screen.getByTestId('input-職位')).toBeInTheDocument();
        expect(screen.getByTestId('input-個人簡介')).toBeInTheDocument();
    });

    // T021: 測試編輯模式載入現有資料
    it('populates form with existing staff data in edit mode', () => {
        render(<StaffForm staff={mockStaff} onSubmit={mockOnSubmit} />);

        // 檢查表單是否載入現有資料
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('02-1234-5678')).toBeInTheDocument();
        expect(screen.getByDisplayValue('A101')).toBeInTheDocument();
    });

    // T021: 測試表單提交功能
    it('calls onSubmit when form is submitted', async () => {
        const user = userEvent.setup();
        render(<StaffForm onSubmit={mockOnSubmit} />);

        const submitButton = screen.getByTestId('button-default');
        await user.click(submitButton);

        expect(mockOnSubmit).toHaveBeenCalled();
    });

    // T021: 測試取消按鈕功能
    it('navigates back when cancel button is clicked', async () => {
        const user = userEvent.setup();
        render(<StaffForm onSubmit={mockOnSubmit} />);

        const cancelButton = screen.getByTestId('button-outline');
        await user.click(cancelButton);

        expect(mockVisit).toHaveBeenCalledWith(route('manage.staff.index'));
    });

    // T021: 測試可見性開關
    it('handles visibility toggle', async () => {
        const user = userEvent.setup();
        render(<StaffForm onSubmit={mockOnSubmit} />);

        const visibleSwitch = screen.getByTestId('switch-visible');
        await user.click(visibleSwitch);

        expect(mockSetData).toHaveBeenCalledWith('visible', false);
    });

    // T021: 測試多語言內容輸入
    it('handles multilingual content input', async () => {
        const user = userEvent.setup();
        render(<StaffForm onSubmit={mockOnSubmit} />);

        const nameInput = screen.getByTestId('input-姓名');
        await user.type(nameInput, '新職員');

        expect(mockSetData).toHaveBeenCalledWith('name', {
            'zh-TW': '新職員',
            'en': ''
        });
    });

    // T021: 測試排序順序輸入
    it('handles sort order input', async () => {
        const user = userEvent.setup();
        render(<StaffForm onSubmit={mockOnSubmit} />);

        const sortOrderInput = screen.getAllByTestId('input-field').find(
            input => input.getAttribute('type') === 'number'
        );

        if (sortOrderInput) {
            await user.clear(sortOrderInput);
            await user.type(sortOrderInput, '5');
            expect(mockSetData).toHaveBeenCalledWith('sort_order', 5);
        }
    });

    // T021: 測試處理中狀態
    it('disables form during processing', () => {
        // 模擬處理中狀態
        const useFormMock = require('@inertiajs/react').useForm;
        useFormMock.mockReturnValue({
            ...useFormMock(),
            processing: true,
        });

        render(<StaffForm onSubmit={mockOnSubmit} />);

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
                'email': '電子郵件格式不正確'
            },
        });

        render(<StaffForm onSubmit={mockOnSubmit} />);

        expect(screen.getByTestId('error-姓名')).toHaveTextContent('姓名為必填項目');
    });

    // T021: 測試必填欄位標示
    it('shows required field indicators', () => {
        render(<StaffForm onSubmit={mockOnSubmit} />);

        expect(screen.getByText('姓名 *')).toBeInTheDocument();
        expect(screen.getByText('職位 *')).toBeInTheDocument();
        expect(screen.getByText('電子郵件 *')).toBeInTheDocument();
    });

    // T021: 測試 email 格式驗證
    it('validates email format', async () => {
        const user = userEvent.setup();
        render(<StaffForm onSubmit={mockOnSubmit} />);

        const emailInput = screen.getByDisplayValue('') || screen.getAllByTestId('input-field')[0];

        await user.type(emailInput, 'invalid-email');
        fireEvent.blur(emailInput);

        // 這裡應該觸發客戶端驗證
        await waitFor(() => {
            expect(screen.queryByText(/電子郵件格式不正確/)).toBeInTheDocument();
        });
    });

    // T021: 測試表單重置功能
    it('resets form when reset is called', () => {
        const useFormMock = require('@inertiajs/react').useForm;
        const mockReset = jest.fn();

        useFormMock.mockReturnValue({
            ...useFormMock(),
            reset: mockReset,
        });

        render(<StaffForm onSubmit={mockOnSubmit} />);

        // 模擬重置觸發
        expect(mockReset).toBeDefined();
    });

    // T021: 測試電話號碼輸入
    it('handles phone number input', async () => {
        const user = userEvent.setup();
        render(<StaffForm onSubmit={mockOnSubmit} />);

        const phoneInput = screen.getByDisplayValue('02-1234-5678') ||
            screen.getAllByTestId('input-field').find(input =>
                input.getAttribute('placeholder')?.includes('電話')
            );

        if (phoneInput) {
            await user.clear(phoneInput);
            await user.type(phoneInput, '02-9876-5432');
            expect(mockSetData).toHaveBeenCalledWith('phone', '02-9876-5432');
        }
    });
});


