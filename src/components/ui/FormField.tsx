import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, required, error, icon: Icon, children, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-primary-text mb-1 flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-text">
            <Icon className="h-5 w-5 text-secondary-text" />
          </div>
        )}
        <div className={Icon ? 'pl-10' : ''}>
          {children}
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}