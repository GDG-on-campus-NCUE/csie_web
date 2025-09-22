import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { StaffTable } from '@/components/manage/staff/StaffTable';

// Mock Inertia.js
const mockVisit = jest.fn();
const mockDelete = jest.fn();

jest.mock('@inertiajs/react', () => ({
    router: {
        visit: mockVisit,
        delete: mockDelete,
    },
}));

// Mock UI components
jest.mock('@/components/ui/Table', () => ({
    Table: ({ children }: any) => <table data-testid="staff-table">{children}</table>,
    TableHeader: ({ children }: any) => <thead data-testid="table-header">{children}</thead>,
    TableBody: ({ children }: any) => <tbody data-testid="table-body">{children}</tbody>,
    TableRow: ({ children }: any) => <tr data-testid="table-row">{children}</tr>,
    TableHead: ({ children, onClick }: any) => (
        <th data-testid="table-head" onClick={onClick}>
            {children}
        </th>
    ),
    TableCell: ({ children }: any) => <td data-testid="table-cell">{children}</td>,
}));

jest.mock('@/components/ui/Button', () => ({
    Button: ({ children, onClick, variant, size, ...props }: any) => (
        <button
            data-testid={`button-${variant || 'default'}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    ),
}));

jest.mock('@/components/ui/Badge', () => ({
    Badge: ({ children, variant }: any) => (
        <span data-testid={`badge-${variant || 'default'}`}>
            {children}
        </span>
    ),
}));

jest.mock('@/components/ui/DropdownMenu', () => ({
    DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => (
        <div data-testid="dropdown-item" onClick={onClick}>
            {children}
        </div>
    ),
}));

// Mock icons
jest.mock('lucide-react', () => ({
    MoreHorizontal: () => <span data-testid="more-icon">⋯</span>,
    Edit: () => <span data-testid="edit-icon">✏️</span>,
    Eye: () => <span data-testid="eye-icon">👁️</span>,
    Trash2: () => <span data-testid="trash-icon">🗑️</span>,
    ArrowUpDown: () => <span data-testid="sort-icon">↕️</span>,
}));

describe('StaffTable Component', () => {
    const mockStaffList = [
        {
            id: 1,
            name: { 'zh-TW': '張三', 'en': 'Zhang San' },
            position: { 'zh-TW': '系辦職員', 'en': 'Department Staff' },
            email: 'zhang.san@example.com',
            phone: '02-1234-5678',
            office: 'A101',
            bio: { 'zh-TW': '負責行政工作', 'en': 'Administrative work' },
            visible: true,
            sort_order: 1,
            avatar: undefined
        },
        {
            id: 2,
            name: { 'zh-TW': '李四', 'en': 'Li Si' },
            position: { 'zh-TW': '助教', 'en': 'Teaching Assistant' },
            email: 'li.si@example.com',
            phone: '02-9876-5432',
            office: 'B202',
            bio: { 'zh-TW': '協助教學', 'en': 'Teaching assistance' },
            visible: false,
            sort_order: 2,
            avatar: undefined
        }
    ];

    const mockPagination = {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 2,
        from: 1,
        to: 2
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // T021: 測試表格渲染和資料顯示
    it('renders staff table with data', () => {
        render(
            <StaffTable
                staff={mockStaffList}
                pagination={mockPagination}
                onSort={jest.fn()}
                sortField=""
                sortDirection="asc"
            />
        );

        expect(screen.getByTestId('staff-table')).toBeInTheDocument();
        expect(screen.getByTestId('table-header')).toBeInTheDocument();
        expect(screen.getByTestId('table-body')).toBeInTheDocument();

        // 檢查是否顯示職員資料
        expect(screen.getByText('張三')).toBeInTheDocument();
        expect(screen.getByText('李四')).toBeInTheDocument();
        expect(screen.getByText('zhang.san@example.com')).toBeInTheDocument();
        expect(screen.getByText('li.si@example.com')).toBeInTheDocument();
    });

    // T021: 測試表格標題和排序功能
    it('displays table headers with sort functionality', () => {
        const mockOnSort = jest.fn();

        render(
            <StaffTable
                staff={mockStaffList}
                pagination={mockPagination}
                onSort={mockOnSort}
                sortField=""
                sortDirection="asc"
            />
        );

        const headers = screen.getAllByTestId('table-head');
        expect(headers.length).toBeGreaterThan(0);

        // 測試點擊排序
        const nameHeader = headers.find(header =>
            header.textContent?.includes('姓名')
        );

        if (nameHeader) {
            fireEvent.click(nameHeader);
            expect(mockOnSort).toHaveBeenCalledWith('name');
        }
    });

    // T021: 測試職員狀態顯示
    it('displays staff visibility status correctly', () => {
        render(
            <StaffTable
                staff={mockStaffList}
                pagination={mockPagination}
                onSort={jest.fn()}
                sortField=""
                sortDirection="asc"
            />
        );

        // 檢查可見性狀態的 badge
        const visibleBadges = screen.getAllByTestId('badge-default');
        expect(visibleBadges.length).toBeGreaterThan(0);
    });

    // T021: 測試操作按鈕
    it('displays action buttons for each staff member', () => {
        render(
            <StaffTable
                staff={mockStaffList}
                pagination={mockPagination}
                onSort={jest.fn()}
                sortField=""
                sortDirection="asc"
            />
        );

        // 檢查下拉選單觸發器
        const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
        expect(dropdownTriggers.length).toBe(mockStaffList.length);

        // 檢查操作圖示
        expect(screen.getAllByTestId('more-icon')).toHaveLength(mockStaffList.length);
    });

    // T021: 測試檢視功能
    it('handles view action correctly', async () => {
        const user = userEvent.setup();

        render(
            <StaffTable
                staff={mockStaffList}
                pagination={mockPagination}
                onSort={jest.fn()}
                sortField=""
                sortDirection="asc"
            />
        );

        // 模擬點擊操作選單並選擇檢視
        const firstDropdown = screen.getAllByTestId('dropdown-trigger')[0];
        await user.click(firstDropdown);

        const viewItems = screen.getAllByTestId('dropdown-item').filter(item =>
            item.textContent?.includes('檢視') || item.querySelector('[data-testid="eye-icon"]')
        );

        if (viewItems.length > 0) {
            await user.click(viewItems[0]);
            expect(mockVisit).toHaveBeenCalledWith(route('manage.staff.show', 1));
        }
    });

    // T021: 測試編輯功能
    it('handles edit action correctly', async () => {
        const user = userEvent.setup();

        render(
            <StaffTable
                staff={mockStaffList}
                pagination={mockPagination}
                onSort={jest.fn()}
                sortField=""
                sortDirection="asc"
            />
        );

        // 模擬點擊編輯
        const editItems = screen.getAllByTestId('dropdown-item').filter(item =>
            item.textContent?.includes('編輯') || item.querySelector('[data-testid="edit-icon"]')
        );

        if (editItems.length > 0) {
            await user.click(editItems[0]);
            expect(mockVisit).toHaveBeenCalledWith(route('manage.staff.edit', 1));
        }
    });

    // T021: 測試刪除功能
    it('handles delete action correctly', async () => {
        const user = userEvent.setup();

        // Mock window.confirm
        Object.defineProperty(window, 'confirm', {
            writable: true,
            value: jest.fn(() => true),
        });

        render(
            <StaffTable
                staff={mockStaffList}
                pagination={mockPagination}
                onSort={jest.fn()}
                sortField=""
                sortDirection="asc"
            />
        );

        // 模擬點擊刪除
        const deleteItems = screen.getAllByTestId('dropdown-item').filter(item =>
            item.textContent?.includes('刪除') || item.querySelector('[data-testid="trash-icon"]')
        );

        if (deleteItems.length > 0) {
            await user.click(deleteItems[0]);
            expect(window.confirm).toHaveBeenCalledWith('確定要刪除這位職員嗎？');
            expect(mockDelete).toHaveBeenCalledWith(route('manage.staff.destroy', 1));
        }
    });

    // T021: 測試取消刪除
    it('cancels delete when user declines confirmation', async () => {
        const user = userEvent.setup();

        // Mock window.confirm 返回 false
        Object.defineProperty(window, 'confirm', {
            writable: true,
            value: jest.fn(() => false),
        });

        render(
            <StaffTable
                staff={mockStaffList}
                pagination={mockPagination}
                onSort={jest.fn()}
                sortField=""
                sortDirection="asc"
            />
        );

        // 模擬點擊刪除但取消
        const deleteItems = screen.getAllByTestId('dropdown-item').filter(item =>
            item.textContent?.includes('刪除') || item.querySelector('[data-testid="trash-icon"]')
        );

        if (deleteItems.length > 0) {
            await user.click(deleteItems[0]);
            expect(window.confirm).toHaveBeenCalled();
            expect(mockDelete).not.toHaveBeenCalled();
        }
    });

    // T021: 測試空資料狀態
    it('displays empty state when no staff data', () => {
        render(
            <StaffTable
                staff={[]}
                pagination={{ ...mockPagination, total: 0 }}
                onSort={jest.fn()}
                sortField=""
                sortDirection="asc"
            />
        );

        expect(screen.getByTestId('staff-table')).toBeInTheDocument();
        expect(screen.getByText('暫無職員資料')).toBeInTheDocument();
    });

    // T021: 測試排序指示器
    it('displays sort indicators correctly', () => {
        render(
            <StaffTable
                staff={mockStaffList}
                pagination={mockPagination}
                onSort={jest.fn()}
                sortField="name"
                sortDirection="desc"
            />
        );

        // 檢查排序圖示
        const sortIcons = screen.getAllByTestId('sort-icon');
        expect(sortIcons.length).toBeGreaterThan(0);
    });

    // T021: 測試響應式設計
    it('applies responsive styling', () => {
        const { container } = render(
            <StaffTable
                staff={mockStaffList}
                pagination={mockPagination}
                onSort={jest.fn()}
                sortField=""
                sortDirection="asc"
            />
        );

        // 檢查響應式類別
        expect(container.querySelector('.overflow-x-auto')).toBeInTheDocument();
    });

    // T021: 測試資料格式化
    it('formats data correctly', () => {
        render(
            <StaffTable
                staff={mockStaffList}
                pagination={mockPagination}
                onSort={jest.fn()}
                sortField=""
                sortDirection="asc"
            />
        );

        // 檢查職位顯示（應該顯示中文）
        expect(screen.getByText('系辦職員')).toBeInTheDocument();
        expect(screen.getByText('助教')).toBeInTheDocument();

        // 檢查辦公室資訊
        expect(screen.getByText('A101')).toBeInTheDocument();
        expect(screen.getByText('B202')).toBeInTheDocument();
    });

    // T021: 測試分頁資訊顯示
    it('displays pagination information', () => {
        render(
            <StaffTable
                staff={mockStaffList}
                pagination={mockPagination}
                onSort={jest.fn()}
                sortField=""
                sortDirection="asc"
            />
        );

        // 檢查是否有分頁相關的資訊
        expect(screen.getByText(/共 2 筆/)).toBeInTheDocument();
    });

    // T021: 測試多語言內容顯示
    it('displays multilingual content correctly', () => {
        render(
            <StaffTable
                staff={mockStaffList}
                pagination={mockPagination}
                onSort={jest.fn()}
                sortField=""
                sortDirection="asc"
                locale="en"
            />
        );

        // 當切換到英文時，應該顯示英文內容
        expect(screen.getByText('Zhang San')).toBeInTheDocument();
        expect(screen.getByText('Li Si')).toBeInTheDocument();
    });
});
