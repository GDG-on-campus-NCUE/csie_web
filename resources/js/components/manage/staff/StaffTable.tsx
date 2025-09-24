import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MoreHorizontal, Eye, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { LocalizedContent, Staff } from '@/types/staff';

const resolveLocalizedField = (
    value: string | LocalizedContent | undefined,
    locale: 'zh-TW' | 'en'
): string => {
    if (!value) {
        return '';
    }

    if (typeof value === 'string') {
        return value;
    }

    return value[locale] ?? value['zh-TW'] ?? '';
};

interface StaffTableProps {
    staff: Staff[];
    onEdit: (staff: Staff) => void;
    onDelete: (staff: Staff) => void;
    onSort?: (field: keyof Staff, direction: 'asc' | 'desc') => void;
    sortField?: keyof Staff;
    sortDirection?: 'asc' | 'desc';
    locale?: 'zh-TW' | 'en';
}

export const StaffTable: React.FC<StaffTableProps> = ({
    staff,
    onEdit,
    onDelete,
    onSort,
    sortField,
    sortDirection = 'asc',
    locale = 'zh-TW'
}) => {
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        staff: Staff | null;
    }>({
        open: false,
        staff: null
    });

    const handleSort = (field: keyof Staff) => {
        if (onSort) {
            const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
            onSort(field, direction);
        }
    };

    const handleDeleteClick = (staffMember: Staff) => {
        setDeleteDialog({
            open: true,
            staff: staffMember
        });
    };

    const handleDeleteConfirm = () => {
        if (deleteDialog.staff) {
            onDelete(deleteDialog.staff);
        }
        setDeleteDialog({ open: false, staff: null });
    };

    const getSortIcon = (field: keyof Staff) => {
        if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
        return (
            <ArrowUpDown
                className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''
                    }`}
            />
        );
    };

    const getDisplayName = (staffMember: Staff) => {
        return resolveLocalizedField(staffMember.name, locale);
    };

    const getDisplayPosition = (staffMember: Staff) => {
        return resolveLocalizedField(staffMember.position, locale);
    };

    const getDisplayBio = (staffMember: Staff) => {
        return resolveLocalizedField(staffMember.bio, locale);
    };

    if (!staff || staff.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>目前沒有員工資料</p>
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
                            onClick={() => handleSort('position')}
                        >
                            <div className="flex items-center">
                                職位 / Position
                                {getSortIcon('position')}
                            </div>
                        </TableHead>
                        <TableHead>聯絡資訊 / Contact</TableHead>
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
                    {staff.map((staffMember) => {
                        const isVisible = staffMember.visible ?? true;

                        return (
                            <TableRow key={staffMember.id}>
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        {staffMember.photo_url && (
                                            <img
                                                src={staffMember.photo_url}
                                                alt={getDisplayName(staffMember)}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                        )}
                                        <div>
                                            <div className="font-medium">
                                                {getDisplayName(staffMember)}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">
                                        {getDisplayPosition(staffMember)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1 text-sm">
                                        {staffMember.email && (
                                            <div className="text-gray-600">
                                                📧 {staffMember.email}
                                            </div>
                                        )}
                                        {staffMember.phone && (
                                            <div className="text-gray-600">
                                                📞 {staffMember.phone}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {staffMember.sort_order ?? '-'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={isVisible ? 'default' : 'secondary'}>
                                        {isVisible ? '顯示' : '隱藏'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-gray-500">
                                        {staffMember.created_at ?
                                            new Date(staffMember.created_at).toLocaleDateString('zh-TW')
                                            : '-'}
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
                                                onClick={() => onEdit(staffMember)}
                                                className="cursor-pointer"
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                編輯 / Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleDeleteClick(staffMember)}
                                                className="cursor-pointer text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                刪除 / Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {/* 刪除確認對話框 */}
            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, staff: null })}
                title="確認刪除職員"
                description={
                    deleteDialog.staff
                        ? `您確定要刪除職員「${getDisplayName(deleteDialog.staff)}」嗎？此操作無法復原。`
                        : ''
                }
                confirmText="刪除"
                cancelText="取消"
                onConfirm={handleDeleteConfirm}
                variant="destructive"
            />
        </div>
    );
};

export default StaffTable;
