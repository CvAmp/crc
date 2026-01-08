import React from 'react';

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogFooter({ children, className = '' }: DialogFooterProps) {
  return (
    <div className={`flex justify-end space-x-3 mt-6 ${className}`}>
      {children}
    </div>
  );
}