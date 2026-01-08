import React, { useCallback } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md'
}: DialogProps) {
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!open) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <div
      className="fixed inset-0 bg-primary-text/50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className={`bg-primary-bg rounded-lg shadow-xl ${maxWidthClasses[maxWidth]} w-full border border-secondary-bg`}>
        <div className="flex justify-between items-start p-6 border-b border-secondary-bg">
          <div>
            <h2 className="text-xl font-semibold text-primary-text">{title}</h2>
            {description && (
              <p className="mt-2 text-sm text-secondary-text">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-secondary-text hover:text-primary-text rounded-full p-1 hover:bg-secondary-bg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}