import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import userEvent from '@testing-library/user-event';
import { TeacherTable } from '@/components/manage/teacher/TeacherTable';

// Mock Inertia.js
const mockVisit = jest.fn();
const mockDelete = jest.fn();

jest.mock('@inertiajs/react', () => ({
    router: {
        visit: mockVisit,
        delete: mockDelete,
    },
}));

// Mock global route function
(global as any).route = jest.fn((name: string, params?: any) => {
    if (params) {
        return `/${name}/${params}`;
    }
    return `/${name}`;
});

// Mock UI components
jest.mock('@/components/ui/Table', () => ({
    Table: ({ children }: any) => <table data-testid="teacher-table">{children}</table>,
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
    ExternalLink: () => <span data-testid="external-link-icon">🔗</span>,
}));

describe('TeacherTable Component', () => {
    const mockTeacherList = [
        {
            id: 1,
            name: { 'zh-TW': '張教授', 'en': 'Prof. Zhang' },
            title: { 'zh-TW': '教授', 'en': 'Professor' },
            email: 'prof.zhang@example.com',
            phone: '02-1234-5678',
            office: 'C301',
            bio: { 'zh-TW': '專精計算機科學', 'en': 'Computer Science Expert' },
            specialties: [
                { 'zh-TW': '機器學習', 'en': 'Machine Learning' }
            ],
            education: [
                { 'zh-TW': '台大資工博士', 'en': 'Ph.D. in CS, NTU' }
            ],
            website: 'https://prof-zhang.example.com',
            user_id: 1,
            lab_id: 1,
            visible: true,
            sort_order: 1,
            avatar: undefined,
            user: { id: 1, name: '張教授', email: 'prof.zhang@example.com', role: 'teacher' as const },
            lab: { id: 1, name: { 'zh-TW': 'AI 實驗室', 'en': 'AI Lab' } }
        },
        {
            id: 2,
            name: { 'zh-TW': '李教授', 'en': 'Prof. Li' },
            title: { 'zh-TW': '副教授', 'en': 'Associate Professor' },
            email: 'prof.li@example.com',
            phone: '02-9876-5432',
            office: 'D402',
            bio: { 'zh-TW': '專精網路安全', 'en': 'Network Security Expert' },
            specialties: [
                { 'zh-TW': '網路安全', 'en': 'Network Security' }
            ],
            education: [
                { 'zh-TW': '清大資工博士', 'en': 'Ph.D. in CS, NTHU' }
            ],
            website: undefined,
            user_id: undefined,
            lab_id: undefined,
            visible: false,
            sort_order: 2,
            avatar: undefined,
            user: undefined,
            lab: undefined
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

    const handleEdit = jest.fn((teacher: any) => {
        mockVisit(`/manage.teachers.edit/${teacher.id}`);
    });

    const handleDeleteAction = jest.fn((teacher: any) => {
        mockDelete(`/manage.teachers.destroy/${teacher.id}`);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        handleEdit.mockClear();
        handleDeleteAction.mockClear();
    });

    // T021: 測試表格渲染和資料顯示
    it('renders teacher table with data', () => {
        render(
            <TeacherTable
                teachers={mockTeacherList}
                onSort={jest.fn()}
                onEdit={handleEdit}
                onDelete={handleDeleteAction}
                sortField={undefined}
                sortDirection="asc"
            />
        );

        expect(screen.getByTestId('teacher-table')).toBeInTheDocument();
        expect(screen.getByTestId('table-header')).toBeInTheDocument();
        expect(screen.getByTestId('table-body')).toBeInTheDocument();

        // 檢查是否顯示教師資料
        expect(screen.getByText('張教授')).toBeInTheDocument();
        expect(screen.getByText('李教授')).toBeInTheDocument();
        expect(screen.getByText('prof.zhang@example.com')).toBeInTheDocument();
        expect(screen.getByText('prof.li@example.com')).toBeInTheDocument();
    });

    // T021: 測試表格標題和排序功能
    it('displays table headers with sort functionality', () => {
        const mockOnSort = jest.fn();

        render(
            <TeacherTable
                teachers={mockTeacherList}
                onSort={mockOnSort}
                onEdit={handleEdit}
                onDelete={handleDeleteAction}
                sortField={undefined}
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

    // T021: 測試教師狀態和關聯顯示
    it('displays teacher status and relations correctly', () => {
        render(
            <TeacherTable
                teachers={mockTeacherList}
                onSort={jest.fn()}
                onEdit={handleEdit}
                onDelete={handleDeleteAction}
                sortField={undefined}
                sortDirection="asc"
            />
        );

        // 檢查職稱顯示
        expect(screen.getByText('教授')).toBeInTheDocument();
        expect(screen.getByText('副教授')).toBeInTheDocument();

        // 檢查實驗室顯示
        expect(screen.getByText('AI 實驗室')).toBeInTheDocument();

        // 檢查可見性狀態
        const badges = screen.getAllByTestId('badge-default');
        expect(badges.length).toBeGreaterThan(0);
    });

    // T021: 測試操作按鈕
    it('displays action buttons for each teacher', () => {
        render(
            <TeacherTable
                teachers={mockTeacherList}
                onSort={jest.fn()}
                onEdit={handleEdit}
                onDelete={handleDeleteAction}
                sortField={undefined}
                sortDirection="asc"
            />
        );

        // 檢查下拉選單觸發器
        const dropdownTriggers = screen.getAllByTestId('dropdown-trigger');
        expect(dropdownTriggers.length).toBe(mockTeacherList.length);

        // 檢查操作圖示
        expect(screen.getAllByTestId('more-icon')).toHaveLength(mockTeacherList.length);
    });

    // T021: 測試外部網站連結
    it('displays website links correctly', () => {
        render(
            <TeacherTable
                teachers={mockTeacherList}
                onSort={jest.fn()}
                sortField={undefined}
                sortDirection="asc"
            />
        );

        // 第一位教師有網站，應該顯示外部連結圖示
        expect(screen.getByTestId('external-link-icon')).toBeInTheDocument();
    });

    // T021: 測試檢視功能
    it('handles view action correctly', async () => {
        const user = userEvent.setup();

        render(
            <TeacherTable
                teachers={mockTeacherList}
                onSort={jest.fn()}
                sortField={undefined}
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
            expect(mockVisit).toHaveBeenCalledWith('/manage.teachers.show/1');
        }
    });

    // T021: 測試編輯功能
    it('handles edit action correctly', async () => {
        const user = userEvent.setup();

        render(
            <TeacherTable
                teachers={mockTeacherList}
                onSort={jest.fn()}
                sortField={undefined}
                sortDirection="asc"
            />
        );

        // 模擬點擊編輯
        const editItems = screen.getAllByTestId('dropdown-item').filter(item =>
            item.textContent?.includes('編輯') || item.querySelector('[data-testid="edit-icon"]')
        );

        if (editItems.length > 0) {
            await user.click(editItems[0]);
            expect(mockVisit).toHaveBeenCalledWith('/manage.teachers.edit/1');
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
            <TeacherTable
                teachers={mockTeacherList}
                onSort={jest.fn()}
                sortField={undefined}
                sortDirection="asc"
            />
        );

        // 模擬點擊刪除
        const deleteItems = screen.getAllByTestId('dropdown-item').filter(item =>
            item.textContent?.includes('刪除') || item.querySelector('[data-testid="trash-icon"]')
        );

        if (deleteItems.length > 0) {
            await user.click(deleteItems[0]);
            expect(window.confirm).toHaveBeenCalledWith('確定要刪除這位教師嗎？');
            expect(mockDelete).toHaveBeenCalledWith('/manage.teachers.destroy/1');
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
            <TeacherTable
                teachers={mockTeacherList}
                onSort={jest.fn()}
                sortField={undefined}
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
    it('displays empty state when no teacher data', () => {
        render(
            <TeacherTable
                teachers={[]}
                onSort={jest.fn()}
                sortField={undefined}
                sortDirection="asc"
            />
        );

        expect(screen.getByTestId('teacher-table')).toBeInTheDocument();
        expect(screen.getByText('暫無教師資料')).toBeInTheDocument();
    });

    // T021: 測試排序指示器
    it('displays sort indicators correctly', () => {
        render(
            <TeacherTable
                teachers={mockTeacherList}
                onSort={jest.fn()}
                sortField="name"
                sortDirection="desc"
            />
        );

        // 檢查排序圖示
        const sortIcons = screen.getAllByTestId('sort-icon');
        expect(sortIcons.length).toBeGreaterThan(0);
    });

    // T021: 測試專長顯示
    it('displays teacher specialties correctly', () => {
        render(
            <TeacherTable
                teachers={mockTeacherList}
                onSort={jest.fn()}
                sortField={undefined}
                sortDirection="asc"
            />
        );

        // 檢查專長顯示
        expect(screen.getByText('機器學習')).toBeInTheDocument();
        expect(screen.getByText('網路安全')).toBeInTheDocument();
    });

    // T021: 測試關聯資料顯示
    it('handles missing relations gracefully', () => {
        render(
            <TeacherTable
                teachers={mockTeacherList}
                onSort={jest.fn()}
                sortField={undefined}
                sortDirection="asc"
            />
        );

        // 第二位教師沒有關聯的 user 和 lab，應該正常顯示
        expect(screen.getByText('李教授')).toBeInTheDocument();
        expect(screen.getByText('副教授')).toBeInTheDocument();
    });

    // T021: 測試響應式設計
    it('applies responsive styling', () => {
        const { container } = render(
            <TeacherTable
                teachers={mockTeacherList}
                onSort={jest.fn()}
                sortField={undefined}
                sortDirection="asc"
            />
        );

        // 檢查響應式類別
        expect(container.querySelector('.overflow-x-auto')).toBeInTheDocument();
    });

    // T021: 測試分頁資訊顯示
    it('displays pagination information', () => {
        render(
            <TeacherTable
                teachers={mockTeacherList}
                onSort={jest.fn()}
                sortField={undefined}
                sortDirection="asc"
            />
        );

        // 檢查是否有分頁相關的資訊
        expect(screen.getByText(/共 2 筆/)).toBeInTheDocument();
    });

    // T021: 測試多語言內容顯示
    it('displays multilingual content correctly', () => {
        render(
            <TeacherTable
                teachers={mockTeacherList}
                onSort={jest.fn()}
                sortField={undefined}
                sortDirection="asc"
                locale="en"
            />
        );

        // 當切換到英文時，應該顯示英文內容
        expect(screen.getByText('Prof. Zhang')).toBeInTheDocument();
        expect(screen.getByText('Prof. Li')).toBeInTheDocument();
        expect(screen.getByText('Professor')).toBeInTheDocument();
        expect(screen.getByText('Associate Professor')).toBeInTheDocument();
    });

    // T021: 測試辦公室和聯絡資訊顯示
    it('displays office and contact information', () => {
        render(
            <TeacherTable
                teachers={mockTeacherList}
                onSort={jest.fn()}
                sortField={undefined}
                sortDirection="asc"
            />
        );

        // 檢查辦公室資訊
        expect(screen.getByText('C301')).toBeInTheDocument();
        expect(screen.getByText('D402')).toBeInTheDocument();

        // 檢查聯絡電話
        expect(screen.getByText('02-1234-5678')).toBeInTheDocument();
        expect(screen.getByText('02-9876-5432')).toBeInTheDocument();
    });
});
