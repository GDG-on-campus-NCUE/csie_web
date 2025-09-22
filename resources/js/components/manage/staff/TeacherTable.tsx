import React from 'react';
import { Link, router } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2, ArrowUpDown, ExternalLink } from 'lucide-react';
import { Teacher } from '@/types/staff';

interface TeacherTableProps {
    teachers: Teacher[];
    onEdit: (teacher: Teacher) => void;
    onDelete: (teacher: Teacher) => void;
    onSort?: (field: keyof Teacher, direction: 'asc' | 'desc') => void;
    sortField?: keyof Teacher;
    sortDirection?: 'asc' | 'desc';
    locale?: 'zh-TW' | 'en';
}

export const TeacherTable: React.FC<TeacherTableProps> = ({
    teachers,
    onEdit,
    onDelete,
    onSort,
    sortField,
    sortDirection = 'asc',
    locale = 'zh-TW'
}) => {
    const handleSort = (field: keyof Teacher) => {
        if (onSort) {
            const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
            onSort(field, direction);
        }
    };

    const getSortIcon = (field: keyof Teacher) => {
        if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
        return (
            <ArrowUpDown
                className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''
                    }`}
            />
        );
    };

    const getDisplayName = (teacher: Teacher) => {
        return teacher.name[locale] || teacher.name['zh-TW'];
    };

    const getDisplayTitle = (teacher: Teacher) => {
        return teacher.title[locale] || teacher.title['zh-TW'];
    };

    const handleView = (teacher: Teacher) => {
        router.visit(`/manage/teachers/${teacher.id}`);
    };

    if (teachers.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>目前沒有教師資料</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('name')}
                        >
                            <div className="flex items-center">
                                姓名 / Name
                                {getSortIcon('name')}
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('title')}
                        >
                            <div className="flex items-center">
                                職稱 / Title
                                {getSortIcon('title')}
                            </div>
                        </TableHead>
                        <TableHead>聯絡資訊 / Contact</TableHead>
                        <TableHead>實驗室 / Lab</TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('sort_order')}
                        >
                            <div className="flex items-center">
                                排序 / Order
                                {getSortIcon('sort_order')}
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('visible')}
                        >
                            <div className="flex items-center">
                                狀態 / Status
                                {getSortIcon('visible')}
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('created_at')}
                        >
                            <div className="flex items-center">
                                創建時間 / Created
                                {getSortIcon('created_at')}
                            </div>
                        </TableHead>
                        <TableHead className="text-right">操作 / Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {teachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                            <TableCell>
                                <div className="flex items-center space-x-3">
                                    {teacher.avatar && (
                                        <img
                                            src={teacher.avatar}
                                            alt={getDisplayName(teacher)}
                                            className="h-8 w-8 rounded-full object-cover"
                                        />
                                    )}
                                    <div>
                                        <div className="font-medium">
                                            {getDisplayName(teacher)}
                                        </div>
                                        {teacher.user && (
                                            <div className="text-sm text-gray-500">
                                                用戶: {teacher.user.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">
                                    {getDisplayTitle(teacher)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1 text-sm">
                                    <div className="text-gray-600">
                                        📧 {teacher.email}
                                    </div>
                                    {teacher.phone && (
                                        <div className="text-gray-600">
                                            📞 {teacher.phone}
                                        </div>
                                    )}
                                    {teacher.office && (
                                        <div className="text-gray-600">
                                            🏢 {teacher.office}
                                        </div>
                                    )}
                                    {teacher.website && (
                                        <div className="text-gray-600">
                                            <a
                                                href={teacher.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center hover:text-blue-600"
                                            >
                                                🌐 個人網站
                                                <ExternalLink className="ml-1 h-3 w-3" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {teacher.lab ? (
                                    <Badge variant="outline">
                                        {teacher.lab.name?.[locale] || teacher.lab.name?.['zh-TW'] || '未命名實驗室'}
                                    </Badge>
                                ) : (
                                    <span className="text-gray-400">無</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">
                                    {teacher.sort_order}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={teacher.visible ? "default" : "secondary"}
                                >
                                    {teacher.visible ? '顯示' : '隱藏'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm text-gray-500">
                                    {teacher.created_at ?
                                        new Date(teacher.created_at).toLocaleDateString('zh-TW')
                                        : '-'
                                    }
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">打開選單</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => handleView(teacher)}
                                            className="cursor-pointer"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            查看 / View
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onEdit(teacher)}
                                            className="cursor-pointer"
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            編輯 / Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => onDelete(teacher)}
                                            className="cursor-pointer text-red-600 focus:text-red-600"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            刪除 / Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default TeacherTable;
