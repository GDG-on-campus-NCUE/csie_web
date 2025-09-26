import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TeacherTable } from '@/components/manage/teacher/TeacherTable';

type TeacherItem = Parameters<typeof TeacherTable>[0]['teachers'][number];

const mockVisit = jest.fn();
const mockDelete = jest.fn();

jest.mock('@inertiajs/react', () => ({
    router: {
        visit: mockVisit,
        delete: mockDelete,
    },
}));

jest.mock('@/components/ui/table', () => ({
    Table: ({ children }: any) => <table data-testid="teacher-table">{children}</table>,
    TableHeader: ({ children }: any) => <thead>{children}</thead>,
    TableBody: ({ children }: any) => <tbody>{children}</tbody>,
    TableRow: ({ children }: any) => <tr>{children}</tr>,
    TableHead: ({ children, onClick }: any) => (
        <th data-testid="table-head" onClick={onClick}>
            {children}
        </th>
    ),
    TableCell: ({ children }: any) => <td>{children}</td>,
}));

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, ...props }: any) => (
        <button data-testid="table-button" onClick={onClick} {...props}>
            {children}
        </button>
    ),
}));

jest.mock('@/components/ui/badge', () => ({
    Badge: ({ children }: any) => <span data-testid="status-badge">{children}</span>,
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => (
        <button data-testid="dropdown-item" onClick={onClick}>
            {children}
        </button>
    ),
    DropdownMenuSeparator: () => <hr />,
}));

jest.mock('lucide-react', () => ({
    MoreHorizontal: () => <span data-testid="more-icon">⋯</span>,
    Eye: () => <span data-testid="eye-icon">👁️</span>,
    Edit: () => <span data-testid="edit-icon">✏️</span>,
    Trash2: () => <span data-testid="trash-icon">🗑️</span>,
    ArrowUpDown: () => <span data-testid="sort-icon">↕️</span>,
    ExternalLink: () => <span data-testid="external-icon">🔗</span>,
}));

describe('TeacherTable', () => {
    const teachers: TeacherItem[] = [
        {
            id: 1,
            name: { 'zh-TW': '林老師', en: 'Mr. Lin' },
            title: { 'zh-TW': '副教授', en: 'Associate Professor' },
            email: 'lin@example.com',
            phone: '02-12345678',
            office: 'E301',
            bio: { 'zh-TW': '專長 AI', en: 'AI expert' },
            specialties: [],
            education: [],
            website: 'https://example.com',
            visible: true,
            sort_order: 1,
            avatar: undefined,
            lab: { id: 1, name: { 'zh-TW': '人工智慧實驗室', en: 'AI Lab' } },
        },
        {
            id: 2,
            name: { 'zh-TW': '陳老師', en: 'Ms. Chen' },
            title: { 'zh-TW': '助理教授', en: 'Assistant Professor' },
            email: 'chen@example.com',
            phone: undefined,
            office: undefined,
            bio: { 'zh-TW': '專長資料庫', en: 'Database expert' },
            specialties: [],
            education: [],
            website: undefined,
            visible: false,
            sort_order: 2,
            avatar: undefined,
            lab: undefined,
        },
    ];

    const baseProps = {
        teachers,
        onEdit: jest.fn(),
        onDelete: jest.fn(),
        onSort: jest.fn(),
        sortField: undefined,
        sortDirection: 'asc' as const,
        locale: 'zh-TW' as const,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders teacher rows with localized names and titles', () => {
        render(<TeacherTable {...baseProps} />);

        expect(screen.getByText('林老師')).toBeInTheDocument();
        expect(screen.getByText('副教授')).toBeInTheDocument();
        expect(screen.getByText('陳老師')).toBeInTheDocument();
        expect(screen.getByText('助理教授')).toBeInTheDocument();
    });

    it('invokes sort handler when table headers are clicked', async () => {
        render(<TeacherTable {...baseProps} />);
        const headers = screen.getAllByTestId('table-head');
        const user = userEvent.setup();

        await user.click(headers[0]);
        expect(baseProps.onSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('calls edit callback from dropdown action', async () => {
        render(<TeacherTable {...baseProps} />);
        const user = userEvent.setup();

        await user.click(screen.getAllByTestId('dropdown-trigger')[0]);
        await user.click(screen.getAllByTestId('dropdown-item')[1]);

        expect(baseProps.onEdit).toHaveBeenCalledWith(teachers[0]);
    });

    it('calls delete callback from dropdown action', async () => {
        render(<TeacherTable {...baseProps} />);
        const user = userEvent.setup();

        await user.click(screen.getAllByTestId('dropdown-trigger')[0]);
        await user.click(screen.getAllByTestId('dropdown-item')[2]);

        expect(baseProps.onDelete).toHaveBeenCalledWith(teachers[0]);
    });
});
