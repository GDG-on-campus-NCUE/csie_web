import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'default';
    loading?: boolean;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    onCancel,
    confirmText = '確認',
    cancelText = '取消',
    variant = 'destructive',
    loading = false
}: ConfirmDialogProps) {
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            onOpenChange(false);
        }
    };

    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center space-x-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            variant === 'destructive'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-blue-100 text-blue-600'
                        }`}>
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-left">{title}</DialogTitle>
                    </div>
                </DialogHeader>
                <DialogDescription className="text-left">
                    {description}
                </DialogDescription>
                <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? '處理中...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
