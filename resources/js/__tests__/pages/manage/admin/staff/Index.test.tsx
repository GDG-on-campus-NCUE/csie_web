import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import Index from '@/pages/manage/admin/staff/index';
import { createInertiaApp } from '@inertiajs/react';

// Mock Inertia.js
const mockVisit = jest.fn();
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockDelete = jest.fn();

jest.mock('@inertiajs/react', () => {
    return {
        router: {
            visit: mockVisit,
            get: mockGet,
            post: mockPost,
            delete: mockDelete,
        },
        usePage: () => ({
            props: {},
            url: '/manage/staff',
        }),
        Head: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        Link: ({ href, children, ...props }: any) => (
            <a href={href} {...props}>
                {children}
            </a>
        ),
    };
});

// Mock UI components
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, ...props }: any) => (
        <button onClick={onClick} {...props}>
            {children}
        </button>
    ),
}));

jest.mock('@/components/ui/tabs', () => ({
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

jest.mock('@/components/ui/card', () => ({
    Card: ({ children }: any) => <div data-testid="card">{children}</div>,
    CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
    CardTitle: ({ children }: any) => <h2 data-testid="card-title">{children}</h2>,
    CardDescription: ({ children }: any) => <p data-testid="card-description">{children}</p>,
    CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
    Badge: ({ children, variant }: any) => (
        <span data-testid="badge" data-variant={variant}>
            {children}
        </span>
    ),
}));

// Mock translation hook
jest.mock('@/hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'staff.index.title': '師資與職員管理',
                'staff.index.description': '管理系所教師與職員資料，維護個人檔案與聯絡資訊。',
                'staff.tabs.staff': '職員管理',
                'staff.tabs.teachers': '教師管理',
                'staff.staff.title': '職員管理',
                'staff.teachers.title': '教師管理',
                'staff.actions.create_staff': '新增職員',
                'staff.actions.create_teacher': '新增教師',
                'staff.table.name': '姓名',
                'staff.table.position': '職位',
                'staff.table.email': '電子郵件',
                'staff.table.actions': '操作',
                'staff.actions.edit': '編輯',
                'staff.actions.delete': '刪除',
                'staff.status.active': '在職',
                'staff.status.inactive': '離職',
            };
            return translations[key] || key;
        },
        locale: 'zh-TW',
    }),
}));

describe('Staff Index Page', () => {
    const mockStaffData = {
        active: [
            {
                id: 1,
                name: '張三',
                name_en: 'Zhang San',
                position: '系辦職員',
                position_en: 'Department Staff',
                email: 'zhang.san@example.com',
                phone: '02-12345678',
                visible: true,
                sort_order: 10,
            },
            {
                id: 2,
                name: '李四',
                name_en: 'Li Si',
                position: '系辦助理',
                position_en: 'Department Assistant',
                email: 'li.si@example.com',
                phone: '02-87654321',
                visible: true,
                sort_order: 20,
            },
        ],
        trashed: [
            {
                id: 3,
                name: '王五',
                name_en: 'Wang Wu',
                position: '前職員',
                position_en: 'Former Staff',
                email: 'wang.wu@example.com',
                visible: false,
                sort_order: 30,
                deleted_at: '2024-01-01T00:00:00.000000Z',
            },
        ],
    };

    const mockTeachersData = {
        data: [
            {
                id: 1,
                name: { 'zh-TW': '陳教授', en: 'Prof. Chen' },
                title: { 'zh-TW': '副教授', en: 'Associate Professor' },
                email: 'prof.chen@example.com',
                phone: '02-12345678',
                office: 'E301',
                visible: true,
                sort_order: 10,
                user: {
                    id: 1,
                    name: '陳教授',
                    email: 'prof.chen@example.com',
                    role: 'teacher' as const,
                },
                lab: {
                    id: 1,
                    name: { 'zh-TW': '資料庫實驗室', en: 'Database Lab' },
                },
            },
        ],
        links: {},
        meta: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 1,
        },
    };

    const defaultProps = {
        initialTab: 'teachers' as const,
        staff: mockStaffData,
        teachers: mockTeachersData,
        perPage: 15,
        perPageOptions: [15, 30, 50, 100],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * T019: Test basic rendering and component structure
     */
    it('renders staff management page with correct structure', () => {
        render(<Index {...defaultProps} />);

        expect(screen.getByText('師資與職員管理')).toBeInTheDocument();
        expect(screen.getByText('管理系所教師與職員資料，維護個人檔案與聯絡資訊。')).toBeInTheDocument();
        expect(screen.getByTestId('tabs')).toBeInTheDocument();
        expect(screen.getByTestId('tab-teachers')).toBeInTheDocument();
        expect(screen.getByTestId('tab-staff')).toBeInTheDocument();
    });

    /**
     * T019: Test tab switching functionality
     */
    it('displays teachers tab by default when initialTab is teachers', () => {
        render(<Index {...defaultProps} initialTab="teachers" />);

        const tabsElement = screen.getByTestId('tabs');
        expect(tabsElement).toHaveAttribute('data-value', 'teachers');
        expect(screen.getByTestId('tab-content-teachers')).toBeInTheDocument();
    });

    /**
     * T019: Test staff tab content
     */
    it('displays staff tab content when staff tab is active', () => {
        render(<Index {...defaultProps} initialTab="staff" />);

        const tabsElement = screen.getByTestId('tabs');
        expect(tabsElement).toHaveAttribute('data-value', 'staff');
        expect(screen.getByTestId('tab-content-staff')).toBeInTheDocument();
    });

    /**
     * T019: Test staff data rendering
     */
    it('renders active staff members correctly', () => {
        render(<Index {...defaultProps} initialTab="staff" />);

        // Check if staff data is displayed
        expect(screen.getByText('張三')).toBeInTheDocument();
        expect(screen.getByText('系辦職員')).toBeInTheDocument();
        expect(screen.getByText('zhang.san@example.com')).toBeInTheDocument();

        expect(screen.getByText('李四')).toBeInTheDocument();
        expect(screen.getByText('系辦助理')).toBeInTheDocument();
        expect(screen.getByText('li.si@example.com')).toBeInTheDocument();
    });

    /**
     * T019: Test teacher data rendering
     */
    it('renders teacher data correctly', () => {
        render(<Index {...defaultProps} initialTab="teachers" />);

        expect(screen.getByText('陳教授')).toBeInTheDocument();
        expect(screen.getByText('副教授')).toBeInTheDocument();
        expect(screen.getByText('prof.chen@example.com')).toBeInTheDocument();
        expect(screen.getByText('E301')).toBeInTheDocument();
    });

    /**
     * T019: Test create staff button functionality
     */
    it('has create staff button that navigates to create page', () => {
        render(<Index {...defaultProps} initialTab="staff" />);

        const createButton = screen.getByText('新增職員');
        expect(createButton).toBeInTheDocument();

        fireEvent.click(createButton);
        expect(mockVisit).toHaveBeenCalledWith('/manage/staff/create');
    });

    /**
     * T019: Test create teacher button functionality
     */
    it('has create teacher button that navigates to create page', () => {
        render(<Index {...defaultProps} initialTab="teachers" />);

        const createButton = screen.getByText('新增教師');
        expect(createButton).toBeInTheDocument();

        fireEvent.click(createButton);
        expect(mockVisit).toHaveBeenCalledWith('/manage/teachers/create');
    });

    /**
     * T019: Test edit action buttons
     */
    it('renders edit buttons for staff members', () => {
        render(<Index {...defaultProps} initialTab="staff" />);

        const editButtons = screen.getAllByText('編輯');
        expect(editButtons).toHaveLength(2); // Two active staff members

        fireEvent.click(editButtons[0]);
        expect(mockVisit).toHaveBeenCalledWith('/manage/staff/1/edit');
    });

    /**
     * T019: Test delete action buttons
     */
    it('renders delete buttons for staff members', () => {
        render(<Index {...defaultProps} initialTab="staff" />);

        const deleteButtons = screen.getAllByText('刪除');
        expect(deleteButtons).toHaveLength(2);

        fireEvent.click(deleteButtons[0]);
        expect(mockDelete).toHaveBeenCalledWith('/manage/staff/1');
    });

    /**
     * T019: Test pagination rendering
     */
    it('displays pagination information for teachers', () => {
        render(<Index {...defaultProps} initialTab="teachers" />);

        // Check if pagination meta information is displayed
        expect(screen.getByText(/第.*頁/)).toBeInTheDocument();
    });

    /**
     * T019: Test empty state handling
     */
    it('handles empty staff list gracefully', () => {
        const emptyProps = {
            ...defaultProps,
            staff: { active: [], trashed: [] },
        };

        render(<Index {...emptyProps} initialTab="staff" />);

        expect(screen.getByText('師資與職員管理')).toBeInTheDocument();
        // Should not show any staff data
        expect(screen.queryByText('張三')).not.toBeInTheDocument();
    });

    /**
     * T019: Test trashed staff visibility
     */
    it('displays trashed staff separately', () => {
        render(<Index {...defaultProps} initialTab="staff" />);

        // Check if trashed staff is shown in a separate section
        expect(screen.getByText('王五')).toBeInTheDocument();
    });

    /**
     * T019: Test multilingual support
     */
    it('displays both Chinese and English names when available', () => {
        render(<Index {...defaultProps} initialTab="staff" />);

        expect(screen.getByText('張三')).toBeInTheDocument();
        expect(screen.getByText('Zhang San')).toBeInTheDocument();
        expect(screen.getByText('系辦職員')).toBeInTheDocument();
        expect(screen.getByText('Department Staff')).toBeInTheDocument();
    });

    /**
     * T019: Test responsive design classes
     */
    it('applies responsive design classes', () => {
        const { container } = render(<Index {...defaultProps} />);

        // Check if responsive container classes are applied
        expect(container.querySelector('.container')).toBeInTheDocument();
    });

    /**
     * T019: Test accessibility features
     */
    it('has proper accessibility attributes', () => {
        render(<Index {...defaultProps} />);

        // Check for proper headings
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('師資與職員管理');

        // Check for proper button roles
        const createButton = screen.getByText('新增教師');
        expect(createButton).toHaveAttribute('role', 'button');
    });
});
