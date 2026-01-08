import React from 'react';

interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
}

export function LoadingOverlay({ loading, children }: LoadingOverlayProps) {
  if (!loading) return <>{children}</>;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    </div>
  );
}