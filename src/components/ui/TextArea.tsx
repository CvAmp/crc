import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function TextArea({ error, className = '', ...props }: TextAreaProps) {
  return (
    <textarea
      className={`w-full rounded-md border ${
        error ? 'border-red-300' : 'border-secondary-bg'
      } shadow-sm px-4 py-2 focus:ring-accent focus:border-accent bg-primary-bg text-primary-text ${className}`}
      {...props}
    />
  );
}