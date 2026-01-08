import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: Array<{ value: string; label: string; }>;
  placeholder?: string;
  icon?: React.ElementType;
}

export function Select({ error, options, placeholder, className = '', icon: Icon, ...props }: SelectProps) {
  return (
    <select
      className={`w-full rounded-md border ${
        error ? 'border-red-300' : 'border-secondary-bg'
      } shadow-sm px-4 py-2 bg-primary-bg text-primary-text focus:ring-accent focus:border-accent ${
        Icon ? 'pl-10' : ''
      } ${className}`}
      {...props}
    >
      {placeholder && (
        <option value="">{placeholder}</option>
      )}
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}