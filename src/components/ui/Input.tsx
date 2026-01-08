import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-md border ${
        error ? 'border-red-300' : 'border-secondary-bg'
      } shadow-sm px-4 py-2 focus:ring-accent focus:border-accent bg-primary-bg text-primary-text ${className}`}
      {...props}
    />
  );
}