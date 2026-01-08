import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog } from './Dialog';
import { DialogFooter } from './DialogFooter';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger'
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="sm"
    >
      <div className="flex items-center space-x-3 text-red-600 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
        <h3 className="text-lg font-semibold text-primary-text">{title}</h3>
      </div>
      
      <p className="text-secondary-text mb-6">{description}</p>
      
      <DialogFooter>
        <Button
          variant="ghost"
          onClick={onClose}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}