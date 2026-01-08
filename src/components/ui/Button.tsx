import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  
  const variantStyles = {
    primary: 'bg-accent text-white hover:bg-accent/90 focus:ring-accent/50',
    secondary: 'bg-secondary-bg text-primary-text hover:bg-secondary-bg/80 focus:ring-secondary-bg/50',
    danger: 'bg-red-600 text-white hover:bg-red-700/90 focus:ring-red-500/50',
    ghost: 'text-secondary-text hover:text-primary-text hover:bg-secondary-bg'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className={`w-5 h-5 ${children ? 'mr-2' : ''}`} />
      ) : null}
      {children}
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className={`w-5 h-5 ${children ? 'ml-2' : ''}`} />
      )}
    </button>
  );
}