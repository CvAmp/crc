import React, { useCallback } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface DeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteModal({ onClose, onConfirm }: DeleteModalProps) {  
  return (
    <ConfirmDialog
      open={true}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Confirm Delete"
      description="Are you sure you want to delete this acceleration? This action cannot be undone."
      confirmLabel="Delete Acceleration"
      variant="danger"
    />
  );
}