import React, { useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({ title, onClose, children, maxWidth = 'md' }: ModalProps) {
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

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
      <div className={`bg-primary-bg rounded-lg shadow-xl ${maxWidthClasses[maxWidth]} w-full p-6 border border-secondary-bg`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary-text">{title}</h2>
          <button
            onClick={onClose}
            className="text-secondary-text hover:text-primary-text"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}