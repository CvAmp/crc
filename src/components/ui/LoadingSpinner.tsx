import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className = '' }: LoadingSpinnerProps) {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-accent ${className}`} />
    </div>
  );
}